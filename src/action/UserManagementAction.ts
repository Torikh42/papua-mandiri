"use server";

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";
import { checkRequiredRole } from "@/lib/authHelper";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

/**
 * Aksi untuk mencari dan mengambil daftar pengguna dengan pagination.
 * Hanya bisa diakses oleh super_admin.
 */
export const searchUsersAction = async (
  query: string,
  attribute: "user_name" | "user_email" | "location",
  page: number = 1,
  limit: number = 5
) => {
  try {
    const supabase = await createClient();
    await checkRequiredRole(supabase, "super_admin");

    const offset = (page - 1) * limit;

    let queryBuilder = supabase.from("User").select("*", { count: "exact" });

    // Terapkan filter pencarian jika ada query
    if (query && attribute) {
      queryBuilder = queryBuilder.ilike(attribute, `%${query}%`);
    }

    const { data, error, count } = await queryBuilder
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { success: true, data, total: count || 0 };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Aksi untuk menghapus pengguna dari sistem (Auth dan Database).
 * Membutuhkan Service Role Key.
 */
export const deleteUserAction = async (userId: string) => {
  try {
    const supabase = await createClient();
    await checkRequiredRole(supabase, "super_admin");

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Konfigurasi service role key tidak ditemukan.");
    }

    // Buat client khusus dengan hak akses admin
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Hapus user dari Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (authError && authError.message !== "User not found") {
      throw authError;
    }

    // Hapus juga dari tabel User publik kita
    const { error: dbError } = await supabase
      .from("User")
      .delete()
      .eq("id", userId);
    if (dbError) throw dbError;

    revalidatePath("/dashboard-superadmin");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
};
