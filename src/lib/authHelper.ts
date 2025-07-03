import type { SupabaseClient } from "@supabase/supabase-js";

// Definisikan tipe UserRole agar konsisten dengan ENUM di database Anda.
export type UserRole =
  | "user"
  | "admin_komunitas"
  | "admin_pemerintah"
  | "super_admin";

/**
 * @function checkRequiredRole
 * @description Fungsi helper untuk memeriksa apakah pengguna yang sedang login memiliki peran yang dibutuhkan.
 * @param supabase Instance Supabase client.
 * @param requiredRole Peran yang dibutuhkan untuk otorisasi (misal: "super_admin").
 * @returns {Promise<string>} userId jika pengguna memiliki peran yang valid, atau melempar Error.
 */
export const checkRequiredRole = async (
  supabase: SupabaseClient,
  requiredRole: UserRole
): Promise<string> => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    throw new Error("Kamu harus login untuk melakukan aksi ini.");
  }

  const userId = session.user.id;

  // Mengambil role user dari tabel 'User'
  const { data: userData, error: userError } = await supabase
    .from("User") // Ganti jika nama tabel Anda berbeda
    .select("role")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    console.error("Error fetching user data for role check:", userError);
    throw new Error("Gagal memuat data pengguna untuk otorisasi.");
  }

  if (userData.role !== requiredRole) {
    console.warn(
      `User ${userId} with role '${userData.role}' attempted to perform action requiring role '${requiredRole}'. Access denied.`
    );
    throw new Error(
      `Kamu tidak memiliki izin untuk melakukan aksi ini. Diperlukan peran: ${requiredRole}.`
    );
  }

  return userId;
};
