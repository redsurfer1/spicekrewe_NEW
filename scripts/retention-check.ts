import { createClient } from '@supabase/supabase-js';

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v.trim();
}

async function main() {
  const url = getEnv('SUPABASE_URL');
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  const sb = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: briefsCount, error: briefsErr } = await sb
    .from('briefs')
    .select('id', { count: 'exact', head: true })
    .lt('created_at', new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString())
    .in('status', ['cancelled', 'closed'])
    .is('deleted_at', null);

  if (briefsErr) {
    console.error('Error counting briefs eligible for retention:', briefsErr.message);
  }

  const { data: auditCount, error: auditErr } = await sb
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })
    .lt('created_at', new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000).toISOString());

  if (auditErr) {
    console.error('Error counting audit_logs eligible for deletion:', auditErr.message);
  }

  console.log('Retention compliance report');
  console.log('---------------------------');
  console.log(
    `Briefs eligible for soft-delete (>2y, cancelled/closed, not deleted): ${
      briefsCount?.length ?? (briefsErr ? 'error' : 0)
    }`,
  );
  console.log(
    `Audit logs eligible for deletion (>7y): ${
      auditCount?.length ?? (auditErr ? 'error' : 0)
    }`,
  );
}

main().catch((e) => {
  console.error('retention-check failed:', e instanceof Error ? e.message : e);
  process.exit(1);
});

