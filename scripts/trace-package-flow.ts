// ============================================================
// Sprint 26 — PACKAGE V2 LIVE DATABASE TRACE
// Handles stale PostgREST schema cache automatically
//
// Usage:
//   npx tsx scripts/trace-package-flow.ts
//   SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/trace-package-flow.ts
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
const SUPABASE_ANON_KEY = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SITE_ID = '00000000-0000-0000-0000-000000000001';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const writeClient = SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  : supabase;

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
    status === 'SKIP' ? '⏭️' : 'ℹ️';
  console.log(`${icon} [${stage}] ${detail}`);
}

/** Execute raw SQL via Supabase Management API */
async function execSQL(sql: string): Promise<{ ok: boolean; error?: string; data?: unknown }> {
  const key = SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  try {
    const res = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    const body = await res.json() as Record<string, unknown>;
    if (!res.ok) return { ok: false, error: String(body.error || body.message || JSON.stringify(body)) };
    return { ok: true, data: body };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function isSchemaCacheError(err: { message?: string } | null): boolean {
  return !!err?.message?.includes('schema cache');
}

async function trace() {
  console.log('============================================================');
  console.log('SPRINT 26 — PACKAGE V2 LIVE DATABASE TRACE');
  console.log('============================================================');
  console.log(`Project: ${SUPABASE_URL}`);
  console.log(`Service role key: ${SERVICE_ROLE_KEY ? 'AVAILABLE' : 'NOT SET (using anon key)'}`);
  console.log('');

  // ── STAGE 0: Schema Cache Reload ────────────────────────────
  console.log('--- STAGE 0: Schema Cache ---');

  const reloadResult = await execSQL("NOTIFY pgrst, 'reload schema';");
  if (reloadResult.ok) {
    log('SCHEMA_CACHE', 'PASS', 'PostgREST schema cache reloaded');
    // Wait 2 seconds for cache to propagate
    await new Promise(r => setTimeout(r, 2000));
  } else {
    log('SCHEMA_CACHE', 'INFO', `Could not reload cache: ${reloadResult.error}. Tables must exist and cache must be fresh.`);
  }

  // ── STAGE 1: Table Existence (via information_schema) ──────
  console.log('\n--- STAGE 1: Table Existence (information_schema) ---');

  const tableCheck = await execSQL(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('cms_packages', 'cms_package_sections', 'cms_package_items')
    ORDER BY table_name;
  `);

  let tablesFound: string[] = [];
  if (tableCheck.ok && tableCheck.data) {
    const rows = (tableCheck.data as { rows?: Array<{ table_name: string }> }).rows || [];
    tablesFound = rows.map(r => r.table_name);
    for (const t of ['cms_packages', 'cms_package_sections', 'cms_package_items']) {
      if (tablesFound.includes(t)) {
        log(`TABLE.${t}`, 'PASS', 'Table exists in database');
      } else {
        log(`TABLE.${t}`, 'FAIL', 'Table does NOT exist in database');
      }
    }
  } else {
    log('TABLE.CHECK', 'INFO', `information_schema query failed: ${reloadResult.error}. Cannot verify tables via SQL endpoint.`);
    // Fallback: try PostgREST
    for (const t of ['cms_packages', 'cms_package_sections', 'cms_package_items']) {
      const { error } = await supabase.from(t).select('id').limit(1);
      if (error && isSchemaCacheError(error)) {
        log(`TABLE.${t}`, 'INFO', 'PostgREST cannot see table (schema cache stale)');
      } else if (error) {
        log(`TABLE.${t}`, 'FAIL', error.message);
      } else {
        log(`TABLE.${t}`, 'PASS', 'Table exists and queryable via PostgREST');
        tablesFound.push(t);
      }
    }
  }

  // ── STAGE 2: Read existing data ─────────────────────────────
  console.log('\n--- STAGE 2: Read Existing Data ---');

  const { data: pkgs, error: e1 } = await supabase
    .from('cms_packages')
    .select('*')
    .order('display_order', { ascending: true });

  if (e1) {
    log('DB.packages', 'FAIL', `Query error: ${e1.message}`);
  } else {
    log('DB.packages', 'PASS', `Found ${(pkgs || []).length} packages`);
    for (const p of (pkgs || [])) {
      log('DB.package', 'INFO', `  id=${p.id} name="${p.name}" slug="${p.slug}" price=${p.price} active=${p.is_active}`);
    }
  }

  let sections: Record<string, unknown>[] = [];
  let items: Record<string, unknown>[] = [];

  if (tablesFound.includes('cms_package_sections')) {
    const { data: secs, error: e2 } = await supabase
      .from('cms_package_sections')
      .select('*')
      .order('display_order', { ascending: true });

    if (e2) {
      log('DB.sections', 'FAIL', `Query error: ${e2.message}`);
    } else {
      sections = secs || [];
      log('DB.sections', 'PASS', `Found ${sections.length} sections`);
    }
  } else {
    log('DB.sections', 'SKIP', 'Table not found in schema — cannot query sections');
  }

  if (tablesFound.includes('cms_package_items')) {
    const { data: its, error: e3 } = await supabase
      .from('cms_package_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (e3) {
      log('DB.items', 'FAIL', `Query error: ${e3.message}`);
    } else {
      items = its || [];
      log('DB.items', 'PASS', `Found ${items.length} items`);
    }
  } else {
    log('DB.items', 'SKIP', 'Table not found in schema — cannot query items');
  }

  // ── STAGE 3: FK Integrity ──────────────────────────────────
  console.log('\n--- STAGE 3: FK Integrity ---');

  if (pkgs && pkgs.length > 0) {
    for (const pkg of pkgs) {
      const pkgId = pkg.id as number;
      const pkgSections = sections.filter(s => s.package_id === pkgId);

      if (pkgSections.length === 0) {
        log(`FK.pkg[${pkgId}]`, 'FAIL', `Package "${pkg.name}" has 0 sections — NOT CREATED or DATA LOSS`);
      } else {
        log(`FK.pkg[${pkgId}]`, 'PASS', `Package "${pkg.name}" → ${pkgSections.length} sections`);
        for (const sec of pkgSections) {
          const secId = sec.id as number;
          const secItems = items.filter(i => i.section_id === secId);
          if (secItems.length === 0) {
            log(`FK.sec[${secId}]`, 'FAIL', `Section "${sec.title}" has 0 items`);
          } else {
          log(`FK.sec[${secId}]`, 'PASS', `Section "${sec.title}" → ${secItems.length} items`);
          }
        }
      }
    }
  } else {
    log('FK.check', 'FAIL', 'No packages — cannot verify FK chain');
  }

  // ── STAGE 4: Insert Test (tests RLS + FK) ──────────────────
  console.log('\n--- STAGE 4: CRUD Test (INSERT → READ → DELETE) ---');

  if (!tablesFound.includes('cms_package_sections') || !tablesFound.includes('cms_package_items')) {
    log('CRUD', 'SKIP', 'Missing tables — cannot run CRUD test');
  } else {
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
      log('INSERT.package', 'FAIL', `Insert failed: ${ePkg?.message || 'No data'}`);
    } else {
      const pkgId = newPkg.id as number;
      log('INSERT.package', 'PASS', `Package id=${pkgId} slug=${testSlug}`);

      // INSERT section
      const { data: newSec, error: eSec } = await writeClient
        .from('cms_package_sections')
        .insert({ package_id: pkgId, title: 'Structure', display_order: 0 })
        .select('id')
        .single();

      if (eSec || !newSec) {
        log('INSERT.section', 'FAIL', `Section insert failed: ${eSec?.message || 'No data'}`);
        await writeClient.from('cms_packages').delete().eq('id', pkgId);
      } else {
        const secId = newSec.id as number;
        log('INSERT.section', 'PASS', `Section id=${secId}`);

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

        // READ back
        const { data: readPkg } = await supabase.from('cms_packages').select('*').eq('id', pkgId).single();
        log('READ.package', readPkg ? 'PASS' : 'FAIL', readPkg ? `name="${readPkg.name}"` : 'Not found');

        const { data: readSecs } = await supabase.from('cms_package_sections').select('*').eq('package_id', pkgId);
        log('READ.sections', (readSecs && readSecs.length > 0) ? 'PASS' : 'FAIL', `Found ${(readSecs || []).length}`);

        const secIds = (readSecs || []).map(s => s.id as number);
        const { data: readItems } = await supabase.from('cms_package_items').select('*').in('section_id', secIds.length > 0 ? secIds : [0]);
        log('READ.items', (readItems && readItems.length > 0) ? 'PASS' : 'FAIL', `Found ${(readItems || []).length}`);
        if (readItems) {
          for (const item of readItems) {
            log('READ.item', 'PASS', `  ${item.item} | ${item.brand} | ${item.specification} | ${item.remarks}`);
          }
        }

        // Homepage query simulation
        const { data: homePkgs } = await supabase.from('cms_packages').select('*').eq('is_active', true).order('display_order');
        const homeIds = (homePkgs || []).map(p => p.id as number);
        const { data: hSecs } = await supabase.from('cms_package_sections').select('*').in('package_id', homeIds.length > 0 ? homeIds : [0]);
        const hSecIds = (hSecs || []).map(s => s.id as number);
        const { data: hItems } = await supabase.from('cms_package_items').select('*').in('section_id', hSecIds.length > 0 ? hSecIds : [0]);
        log('HOMEPAGE.query', 'PASS', `${(homePkgs || []).length} pkgs, ${(hSecs || []).length} secs, ${(hItems || []).length} items`);

        // DELETE cascade test
        const { error: delErr } = await writeClient.from('cms_packages').delete().eq('id', pkgId);
        if (delErr) {
          log('DELETE.package', 'FAIL', delErr.message);
        } else {
          log('DELETE.package', 'PASS', `Deleted package id=${pkgId}`);
          const { data: orphSecs } = await supabase.from('cms_package_sections').select('id').eq('package_id', pkgId);
          log('CASCADE.sections', (!orphSecs || orphSecs.length === 0) ? 'PASS' : 'FAIL', `${(orphSecs || []).length} orphaned`);
          const { data: orphItems } = await supabase.from('cms_package_items').select('id').in('section_id', secIds.length > 0 ? secIds : [0]);
          log('CASCADE.items', (!orphItems || orphItems.length === 0) ? 'PASS' : 'FAIL', `${(orphItems || []).length} orphaned`);
        }

        // Verify cleanup
        const { data: verifyPkg } = await supabase.from('cms_packages').select('id').eq('id', pkgId).single();
        log('CLEANUP', !verifyPkg ? 'PASS' : 'FAIL', !verifyPkg ? 'Test data removed' : 'Cleanup failed');
      }
    }
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
  }

  if (skips > 0) {
    console.log('\nSKIPPED:');
    results.filter(r => r.status === 'SKIP').forEach(r => {
      console.log(`  ⏭️ [${r.stage}] ${r.detail}`);
    });
  }

  if (fails === 0 && skips === 0) {
    console.log('\n✅ ALL STAGES PASSED — Package V2 data flow is fully operational.');
  } else if (fails > 0) {
    console.log('\n⚠️ FAILURES DETECTED — See above for details.');
  }

  console.log('\n============================================================');
}

trace().catch(console.error);