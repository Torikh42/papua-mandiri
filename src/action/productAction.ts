"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";
import { checkRequiredRole } from "@/lib/authHelper";
import { productSchema } from "@/schema/productSchema";
import cloudinary from "@/lib/cloudinary";

interface UploadResult {
  secure_url: string;
}

export const ajukanProdukAction = async (formData: FormData) => {
  try {
    const supabase = await createClient();
    const userId = await checkRequiredRole(supabase, "admin_komunitas");

    const file = formData.get("imageUrl") as File | null;
    let imageUrl: string | null = null;

    // --- LOGIKA UPLOAD KE CLOUDINARY ---
    if (file && file.size > 0) {
      // 1. Ubah file menjadi buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 2. Upload ke Cloudinary menggunakan stream
      const result = await new Promise<UploadResult | null>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "papua_mandiri_produk", // Opsional: nama folder di Cloudinary
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(new Error("Gagal mengunggah gambar."));
              }
              if (result) {
                resolve(result as UploadResult);
              }
            }
          );
          stream.end(buffer);
        }
      );

      if (result) {
        imageUrl = result.secure_url; // 3. Dapatkan URL aman dari hasil upload
      }
    }
    // --- AKHIR LOGIKA UPLOAD ---

    const productData = {
      judul: (formData.get("judul") as string) || "",
      description: (formData.get("description") as string) || "",
      harga: parseFloat((formData.get("harga") as string) || "0"),
      stok: parseInt((formData.get("stok") as string) || "0"),
      alamat: (formData.get("alamat") as string) || "",
      imageUrl: imageUrl, // 4. Gunakan URL dari Cloudinary (atau null jika tidak ada file)
    };

    const validationResult = productSchema.safeParse(productData);
    if (!validationResult.success) {
      throw new Error(
        validationResult.error.errors[0]?.message ||
          "Validasi data produk gagal."
      );
    }

    // 5. Insert data ke Supabase dengan URL baru
    const { error } = await supabase.from("Produk").insert({
      ...validationResult.data,
      created_by: userId,
      status: "diajukan",
    });

    if (error) throw error;

    revalidatePath("/dashboard-admin-komunitas");
    return { success: true, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const getProdukKomunitasAction = async () => {
  try {
    const supabase = await createClient();
    const userId = await checkRequiredRole(supabase, "admin_komunitas");
    const { data, error } = await supabase
      .from("Produk")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, data, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

// === AKSI UNTUK ADMIN PEMERINTAH ===

export const getProdukUntukPemerintahAction = async () => {
  try {
    const supabase = await createClient();
    await checkRequiredRole(supabase, "admin_pemerintah");
    const { data, error } = await supabase
      .from("Produk")
      .select(`*, pembuat:created_by (user_name)`) // Ambil semua kolom produk
      .eq("status", "diajukan")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return handleError(error);
  }
};

export const updateProdukStatusAction = async (
  produkId: string,
  status: "disetujui" | "ditolak",
  catatan: string
) => {
  try {
    const supabase = await createClient();
    const userId = await checkRequiredRole(supabase, "admin_pemerintah");
    const { error } = await supabase
      .from("Produk")
      .update({
        status: status,
        catatan_pemerintah: catatan,
        reviewed_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", produkId);
    if (error) throw error;
    revalidatePath("/dashboard-admin-pemerintah");
    return { success: true, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const getProdukDisetujuiAction = async () => {
  try {
    const supabase = await createClient();
    await checkRequiredRole(supabase, "admin_pemerintah");
    const { data, error } = await supabase
      .from("Produk")
      .select("*")
      .eq("status", "disetujui")
      .gt("stok", 0)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return { success: true, data, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const createPesananPemerintahAction = async (
  produkId: string,
  jumlahDipesan: number,
  catatan: string
) => {
  try {
    const supabase = await createClient();
    const userId = await checkRequiredRole(supabase, "admin_pemerintah");

    if (jumlahDipesan <= 0) {
      throw new Error("Jumlah pesanan harus lebih dari 0.");
    }

    // 1. Ambil data produk terbaru untuk memeriksa stok
    const { data: produk, error: produkError } = await supabase
      .from("Produk")
      .select("stok")
      .eq("id", produkId)
      .single();

    if (produkError || !produk) {
      throw new Error("Produk tidak ditemukan atau gagal mengambil data stok.");
    }

    // 2. Validasi stok di sisi server
    if (produk.stok < jumlahDipesan) {
      throw new Error(`Stok tidak mencukupi. Stok tersedia: ${produk.stok}`);
    }

    // 3. Buat catatan pesanan baru
    const { error: insertError } = await supabase
      .from("PesananPemerintah")
      .insert({
        produkId: produkId,
        jumlah_dipesan: jumlahDipesan,
        catatan_pesanan: catatan,
        dipesan_oleh_id: userId,
      });

    if (insertError) throw insertError;

    // 4. Kurangi stok produk (RISIKO: Jika ini gagal, data bisa tidak konsisten)
    const { error: updateError } = await supabase
      .from("Produk")
      .update({ stok: produk.stok - jumlahDipesan })
      .eq("id", produkId);

    if (updateError) throw updateError;

    revalidatePath("/dashboard-admin-pemerintah");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
};

export const getRiwayatPesananAction = async () => {
  try {
    const supabase = await createClient();
    const userId = await checkRequiredRole(supabase, "admin_pemerintah");
    const { data, error } = await supabase
      .from("PesananPemerintah")
      .select(`*, produk:produkId(judul, imageUrl)`)
      .eq("dipesan_oleh_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return handleError(error);
  }
};

export const getPesananUntukKomunitasAction = async () => {
  try {
    const supabase = await createClient();
    const userId = await checkRequiredRole(supabase, "admin_komunitas");

    // Ambil semua produk yang dibuat oleh user ini, beserta semua pesanan yang terkait
    const { data, error } = await supabase
      .from("Produk")
      .select(
        `
        id, 
        judul,
        PesananPemerintah (
          *,
          pemesan:dipesan_oleh_id (user_name)
        )
      `
      )
      .eq("created_by", userId);

    if (error) throw error;

    // Olah data agar lebih mudah digunakan di frontend
    const pesananList = data
      .flatMap((produk) =>
        produk.PesananPemerintah.map((pesanan) => ({
          ...pesanan,
          produk: { judul: produk.judul }, // Tambahkan info produk ke setiap pesanan
        }))
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    return { success: true, data: pesananList };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Aksi untuk admin komunitas memperbarui status pesanan (misal: menandai selesai).
 */
export const updateStatusPesananKomunitasAction = async (
  pesananId: string,
  status: "selesai" | "dibatalkan"
) => {
  try {
    const supabase = await createClient();
    const userId = await checkRequiredRole(supabase, "admin_komunitas");

    // Langkah 1: Ambil data pesanan
    const { data: pesanan, error: pesananError } = await supabase
      .from("PesananPemerintah")
      .select("produkId")
      .eq("id", pesananId)
      .single();

    if (pesananError || !pesanan) {
      throw new Error("Pesanan tidak ditemukan.");
    }

    // Langkah 2: Ambil data produk terkait
    const { data: produk, error: produkError } = await supabase
      .from("Produk")
      .select("created_by")
      .eq("id", pesanan.produkId)
      .single();

    if (produkError || !produk) {
      throw new Error("Produk terkait pesanan ini tidak ditemukan.");
    }

    // Langkah 3: Verifikasi keamanan
    if (produk.created_by !== userId) {
      throw new Error(
        "Akses ditolak: Anda tidak dapat mengubah status pesanan ini."
      );
    }

    // Langkah 4: Update status pesanan
    const { error: updateError } = await supabase
      .from("PesananPemerintah")
      .update({ status_pesanan: status, updated_at: new Date().toISOString() })
      .eq("id", pesananId);

    if (updateError) throw updateError;

    revalidatePath("/dashboard-admin-komunitas");
    return { success: true };
  } catch (error) {
    // --- TAMBAHKAN CONSOLE.ERROR DI SINI ---
    console.error("RAW ERROR in updateStatusPesananKomunitasAction:", error);
    return handleError(error);
  }
};

export const updateProdukAction = async (
  produkId: string,
  formData: FormData
) => {
  try {
    const supabase = await createClient();
    const userId = await checkRequiredRole(supabase, "admin_komunitas");

    const { data: produkSaatIni, error: fetchError } = await supabase
      .from("Produk")
      .select("created_by, status, imageUrl")
      .eq("id", produkId)
      .single();

    if (fetchError || !produkSaatIni)
      throw new Error("Produk tidak ditemukan.");
    if (produkSaatIni.created_by !== userId) throw new Error("Akses ditolak.");
    if (produkSaatIni.status === "disetujui")
      throw new Error("Produk yang sudah disetujui tidak dapat diedit.");

    const file = formData.get("imageUrl") as File | null;
    let imageUrl: string | null = produkSaatIni.imageUrl;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await new Promise<UploadResult | null>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "papua_mandiri_produk" },
            (error, result) => {
              if (error) reject(new Error("Gagal mengunggah gambar baru."));
              if (result) resolve(result as UploadResult);
            }
          );
          stream.end(buffer);
        }
      );
      if (result) {
        imageUrl = result.secure_url;
      }
    }

    const productData = {
      judul: (formData.get("judul") as string) || "",
      deskripsi: (formData.get("description") as string) || "",
      harga: parseFloat((formData.get("harga") as string) || "0"),
      stok: parseInt((formData.get("stok") as string) || "0"),
      alamat: (formData.get("alamat") as string) || "",
      imageUrl: imageUrl,
    };

    const validationResult = productSchema.partial().safeParse(productData);
    if (!validationResult.success) {
      throw new Error(
        validationResult.error.errors[0]?.message ||
          "Validasi data produk gagal."
      );
    }

    const { error: updateError } = await supabase
      .from("Produk")
      .update({
        ...validationResult.data,
        status: "diajukan",
        updated_at: new Date().toISOString(),
      })
      .eq("id", produkId);

    if (updateError) throw updateError;

    revalidatePath("/dashboard-admin-komunitas");
    return { success: true, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};
