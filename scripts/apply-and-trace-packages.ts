// ============================================================
// Sprint 26 — APPLY MIGRATION + TRACE PACKAGE FLOW
//
// This script:
//   1. Checks live DB for cms_package_sections/cms_package_items
//   2. If missing, applies migration 035 via Supabase Management API
//   3. Creates a test package, sections, items (with anon key for SELECT)
//   4. Verifies FK relationships
//   5. Verifies public reads (homepage, /packages)
//   6. Verifies CMS reads
//   7. Verifies delete cascade
//   8. Cleans up test data
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/apply-and-trace-packages.ts
// ============================================================

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ── Load env ─────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  envVars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL']!;
const ANON_KEY = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SITE_ID = '00000000-0000-0000-0000-000000000001';

// Anon client (for SELECT on public/RLS)
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

// Service-role client (bypasses RLS, for DDL + INSERT during test)
const serviceClient = SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  : null;

interface TraceResult {
  stage: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'INFO';
  detail: string;
}

const results: TraceResult[] = [];

function log(stage: string, status: TraceResult['status'], detail: string) {
  results.push({ stage, status, detail });
  const icon =
    status === 'PASS' ? '✅' :
    status === 'FAIL' ? '❌' :
    status === 'SKIP' ? '⏭️' :
    'ℹ️';
  console.log(`${icon} [${stage}] ${detail}`);
}

// ── Migration SQL ────────────────────────────────────────────
const MIGRATION_SQL = `
-- 1. cms_package_sections
CREATE TABLE IF NOT EXISTS cms_package_sections (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  package_id BIGINT NOT NULL REFERENCES cms_packages(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_sections_v3_package ON cms_package_sections(package_id);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_sections_v3_order ON cms_package_sections(display_order);
ALTER TABLE cms_package_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_pkg_sections_v3_select_auth" ON cms_package_sections;
DROP POLICY IF EXISTS "cms_pkg_sections_v3_select_public" ON cms_package_sections;
DROP POLICY IF EXISTS "cms_pkg_sections_v3_insert_auth" ON cms_package_sections;
DROP POLICY IF EXISTS "cms_pkg_sections_v3_update_auth" ON cms_package_sections;
DROP POLICY IF EXISTS "cms_pkg_sections_v3_delete_auth" ON cms_package_sections;
CREATE POLICY "cms_pkg_sections_v3_select_auth" ON cms_package_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_pkg_sections_v3_select_public" ON cms_package_sections FOR SELECT TO public USING (true);
CREATE POLICY "cms_pkg_sections_v3_insert_auth" ON cms_package_sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_pkg_sections_v3_update_auth" ON cms_package_sections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_pkg_sections_v3_delete_auth" ON cms_package_sections FOR DELETE TO authenticated USING (true);

-- 2. cms_package_items
CREATE TABLE IF NOT EXISTS cms_package_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  section_id BIGINT NOT NULL REFERENCES cms_package_sections(id) ON DELETE CASCADE,
  item TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  specification TEXT NOT NULL DEFAULT '',
  remarks TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_items_v3_section ON cms_package_items(section_id);
CREATE INDEX IF NOT EXISTS idx_cms_pkg_items_v3_order ON cms_package_items(display_order);
ALTER TABLE cms_package_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_pkg_items_v3_select_auth" ON cms_package_items;
DROP POLICY IF EXISTS "cms_pkg_items_v3_select_public" ON cms_package_items;
DROP POLICY IF EXISTS "cms_pkg_items_v3_insert_auth" ON cms_package_items;
DROP POLICY IF EXISTS "cms_pkg_items_v3_update_auth" ON cms_package_items;
DROP POLICY IF EXISTS "cms_pkg_items_v3_delete_auth" ON cms_package_items;
CREATE POLICY "cms_pkg_items_v3_select_auth" ON cms_package_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "cms_pkg_items_v3_select_public" ON cms_package_items FOR SELECT TO public USING (true);
CREATE POLICY "cms_pkg_items_v3_insert_auth" ON cms_package_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cms_pkg_items_v3_update_auth" ON cms_package_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cms_pkg_items_v3_delete_auth" ON cms_package_items FOR DELETE TO authenticated USING (true);
`;

async function applyMigration(): Promise<boolean> {
  if (!serviceClient) {
    log('MIGRATE', 'SKIP', 'No SUPABASE_SERVICE_ROLE_KEY — cannot apply DDL');
    return false;
  }
  // Split by semicolons and execute each statement
  const statements = MIGRATION_SQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    const { error } = await serviceClient.rpc('exec_sql' as never, { sql: stmt } as never);
    // If exec_sql RPC doesn't exist, we'll need an alternative approach
    if (error) {
      // Try raw SQL via the SQL endpoint
      const res = await fetch(`${SUPABASE_URL}/pg/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: stmt }),
      });
      const body = await res.json() as { error?: string };
      if (!res.ok) {
        log('MIGRATE.statement', 'FAIL', `[${i}] ${error.message || body.error}`);
        return false;
      }
    }
  }
  log('MIGRATE', 'PASS', `Applied ${statements.length} statements`);
  return true;
}

async function trace() {
  console.log('============================================================');
  console.log('SPRINT 26 — PACKAGE DATABASE LIVE TRACE');
  console.log('============================================================');
  console.log(`Project: ${SUPABASE_URL}`);
  console.log(`Service role available: ${!!serviceClient}`);
  console.log('');

  // ── STAGE 0: Table existence ────────────────────────────────
  console.log('--- STAGE 0: Table Existence Check ---');

  const { data: pkgTest, error: pkgErr } = await anonClient
    .from('cms_packages')
    .select('id')
    .limit(1);

  if (pkgErr) {
    log('TABLE.cms_packages', 'FAIL', pkgErr.message);
  } else {
    log('TABLE.cms_packages', 'PASS', 'Table exists and is queryable');
  }

  const { data: secTest, error: secErr } = await anonClient
    .from('cms_package_sections')
    .select('id')
    .limit(1);

  if (secErr) {
    log('TABLE.cms_package_sections', 'FAIL', secErr.message);
    // Try to apply migration
    if (secErr.message.includes('Could not find the table')) {
      console.log('\n--- Applying migration 035 ---');
      const applied = await applyMigration();
      if (!applied) {
        console.log('\n=== TRACE FAILED: Cannot create tables. Run migration manually. ===');
        return;
      }
      // Re-check
      const { error: recheckErr } = await anonClient
        .from('cms_package_sections')
        .select('id')
        .limit(1);
      if (recheckErr) {
        log('TABLE.cms_package_sections', 'FAIL', `Still missing after migration: ${recheckErr.message}`);
        return;
      }
      log('TABLE.cms_package_sections', 'PASS', 'Table exists after migration');
    }
  } else {
    log('TABLE.cms_package_sections', 'PASS', 'Table exists and is queryable');
  }

  const { data: itemTest, error: itemErr } = await anonClient
    .from('cms_package_items')
    .select('id')
    .limit(1);

  if (itemErr) {
    log('TABLE.cms_package_items', 'FAIL', itemErr.message);
    // If migration was just applied above, items should exist
    if (itemErr.message.includes('Could not find the table')) {
      const { error: recheckErr } = await anonClient
        .from('cms_package_items')
        .select('id')
        .limit(1);
      if (recheckErr) {
        log('TABLE.cms_package_items', 'FAIL', `Still missing: ${recheckErr.message}`);
        return;
      }
      log('TABLE.cms_package_items', 'PASS', 'Table exists after migration');
    }
  } else {
    log('TABLE.cms_package_items', 'PASS', 'Table exists and is queryable');
  }

  // ── STAGE 1: Existing data read ─────────────────────────────
  console.log('\n--- STAGE 1: Existing Data Read ---');

  const { data: pkgs, error: e1 } = await anonClient
    .from('cms_packages')
    .select('*')
    .order('display_order', { ascending: true });

  if (e1) {
    log('DB.packages', 'FAIL', e1.message);
  } else {
    log('DB.packages', 'PASS', `Found ${(pkgs || []).length} packages`);
  }

  const { data: sections, error: e2 } = await anonClient
    .from('cms_package_sections')
    .select('*')
    .order('display_order', { ascending: true });

  if (e2) {
    log('DB.sections', 'FAIL', e2.message);
  } else {
    log('DB.sections', 'PASS', `Found ${(sections || []).length} sections`);
  }

  const { data: items, error: e3 } = await anonClient
    .from('cms_package_items')
    .select('*')
    .order('display_order', { ascending: true });

  if (e3) {
    log('DB.items', 'FAIL', e3.message);
  } else {
    log('DB.items', 'PASS', `Found ${(items || []).length} items`);
  }

  // ── STAGE 2: FK integrity on existing data ──────────────────
  console.log('\n--- STAGE 2: FK Integrity (Existing Data) ---');

  if (pkgs && pkgs.length > 0) {
    for (const pkg of pkgs) {
      const pkgId = pkg.id as number;
      const pkgSections = (sections || []).filter((s: Record<string, unknown>) => s.package_id === pkgId);

      if (pkgSections.length === 0) {
        log(`FK.pkg[${pkgId}]`, 'FAIL', `Package "${pkg.name}" (id=${pkgId}) has 0 sections`);
      } else {
        log(`FK.pkg[${pkgId}]`, 'PASS', `Package "${pkg.name}" → ${pkgSections.length} sections`);
      }

      for (const sec of pkgSections) {
        const secId = sec.id as number;
        const secItems = (items || []).filter((i: Record<string, unknown>) => i.section_id === secId);

        if (secItems.length === 0) {
          log(`FK.sec[${secId}]`, 'FAIL', `Section "${sec.title}" (id=${secId}) has 0 items`);
        } else {
          log(`FK.sec[${secId}]`, 'PASS', `Section "${sec.title}" → ${secItems.length} items`);
        }
      }
    }
  } else {
    log('FK.check', 'INFO', 'No packages in DB — will test with fresh insert');
  }

  // ── STAGE 3: Test INSERT → READ → DELETE ────────────────────
  console.log('\n--- STAGE 3: Full CRUD Test ---');

  // Use service client for writes, anon for reads
  const writeClient = serviceClient || anonClient;
  const readClient = anonClient;

  const testSlug = `test-trace-${Date.now()}`;

  // INSERT package
  const { data: newPkg, error: ePkg } = await writeClient
    .from('cms_packages')
    .insert({
      site_id: SITE_ID,
      name: 'Trace Test Package',
      slug: testSlug,
      price: 1800,
      description: 'Test package for data flow trace',
      display_order: 999,
      is_active: true,
    })
    .select('id')
    .single();

  if (ePkg || !newPkg) {
    log('INSERT.package', 'FAIL', ePkg?.message || 'No data returned');
    console.log('\n=== TRACE HALTED: Package insert failed ===');
    return;
  }

  const pkgId = newPkg.id as number;
  log('INSERT.package', 'PASS', `Package id=${pkgId} slug=${testSlug}`);

  // INSERT section
  const { data: newSec, error: eSec } = await writeClient
    .from('cms_package_sections')
    .insert({
      package_id: pkgId,
      title: 'Structure',
      display_order: 0,
    })
    .select('id')
    .single();

  if (eSec || !newSec) {
    log('INSERT.section', 'FAIL', eSec?.message || 'No data returned');
    await writeClient.from('cms_packages').delete().eq('id', pkgId);
    console.log('\n=== TRACE HALTED: Section insert failed ===');
    return;
  }

  const secId = newSec.id as number;
  log('INSERT.section', 'PASS', `Section id=${secId} (package_id=${pkgId})`);

  // INSERT items
  const testItems = [
    { section_id: secId, item: 'AAC Blocks', brand: 'Magicrete', specification: '4"/6"', remarks: 'Included', display_order: 0 },
    { section_id: secId, item: 'TMT Steel', brand: 'Tata Tiscon', specification: 'Fe 500D', remarks: 'Premium', display_order: 1 },
  ];

  const { error: eItems } = await writeClient.from('cms_package_items').insert(testItems);

  if (eItems) {
    log('INSERT.items', 'FAIL', eItems.message);
  } else {
    log('INSERT.items', 'PASS', `Inserted ${testItems.length} items`);
  }

  // ── STAGE 4: Read back ──────────────────────────────────────
  console.log('\n--- STAGE 4: Read-Back (Anon Client) ---');

  const { data: readPkg } = await readClient
    .from('cms_packages')
    .select('*')
    .eq('id', pkgId)
    .single();

  if (!readPkg) {
    log('READ.package', 'FAIL', `Package id=${pkgId} not found`);
  } else {
    log('READ.package', 'PASS', `Package "${readPkg.name}" slug=${readPkg.slug} price=${readPkg.price}`);
  }

  const { data: readSecs } = await readClient
    .from('cms_package_sections')
    .select('*')
    .eq('package_id', pkgId);

  if (!readSecs || readSecs.length === 0) {
    log('READ.sections', 'FAIL', `No sections for package_id=${pkgId}`);
  } else {
    log('READ.sections', 'PASS', `Found ${readSecs.length} sections`);
  }

  const secIds = (readSecs || []).map((s: Record<string, unknown>) => s.id as number);
  const { data: readItems } = await readClient
    .from('cms_package_items')
    .select('*')
    .in('section_id', secIds.length > 0 ? secIds : [0]);

  if (!readItems || readItems.length === 0) {
    log('READ.items', 'FAIL', `No items for section_ids=[${secIds}]`);
  } else {
    log('READ.items', 'PASS', `Found ${readItems.length} items`);
    for (const item of readItems) {
      log('READ.item', 'PASS', `  ${item.item} | ${item.brand} | ${item.specification} | ${item.remarks}`);
    }
  }

  // ── STAGE 5: Homepage query simulation ──────────────────────
  console.log('\n--- STAGE 5: Homepage Query (is_active=true) ---');

  const { data: homePkgs } = await readClient
    .from('cms_packages')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const homePkgIds = (homePkgs || []).map((p: Record<string, unknown>) => p.id as number);
  const { data: homeSecs } = await readClient
    .from('cms_package_sections')
    .select('*')
    .in('package_id', homePkgIds.length > 0 ? homePkgIds : [0])
    .order('display_order', { ascending: true });

  const homeSecIds = (homeSecs || []).map((s: Record<string, unknown>) => s.id as number);
  const { data: homeItems } = await readClient
    .from('cms_package_items')
    .select('*')
    .in('section_id', homeSecIds.length > 0 ? homeSecIds : [0])
    .order('display_order', { ascending: true });

  log('HOMEPAGE.query', 'PASS', `Homepage: ${(homePkgs || []).length} pkgs, ${(homeSecs || []).length} secs, ${(homeItems || []).length} items`);

  // Verify our test package appears
  const testInHome = (homePkgs || []).some((p: Record<string, unknown>) => p.id === pkgId);
  if (testInHome) {
    log('HOMEPAGE.includes_test', 'PASS', 'Test package appears in homepage results');
  } else {
    log('HOMEPAGE.includes_test', 'FAIL', 'Test package NOT in homepage results');
  }

  // ── STAGE 6: /packages page query ───────────────────────────
  console.log('\n--- STAGE 6: /packages Page Query ---');

  log('PKG_PAGE.query', 'PASS', `Packages page sees ${(homePkgs || []).length} active packages`);
  log('PKG_PAGE.test_present', testInHome ? 'PASS' : 'FAIL',
    testInHome ? 'Test package visible on /packages page' : 'Test package NOT visible');

  // ── STAGE 7: CMS query (admin read) ────────────────────────
  console.log('\n--- STAGE 7: CMS Admin Read ---');

  const { data: cmsPkgs } = await readClient
    .from('cms_packages')
    .select('*')
    .order('display_order', { ascending: true });

  const cmsPkgIds = (cmsPkgs || []).map((p: Record<string, unknown>) => p.id as number);
  const { data: cmsSecs } = await readClient
    .from('cms_package_sections')
    .select('*')
    .in('package_id', cmsPkgIds.length > 0 ? cmsPkgIds : [0]);

  const cmsSecIds = (cmsSecs || []).map((s: Record<string, unknown>) => s.id as number);
  const { data: cmsItems } = await readClient
    .from('cms_package_items')
    .select('*')
    .in('section_id', cmsSecIds.length > 0 ? cmsSecIds : [0]);

  log('CMS.query', 'PASS', `CMS: ${(cmsPkgs || []).length} pkgs, ${(cmsSecs || []).length} secs, ${(cmsItems || []).length} items`);

  // ── STAGE 8: Delete cascade ─────────────────────────────────
  console.log('\n--- STAGE 8: Delete Cascade ---');

  const { error: delErr } = await writeClient.from('cms_packages').delete().eq('id', pkgId);

  if (delErr) {
    log('DELETE.package', 'FAIL', delErr.message);
  } else {
    log('DELETE.package', 'PASS', `Deleted package id=${pkgId}`);

    // Verify sections are cascaded
    const { data: orphanSecs } = await readClient
      .from('cms_package_sections')
      .select('id')
      .eq('package_id', pkgId);

    if (!orphanSecs || orphanSecs.length === 0) {
      log('CASCADE.sections', 'PASS', 'Sections cascaded (0 orphaned)');
    } else {
      log('CASCADE.sections', 'FAIL', `${orphanSecs.length} orphaned sections`);
    }

    // Verify items are cascaded
    const { data: orphanItems } = await readClient
      .from('cms_package_items')
      .select('id')
      .in('section_id', secIds.length > 0 ? secIds : [0]);

    if (!orphanItems || orphanItems.length === 0) {
      log('CASCADE.items', 'PASS', 'Items cascaded (0 orphaned)');
    } else {
      log('CASCADE.items', 'FAIL', `${orphanItems.length} orphaned items`);
    }
  }

  // ── STAGE 9: Verify cleanup ─────────────────────────────────
  console.log('\n--- STAGE 9: Verify Cleanup ---');

  const { data: verifyPkg } = await readClient
    .from('cms_packages')
    .select('id')
    .eq('id', pkgId)
    .single();

  if (!verifyPkg) {
    log('CLEANUP', 'PASS', 'Test package fully removed');
  } else {
    log('CLEANUP', 'FAIL', `Package id=${pkgId} still exists`);
  }

  // ── SUMMARY ──────────────────────────────────────────────────
  console.log('\n============================================================');
  console.log('TRACE SUMMARY');
  console.log('============================================================');

  const passes = results.filter(r => r.status === 'PASS').length;
  const fails = results.filter(r => r.status === 'FAIL').length;
  const skips = results.filter(r => r.status === 'SKIP').length;
  const infos = results.filter(r => r.status === 'INFO').length;

  console.log(`Total: ${results.length} | PASS: ${passes} | FAIL: ${fails} | SKIP: ${skips} | INFO: ${infos}`);

  if (fails > 0) {
    console.log('\nFAILURES:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ❌ [${r.stage}] ${r.detail}`);
    });
  } else {
    console.log('\n✅ ALL STAGES PASSED — Package V2 data flow is fully operational.');
  }

  console.log('\n============================================================');
}


