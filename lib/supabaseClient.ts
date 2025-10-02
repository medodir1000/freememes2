
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

const supabaseUrl = "https://swpynrjlochokyqxqeoz.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cHlucmpsb2Nob2t5cXhxZW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNDQyNjEsImV4cCI6MjA3NDcyMDI2MX0.HO-5W55ThBaI-oSA4gxVE-SM9C0mwhpuTXOWuSzvQAI"

// Custom fetcher to add options to every Supabase request.
// This helps bypass potential caching issues in some network environments that can cause fetch errors.
const customFetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    cache: 'no-cache',
  });
};

// Use the Database generic to get type-safety
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    global: {
        fetch: customFetch
    }
})
