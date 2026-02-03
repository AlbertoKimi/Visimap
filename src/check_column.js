import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://vpetkpmxeopozhqizsqx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXRrcG14ZW9wb3pocWl6c3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzY0MTUsImV4cCI6MjA3ODQ1MjQxNX0.sVooRLG4r_wd2cHNMCngTUPBWnCAVbCwoyibVjoWou8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('profiles').select('estado').limit(1);
    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Column exists or read success');
    }
}
check();
