import re
import os

# === 1. Add new fields to types ===
types_path = 'App/dashboard/cms/types.ts'
with open(types_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """  /** Webhook URL for external integrations */
  webhook_url: string;">
new_block = """  /** Webhook URL for external integrations */
  webhook_url: string;
  /** Whether webhook forwarding is enabled */
  webhook_enabled: boolean;
  /** Secret token for webhook authentication */
  webhook_secret: string;"""

if 'webhook_enabled' in content:
    print('[SKIP] types.ts already has webhook_enabled')
else:
    content = content.replace(old_block, new_block, 1)
    with open(types_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('[OK] types.ts updated with webhook_enabled and webhook_secret')

# === 2. Update saveInternalSettings action ===
actions_path = 'App/dashboard/cms/actions.ts'
with open(actions_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add webhook_enabled and webhook_secret to fields array
old_fields = """    'google_sheet_url',
    'webhook_url',
    'whatsapp_api_number',
  ] as const;"""
new_fields = """    'google_sheet_url',
    'webhook_url',
    'webhook_secret',
    'whatsapp_api_number',
  ] as const;"""

if 'webhook_secret' in content and 'webhook_secret' in content.split('saveInternalSettings')[-1]:
    print('[SKIP] actions.ts already updated')
else:
    content = content.replace(old_fields, new_fields, 1)

    # Add webhook_enabled boolean payload line after resend_ready
    old_bools = """payload.smtp_ready = formData.get('smtp_ready') === 'on' ? 'true' : 'false';
payload.resend_ready = formData.get('resend_ready') === 'on' ? 'true' : 'false';"""
    new_bools = """payload.smtp_ready = formData.get('smtp_ready') === 'on' ? 'true' : 'false';
payload.resend_ready = formData.get('resend_ready') === 'on' ? 'true' : 'false';
payload.webhook_enabled = formData.get('webhook_enabled') === 'on' ? 'true' : 'false';"""

    content = content.replace(old_bools, new_bools, 1)
    with open(actions_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('[OK] actions.ts updated')

# === 3. Update API route to forward webhook ===
route_path = 'App/api/leads/route.ts'
with open(route_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'webhook_enabled' in content:
    print('[SKIP] route.ts already has webhook forwarding')
else:
    # Find the location after createLeadFromAPI call to add webhook forwarding
    # We'll add it right after the notification handling section
    # Look for where the response is returned or where notifications are dispatched

    # Add fetch to internal settings and forward lead
    webhook_code = '''
  // Forward lead to webhook if configured
  let webhookResult = null;
  try {
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('cms_internal_settings')
      .select('webhook_url, webhook_enabled, webhook_secret')
      .eq('id', 1)
      .single();

    if (!settingsError && settings?.webhook_url && settings?.webhook_enabled === true) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (settings.webhook_secret) {
        headers['x-webhook-secret'] = settings.webhook_secret;
      }
      const webhookRes = await fetch(settings.webhook_url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: 'lead.created',
          data: leadData,
        }),
      });
      webhookResult = { status: webhookRes.status, ok: webhookRes.ok };
    }
  } catch (webhookErr) {
    console.error('Webhook forwarding failed:', webhookErr);
    webhookResult = { status: 0, ok: false };
  }
'''

    # Find position to insert - after lead creation succeeds and notifications sent
    # Search for the success response
    response_match = re.search(r'return NextResponse\.json\(\s*\{[^}]*success:\s*true', content)
    if response_match:
        insert_pos = response_match.start()
        content = content[:insert_pos] + webhook_code + '\n' + content[insert_pos:]
        with open(route_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print('[OK] route.ts webhook forwarding added')
    else:
        print('[ERROR] Could not find success response in route.ts')
        print('  Route file debug - first 500 chars:')
        print(content[:500])

print('\n=== Done ===')
</｜｜DSML｜｜>
<task_progress>
- [x] Read current quote page
- [x] Read CMS settings types
- [x] Read existing settings form
- [x] Read leads API route
- [x] Read leads actions (createLeadFromAPI)
- [x] Read internal settings schema
- [x] Read leads types
- [x] Read contact leads schema
- [x] Rewrite quote page (no OAuth, 5-field form)
- [x] Fix lint/typo issues in quote page
- [ ] Add webhook forwarding to API route
- [ ] Add new fields to types
- [ ] Update saveInternalSettings action
- [ ] Update InternalSettingsForm with Lead Notification section
- [ ] Create DB migration
- [ ] Run build verification
- [ ] Return report
</task_progress>
</write_to_file>