"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Direkomendasikan: Gunakan getAll dan setAll
        getAll() {
          // Mengembalikan semua cookie sebagai array objek { name, value }
          return cookieStore.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `set` method is only available in a Server Component or Server Action.
            // This might happen if you're using a client-side component that is also
            // calling a Server Action, in which case the `cookies()` won't be available.
            // For now, we'll just log the error.
            console.warn('Failed to set cookie in createClient:', error);
          }
        },
        // 'get', 'set', dan 'remove' individual sudah deprecated dan dihapus di sini
        // berdasarkan saran dari error message.
      },
    }
  );

  return client;
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth error in getUser:", authError);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile error in getUser:", profileError);
    return {
      id: user.id,
      email: user.email,
      name: user.email,
      role: "unknown", // Fallback ke role 'unknown'
    };
  }

  return {
    id: user.id,
    email: user.email,
    name: profile.username,
    role: profile.role,
  };
}