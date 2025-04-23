import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
const tables = ['biens', 'Locataires', 'Loyers', 'charges', 'letters'];

if (!url || !anon) {
  console.error('[ERREUR] Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(url, anon);

(async () => {
  let ok = true;
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`[ERREUR] Table absente : ${table}`, error.message);
      ok = false;
    } else {
      console.log(`[OK] Table trouvée : ${table}`);
    }
  }
  process.exit(ok ? 0 : 1);
})();
