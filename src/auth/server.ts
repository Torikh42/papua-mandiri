// auth/server.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStorePromise = cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookieStorePromise;
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookieStorePromise;
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            console.warn("Failed to set cookie in createClient:", error);
          }
        },
      },
    }
  );

  return client;
}

// Definisikan tipe UserRole agar konsisten dengan ENUM di database Anda.
export type UserRole = "user" | "admin_komunitas" | "admin_pemerintah" | "super_admin";

/**
 * @typedef {object} UserData
 * @property {string} id - ID unik pengguna dari Supabase Auth.
 * @property {string | null} email - Alamat email pengguna.
 * @property {string | null} name - Nama pengguna dari tabel profil (user_name).
 * @property {UserRole | "unknown"} role - Peran pengguna (dari tabel profil) atau "unknown" sebagai fallback.
 */
type UserData = {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole | "unknown";
} | null;

/**
 * @function getUser
 * @description Mengambil data pengguna yang sedang login beserta detail profilnya dari database.
 * @returns {Promise<UserData>} Objek data pengguna atau null jika tidak ada pengguna login/terjadi error.
 */
export async function getUser(): Promise<UserData> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth error in getUser:", authError?.message || "User not found in Supabase Auth.");
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("User") // Pastikan ini NAMA TABEL PROFIL ANDA (misal: "User")
    .select("user_name, user_email, role") // <-- Pastikan juga user_email diselect jika ada di DB
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile error in getUser:", profileError?.message || "Profile not found for user ID in 'User' table.");
    return {
      id: user.id,
      email: user.email ?? null, // Fallback ke email dari Auth user
      name: user.email ?? null,  // Fallback nama ke email jika profil tidak ada
      role: "unknown",
    };
  }

  return {
    id: user.id,
    email: profile.user_email ?? user.email ?? null, // Prefer user_email from profile, then auth email, then null
    name: profile.user_name ?? null, // Nama dari profil, fallback ke null
    role: profile.role as UserRole,
  };
}