"use server";

import { createClient } from "@/auth/server";
import { checkRequiredRole } from "@/lib/authHelper";
import { handleError } from "@/lib/utils";

export const getStatistikSuperAdminAction = async () => {
  try {
    const supabase = await createClient();
    // Pastikan hanya super admin yang bisa mengakses data ini
    await checkRequiredRole(supabase, "super_admin");

    // Menghitung total pengguna
    const { count: totalUsers, error: usersError } = await supabase
      .from("User")
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Menghitung total materi
    const { count: totalMateri, error: materiError } = await supabase
      .from("Materi")
      .select('*', { count: 'exact', head: true });

    if (materiError) throw materiError;
    
    // Kembalikan data yang berhasil diambil
    return {
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalMateri: totalMateri || 0,
      },
      errorMessage: null,
    };

  } catch (error) {
    return handleError(error);
  }
};