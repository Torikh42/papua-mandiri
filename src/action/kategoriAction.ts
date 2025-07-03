"use server";

import { createClient } from "@/auth/server"; // Untuk membuat Supabase client di server action
import { handleError } from "@/lib/utils"; // Fungsi helper untuk penanganan error umum
import { checkRequiredRole } from "@/lib/authHelper"; // Import helper otorisasi dan tipe role
import { categorySchema } from "@/schema/kategoriSchema";

/**
 * @function createCategoryAction
 * @description Menambah kategori baru ke database. Hanya dapat dilakukan oleh user dengan peran 'super_admin'.
 * @param formData FormData yang berisi  dan 'description' kategori.
 * @returns {Promise<{ success: boolean; errorMessage: string | null; category?: any }>} Hasil operasi.
 */
export const createCategoryAction = async (formData: FormData) => {
  try {
    // --- PERBAIKAN DI SINI ---
    // 1. Buat Supabase client terlebih dahulu
    const supabaseClient = await createClient();
    const userId = await checkRequiredRole(supabaseClient, "super_admin");

    const judul = formData.get("judul") as string;
    const description = formData.get("description") as string | null;

    // Validasi input menggunakan Zod schema
    const validationResult = categorySchema.safeParse({ judul, description });
    if (!validationResult.success) {
      const firstErrorMessage = validationResult.error.errors[0]?.message;
      console.warn(
        "⚠️ Server-side category validation failed:",
        validationResult.error.errors
      );
      throw new Error(firstErrorMessage || "Validasi data kategori gagal.");
    }

    // Insert data kategori ke tabel 'Kategori' menggunakan supabaseClient
    const { data, error } = await supabaseClient // <--- Gunakan supabaseClient di sini
      .from("Kategori") // Pastikan nama tabel Anda "Kategori"
      .insert({
        judul: validationResult.data.judul,
        description: validationResult.data.description,
      })
      .select(); // Mengembalikan data kategori yang baru di-insert

    if (error) {
      if (error.code === "23505") {
        // PostgreSQL unique violation error code
        throw new Error("Nama kategori sudah ada. Silakan gunakan nama lain.");
      }
      console.error("Supabase insert category error:", error);
      throw new Error(`Gagal menambah kategori: ${error.message}`);
    }

    return { success: true, errorMessage: null, category: data[0] };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * @function getAllCategoriesAction
 * @description Mengambil daftar semua kategori dari database. Dapat diakses oleh semua pengguna.
 * @returns {Promise<{ success: boolean; errorMessage: string | null; categories?: any[] }>} Daftar kategori.
 */
export const getAllCategoriesAction = async () => {
  try {
    const supabase = await createClient();
    // Tidak ada otorisasi role khusus, karena semua user bisa melihat kategori

    const { data, error } = await supabase
      .from("Kategori") // Pastikan nama tabel Anda "Kategori"
      .select("id, judul") // Hanya ambil ID dan judul untuk dropdown/list
      .order("judul", { ascending: true }); // Urutkan berdasarkan judul

    if (error) {
      console.error("Supabase get all categories error:", error);
      throw new Error(`Gagal memuat kategori: ${error.message}`);
    }

    return { success: true, categories: data, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};
