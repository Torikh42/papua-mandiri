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
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
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
            console.warn("Failed to set cookie in createClient:", error);
          }
        },
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
    .from("User")
    .select("user_name, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile error in getUser:", profileError);
    return {
      id: user.id,
      email: user.email,
      name: user.email,
      role: "unknown",
    };
  }

  return {
    id: user.id,
    email: user.email,
    name: profile.user_name,
    role: profile.role,
  };
}
