/**
 * TerraForte — Supabase Connection Checker
 * Run this from the browser console or import it in any component:
 *
 *   import { checkSupabaseConnection } from '../lib/supabaseCheck';
 *   checkSupabaseConnection().then(console.log);
 */
import { supabase, isSupabaseEnabled } from './supabase';

export async function checkSupabaseConnection() {
  const results = {
    credentialsPresent: isSupabaseEnabled,
    clientCreated: !!supabase,
    tables: {},
    authReachable: false,
    errors: [],
  };

  if (!supabase) {
    results.errors.push('No Supabase client — check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
    return results;
  }

  // 1. Verify auth endpoint is reachable
  try {
    const { error } = await supabase.auth.getSession();
    results.authReachable = !error;
    if (error) results.errors.push(`Auth error: ${error.message}`);
  } catch (e) {
    results.errors.push(`Auth unreachable: ${e.message}`);
  }

  // 2. Check each expected table exists by querying with limit 0
  const expectedTables = [
    'usuarios',
    'negociacoes',
    'aditivos_contratuais',
    'cobrancas_log',
    'provas_forenses',
    'denuncias',
    'pagamentos_plataforma',
    'notificacoes',
  ];

  for (const table of expectedTables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(0);
      if (error) {
        results.tables[table] = `❌ ${error.message}`;
        results.errors.push(`Table '${table}': ${error.message}`);
      } else {
        results.tables[table] = '✅ exists';
      }
    } catch (e) {
      results.tables[table] = `❌ ${e.message}`;
    }
  }

  results.allTablesOk = Object.values(results.tables).every((v) => v.startsWith('✅'));
  results.status = results.authReachable && results.allTablesOk ? '✅ CONNECTED' : '❌ ISSUES FOUND';
  return results;
}
