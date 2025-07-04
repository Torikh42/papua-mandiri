// actions/savedMateriAction.ts
"use server";

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";
import { checkRequiredRole } from "@/lib/authHelper";
import { Materi } from "@/components//MateriCard";

/**
 * @function saveMateriAction
 * @description Menyimpan materi ke daftar simpanan pengguna.
 * @param materiId ID materi yang akan disimpan.
 * @returns {Promise<{ success: boolean; errorMessage: string | null; }>} Hasil operasi.
 */
export const saveMateriAction = async (materiId: string) => {
  try {
    const supabase = await createClient();
    const userId = await checkRequiredRole(supabase, "user");

    const { error } = await supabase.from("saved_materials").insert({
      user_id: userId,
      materi_id: materiId,
      // created_at: new Date().toISOString(), // Opsional: Berikan nilai eksplisit jika default DB bermasalah
    });

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          errorMessage: "Materi ini sudah ada di daftar simpanan Anda.",
        };
      }
      console.error("Error saving materi:", error); // Log error asli
      throw error; // Lempar error agar handleError bisa memprosesnya
    }

    return { success: true, errorMessage: null };
  } catch (error) {
    return handleError(error); // handleError akan mengembalikan { errorMessage: string }
  }
};

/**
 * @function removeSavedMateriAction
 * @description Menghapus materi dari daftar simpanan pengguna.
 * @param materiId ID materi yang akan dihapus dari simpanan.
 * @returns {Promise<{ success: boolean; errorMessage: string | null; }>} Hasil operasi.
 */
export const removeSavedMateriAction = async (materiId: string) => {
  try {
    const supabase = await createClient();
    const userId = await checkRequiredRole(supabase, "user");

    const { error } = await supabase
      .from("saved_materials")
      .delete()
      .eq("user_id", userId)
      .eq("materi_id", materiId);

    if (error) {
      console.error("Error removing saved materi:", error);
      throw error;
    }

    return { success: true, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * @function getSavedMaterialsAction
 * @description Mengambil semua materi yang disimpan oleh pengguna yang sedang login.
 * @returns {Promise<{ savedMateriList?: Materi[]; errorMessage: string | null; }>} Daftar materi yang disimpan.
 */
export const getSavedMaterialsAction = async () => {
  try {
    const supabase = await createClient();
    const userId = await checkRequiredRole(supabase, "user");

    const { data, error } = await supabase
      .from("saved_materials")
      .select("materi:materi_id(*, Kategori:Kategori(id, judul))")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching saved materials from Supabase:", error);
      throw error;
    }

    // --- PERBAIKAN: Gunakan .flatMap() untuk mengubah dan meratakan array ---
    const savedMateriList =
      (data
        ?.flatMap((item) => item.materi) // Mengubah [[m1], [m2]] menjadi [m1, m2]
        .filter((m) => m !== null) as Materi[]) || []; // Filter item null jika ada

    return { savedMateriList, errorMessage: null };
  } catch (error) {
    return { savedMateriList: [], ...handleError(error) };
  }
};
/**
 * @function isMateriSavedAction
 * @description Memeriksa apakah materi tertentu sudah disimpan oleh pengguna yang sedang login.
 * @param materiId ID materi yang akan diperiksa.
 * @returns {Promise<{ isSaved: boolean; errorMessage: string | null; }>} Hasil pemeriksaan.
 */
export const isMateriSavedAction = async (materiId: string) => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { isSaved: false, errorMessage: null };
    }

    const { count, error } = await supabase
      .from("saved_materials")
      .select("materi_id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("materi_id", materiId);

    if (error) {
      console.error("Error checking if materi is saved:", error);
      throw error;
    }

    return { isSaved: (count || 0) > 0, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};
