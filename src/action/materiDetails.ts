"use server";
import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";
import { materiSchema } from "@/schema/materiDetailsSchema";

export type UserRole =
  | "user"
  | "admin_komunitas"
  | "admin_pemerintah"
  | "super_admin";

// --- Fungsi Helper untuk Memeriksa Role Pengguna ---
const checkRequiredRole = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
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

  // Ambil role user dari tabel 'User'
  const { data: userData, error: userError } = await supabase
    .from("User")
    .select("role")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    throw new Error("Gagal memuat data pengguna untuk otorisasi.");
  }

  if (userData.role !== requiredRole) {
    throw new Error(
      `Kamu tidak memiliki izin untuk melakukan aksi ini. Diperlukan peran: ${requiredRole}.`
    );
  }

  return userId;
};

// --- 1. CREATE MATERI ACTION ---
// ...existing import & helper...

export const createMateriAction = async (formData: FormData) => {
  try {
    const supabase = await createClient();

    // Otorisasi: Hanya super_admin yang bisa membuat materi
    const uploaderId = await checkRequiredRole(supabase, "super_admin");

    // Ambil data dari FormData
    const judul = formData.get("judul") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string | undefined;
    const videoUrl = formData.get("videoUrl") as string | undefined;
    const category = formData.get("category") as string;
    const langkah_langkah = formData.getAll("langkah_langkah") as string[];

    // Validasi array langkah_langkah
    if (
      !Array.isArray(langkah_langkah) ||
      !langkah_langkah.every((s) => typeof s === "string")
    ) {
      throw new Error("Format langkah-langkah tidak valid.");
    }

    // Validasi input dengan Zod Schema
    const validationResult = materiSchema.safeParse({
      judul,
      description,
      image_url: imageUrl,
      video_url: videoUrl,
      step: langkah_langkah,
    });

    if (!validationResult.success) {
      const firstErrorMessage = validationResult.error.errors[0]?.message;
      throw new Error(firstErrorMessage || "Validasi data materi gagal.");
    }

    // Insert ke tabel Materi
    const { error: materiInsertError } = await supabase.from("Materi").insert({
      judul: validationResult.data.judul,
      description: validationResult.data.description,
      image_url: validationResult.data.image_url,
      video_url: validationResult.data.video_url,
      langkah_langkah: validationResult.data.step, // array of string
      uploader_id: uploaderId,
      category,
    });

    if (materiInsertError) {
      throw new Error(`Gagal menambah materi: ${materiInsertError.message}`);
    }

    return { success: true, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

// --- 2. GET MATERI BY ID ACTION ---
export const getMateriByIdAction = async (id: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("Materi")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }
    if (!data) throw new Error("Materi tidak ditemukan.");

    return { materi: data, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

// --- 3. GET ALL MATERI ACTION ---
export const getAllMateriAction = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("Materi")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return { materiList: data, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

// --- 4. UPDATE MATERI ACTION ---
export const updateMateriAction = async (id: string, formData: FormData) => {
  try {
    const supabase = await createClient();

    // Otorisasi: Hanya super_admin yang bisa mengedit materi
    await checkRequiredRole(supabase, "super_admin");

    // Ambil data dari FormData
    const judul = formData.get("judul") as string | undefined;
    const description = formData.get("description") as string | undefined;
    const imageUrl = formData.get("image_url") as string | undefined;
    const videoUrl = formData.get("video_url") as string | undefined;
    const category = formData.get("category") as string | undefined; // sesuai field di tabel Materi
    const stepString = formData.get("langkah_langkah") as string | undefined;

    let step: string[] | undefined;
    if (stepString !== undefined) {
      try {
        step = JSON.parse(stepString);
        if (!Array.isArray(step) || !step.every((s) => typeof s === "string")) {
          throw new Error("Format langkah-langkah tidak valid.");
        }
      } catch {
        throw new Error(
          "Format langkah-langkah tidak valid. Harap masukkan array teks yang valid."
        );
      }
    }

    // Validasi input dengan Zod Schema (gunakan .partial() untuk update)
    const validationResult = materiSchema.partial().safeParse({
      judul,
      description,
      image_url: imageUrl,
      video_url: videoUrl,
      step,
    });

    if (!validationResult.success) {
      const firstErrorMessage = validationResult.error.errors[0]?.message;
      throw new Error(firstErrorMessage || "Validasi data materi gagal.");
    }

    // Buat objek untuk di-update ke DB
    const dataToUpdate: Record<string, unknown> = {
      ...validationResult.data,
      ...(step !== undefined && { langkah_langkah: step }),
      ...(category && { category }),
    };
    delete dataToUpdate.step;

    const { error: materiUpdateError } = await supabase
      .from("Materi")
      .update(dataToUpdate)
      .eq("id", id);

    if (materiUpdateError) {
      throw new Error(`Gagal memperbarui materi: ${materiUpdateError.message}`);
    }

    return { success: true, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

// --- 5. DELETE MATERI ACTION ---
export const deleteMateriAction = async (id: string) => {
  try {
    const supabase = await createClient();

    // Otorisasi: Hanya super_admin yang bisa menghapus materi
    await checkRequiredRole(supabase, "super_admin");

    const { error: materiDeleteError } = await supabase
      .from("Materi")
      .delete()
      .eq("id", id);

    if (materiDeleteError) {
      throw new Error(`Gagal menghapus materi: ${materiDeleteError.message}`);
    }

    return { success: true, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const incrementMateriViewCountAction = async (materiId: string) => {
  try {
    const supabase = await createClient();

    // 1. Ambil views_count saat ini
    const { data, error: selectError } = await supabase
      .from("Materi")
      .select("views_count")
      .eq("id", materiId)
      .single();

    if (selectError) {
      // Jika materi tidak ditemukan atau ada error select, log dan keluar tanpa increment
      console.error(
        "Error selecting views_count for materiId:",
        materiId,
        selectError
      );
      throw new Error(
        `Gagal mengambil data views_count materi: ${selectError.message}`
      );
    }

    // Pastikan views_count adalah angka, default 0 jika null/undefined
    const currentViews = data?.views_count || 0;
    const newViews = currentViews + 1;

    // 2. Update views_count dengan nilai yang baru
    const { error: updateError } = await supabase
      .from("Materi")
      .update({ views_count: newViews })
      .eq("id", materiId);

    if (updateError) {
      console.error(
        "Error updating view count for materiId:",
        materiId,
        updateError
      );
      throw new Error(
        `Gagal memperbarui views_count materi: ${updateError.message}`
      );
    }

    return { success: true, errorMessage: null };
  } catch (error) {
    // Tangani error dan kembalikan format yang konsisten
    return handleError(error);
  }
};

export const getPopularMateriAction = async (limit: number = 4) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("Materi")
      .select("*")
      .order("views_count", { ascending: false }) // urutkan dari terbanyak
      .limit(limit);

    if (error) {
      return { errorMessage: error.message };
    }
    return { popularMateriList: data, errorMessage: null };
  } catch (error: any) {
    return {
      errorMessage: error.message || "Gagal mengambil data materi populer",
    };
  }
};
