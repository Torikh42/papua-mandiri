"use server";
import { createClient } from "@/auth/server";
import cloudinary from "@/lib/cloudinary";
import { handleError } from "@/lib/utils";
import { materiSchema } from "@/schema/materiDetailsSchema";
import { revalidatePath } from "next/cache";

interface UploadResult {
  secure_url: string;
}

const MATERI_WITH_KATEGORI_SELECT = `
  *,
  Kategori ( id, judul )
`;

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
    const uploaderId = await checkRequiredRole(supabase, "super_admin");

    // 1. Ambil file gambar dan video dari FormData
    const imageFile = formData.get("imageFile") as File | null;
    const videoFile = formData.get("videoFile") as File | null;
    let imageUrl: string | null = null;
    let videoUrl: string | null = null;

    // --- PROSES UPLOAD GAMBAR (JIKA ADA) ---
    if (imageFile && imageFile.size > 0) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const imgResult = await new Promise<UploadResult | null>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "papua_mandiri_materi_images" },
            (error, result) => {
              if (error) reject(error);
              if (result) resolve(result as UploadResult);
            }
          );
          stream.end(imageBuffer);
        }
      );
      imageUrl = imgResult?.secure_url || null;
    }

    // --- PROSES UPLOAD VIDEO (JIKA ADA) ---
    if (videoFile && videoFile.size > 0) {
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
      const vidResult = await new Promise<UploadResult | null>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "papua_mandiri_materi_videos",
              resource_type: "video", // <-- Beri tahu Cloudinary ini adalah video
            },
            (error, result) => {
              if (error) reject(error);
              if (result) resolve(result as UploadResult);
            }
          );
          stream.end(videoBuffer);
        }
      );
      videoUrl = vidResult?.secure_url || null;
    }

    // Ambil sisa data dari form
    const judul = formData.get("judul") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const langkah_langkah = formData.getAll("langkah_langkah") as string[];

    // Validasi data dengan Zod (termasuk URL baru)
    const validationResult = materiSchema.safeParse({
      judul,
      description,
      image_url: imageUrl, // Gunakan URL dari Cloudinary
      video_url: videoUrl, // Gunakan URL dari Cloudinary
      step: langkah_langkah,
    });

    if (!validationResult.success) {
      throw new Error(
        validationResult.error.errors[0]?.message ||
          "Validasi data materi gagal."
      );
    }

    // Insert ke Supabase dengan URL dari Cloudinary
    const { error: materiInsertError } = await supabase.from("Materi").insert({
      judul: validationResult.data.judul,
      description: validationResult.data.description,
      image_url: validationResult.data.image_url,
      video_url: validationResult.data.video_url,
      langkah_langkah: validationResult.data.step,
      uploader_id: uploaderId,
      category,
    });

    if (materiInsertError) throw materiInsertError;

    revalidatePath("/dashboard-superadmin");
    revalidatePath("/materi");

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
      .select(MATERI_WITH_KATEGORI_SELECT)
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Materi tidak ditemukan.");

    return { success: true, materi: data };
  } catch (error) {
    return handleError(error);
  }
};

// --- 3. GET ALL MATERI ACTION ---
/**
 * @function getAllMateriAction
 * @description Mengambil semua materi dengan data kategori
 * @returns Daftar semua materi dengan informasi kategori
 */
export const getAllMateriAction = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("Materi")
      .select(
        `
        *,
        Kategori!category (
          id,
          judul
        )
      `
      )
      .order("created_at", { ascending: false }); // Urutkan berdasarkan yang terbaru

    if (error) {
      console.error("Error fetching all materi:", error.message);
      throw new Error(`Gagal memuat materi: ${error.message}`);
    }

    return { success: true, materiList: data || [], errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const updateMateriAction = async (id: string, formData: FormData) => {
  // Tambahkan log di awal untuk memastikan fungsi dan ID benar
  console.log(`--- MEMULAI UPDATE MATERI UNTUK ID: ${id} ---`);
  try {
    const supabase = await createClient();
    await checkRequiredRole(supabase, "super_admin");

    const { data: materiSaatIni, error: fetchError } = await supabase
      .from("Materi")
      .select("image_url, video_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(
        `Materi awal tidak ditemukan (ID: ${id}). Error: ${fetchError.message}`
      );
    }

    // ... (Logika upload file Anda sudah benar, biarkan apa adanya)
    const imageFile = formData.get("imageFile") as File | null;
    const videoFile = formData.get("videoFile") as File | null;
    let imageUrl: string | null = materiSaatIni.image_url;
    let videoUrl: string | null = materiSaatIni.video_url;

    if (imageFile && imageFile.size > 0) {
      // ... (logika upload gambar)
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const imgResult = await new Promise<UploadResult | null>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "papua_mandiri_materi_images" },
            (error, result) => {
              if (error) reject(new Error("Gagal mengunggah gambar baru."));
              if (result) resolve(result as UploadResult);
            }
          );
          stream.end(imageBuffer);
        }
      );
      if (imgResult) imageUrl = imgResult.secure_url;
    }
    if (videoFile && videoFile.size > 0) {
      // ... (logika upload video)
      const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
      const vidResult = await new Promise<UploadResult | null>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "papua_mandiri_materi_videos", resource_type: "video" },
            (error, result) => {
              if (error) reject(new Error("Gagal mengunggah video baru."));
              if (result) resolve(result as UploadResult);
            }
          );
          stream.end(videoBuffer);
        }
      );
      if (vidResult) videoUrl = vidResult.secure_url;
    }

    // Siapkan data untuk diupdate
    const dataToUpdate = {
      judul: formData.get("judul") as string,
      description: formData.get("description") as string,
      langkah_langkah: formData
        .getAll("langkah_langkah")
        .map((item) => String(item)) // Convert to string first
        .filter((s) => s.trim() !== ""), // Now safe to use trim()
      image_url: imageUrl,
      video_url: videoUrl,
      category: formData.get("category") as string,
      updated_at: new Date().toISOString(),
    };

    // --- LOG 1: LIHAT DATA YANG AKAN DIKIRIM ---
    console.log(
      "Data yang akan dikirim ke Supabase:",
      JSON.stringify(dataToUpdate, null, 2)
    );

    // --- PERUBAHAN PENTING: Tambahkan .select() untuk mendapatkan respons ---
    const { data: updatedData, error: materiUpdateError } = await supabase
      .from("Materi")
      .update(dataToUpdate)
      .eq("id", id)
      .select(); // <-- Tambahkan .select()

    // --- LOG 2: LIHAT RESPON DARI DATABASE ---
    console.log("Respons dari Supabase setelah update:", {
      updatedData,
      materiUpdateError,
    });
    console.log("--- SELESAI UPDATE MATERI ---");

    if (materiUpdateError) {
      throw materiUpdateError;
    }

    revalidatePath("/dashboard-superadmin");
    revalidatePath(`/materi-details/${id}`); // Revalidasi halaman detail juga
    return { success: true };
  } catch (error) {
    console.error("RAW ERROR di updateMateriAction:", error);
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

    revalidatePath("/dashboard-superadmin");
    revalidatePath("/materi");

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
      // Ambil juga relasi Kategori agar bisa ditampilkan di card
      .select(
        `
        *,
        Kategori ( id, judul )
      `
      )
      .order("views_count", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      // Tidak perlu 'throw', cukup kembalikan format error yang konsisten
      return handleError(error);
    }

    // --- PERBAIKAN UTAMA DI SINI ---
    // Tambahkan properti `success: true` pada hasil yang berhasil
    return { success: true, popularMateriList: data, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * @function getMateriByCategory
 * @description Mengambil materi berdasarkan kategori tertentu
 * @param categoryId ID kategori yang ingin difilter
 * @returns Daftar materi dalam kategori tersebut
 */
export const getMateriByCategory = async (categoryId: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("Materi")
      .select(
        `
        *,
        Kategori!category (
          id,
          judul
        )
      `
      )
      .eq("category", categoryId)
      .order("judul", { ascending: true });

    if (error) {
      console.error("Error fetching materi by category:", error.message);
      throw new Error(`Gagal memuat materi: ${error.message}`);
    }

    return { success: true, materiList: data || [], errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * @function getAllMateriWithCategory
 * @description Mengambil semua materi dengan informasi kategori
 * @returns Daftar semua materi dengan data kategori
 */
export const getAllMateriWithCategory = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("Materi")
      .select(
        `
        *,
        Kategori!category (
          id,
          judul
        )
      `
      )
      .order("judul", { ascending: true });

    if (error) {
      console.error("Error fetching all materi with category:", error.message);
      throw new Error(`Gagal memuat materi: ${error.message}`);
    }

    return { success: true, materiList: data || [], errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};
