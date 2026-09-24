import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let storageClient: SupabaseClient | null = null;

export function getGalleryStorage() {
  if (storageClient) return storageClient;

  const url = process.env.SUPABASE_STORAGE_URL;
  const serviceRoleKey = process.env.SUPABASE_STORAGE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Gallery storage requires SUPABASE_STORAGE_URL and SUPABASE_STORAGE_SERVICE_ROLE_KEY"
    );
  }

  storageClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return storageClient;
}
