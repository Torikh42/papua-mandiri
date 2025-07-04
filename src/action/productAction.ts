"use server";

import { createClient } from "@/auth/server"; // Untuk membuat Supabase client di server action
import { handleError } from "@/lib/utils"; // Fungsi helper untuk penanganan error umum
import { checkRequiredRole } from "@/lib/authHelper"; // Import helper otorisasi dan tipe role
import { productSchema } from "@/schema/productSchema"; // Asumsi ada schema untuk validasi product

/**
 * @function createProductAction
 * @description Menambah produk baru ke database. Hanya dapat dilakukan oleh user dengan peran 'admin_komunitas' atau 'super_admin'.
 * @param formData FormData yang berisi data produk (judul, deskripsi, harga, stok, alamat).
 * @returns {Promise<{ success: boolean; errorMessage: string | null; product?: any }>} Hasil operasi.
 */
export const createProductAction = async (formData: FormData) => {
  try {
    const supabaseClient = await createClient();
    
    // Cek apakah user adalah admin_komunitas atau super_admin
    let userId: string;
    try {
      userId = await checkRequiredRole(supabaseClient, "admin_komunitas");
    } catch (error) {
      try {
        userId = await checkRequiredRole(supabaseClient, "super_admin");
      } catch (error) {
        throw new Error("Akses ditolak. Hanya admin_komunitas dan super_admin yang dapat melakukan operasi ini.");
      }
    }

    const judul = formData.get("judul") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const harga = formData.get("harga") as string;
    const stok = formData.get("stok") as string;
    const alamat = formData.get("alamat") as string;

    // Validasi input menggunakan Zod schema
    const validationResult = productSchema.safeParse({ 
      judul, 
      deskripsi, 
      harga: parseFloat(harga), 
      stok: parseInt(stok),
      alamat 
    });
    
    if (!validationResult.success) {
      const firstErrorMessage = validationResult.error.errors[0]?.message;
      console.warn(
        "⚠️ Server-side product validation failed:",
        validationResult.error.errors
      );
      throw new Error(firstErrorMessage || "Validasi data produk gagal.");
    }

    // Insert data produk ke tabel 'Product'
    const { data, error } = await supabaseClient
      .from("Product")
      .insert({
        judul: validationResult.data.judul,
        deskripsi: validationResult.data.deskripsi,
        harga: validationResult.data.harga,
        stok: validationResult.data.stok,
        alamat: validationResult.data.alamat,
        created_by: userId, // Menyimpan ID user yang membuat produk
      })
      .select();

    if (error) {
      console.error("Supabase insert product error:", error);
      throw new Error(`Gagal menambah produk: ${error.message}`);
    }

    return { success: true, errorMessage: null, product: data[0] };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * @function getAllProductsAction
 * @description Mengambil daftar semua produk dari database. Dapat diakses oleh semua pengguna.
 * @param page Halaman yang ingin diambil (default: 1).
 * @param limit Jumlah produk per halaman (default: 10).
 * @returns {Promise<{ success: boolean; errorMessage: string | null; products?: any[]; totalCount?: number }>} Daftar produk.
 */
export const getAllProductsAction = async (page: number = 1, limit: number = 10) => {
  try {
    const supabase = await createClient();
    
    const offset = (page - 1) * limit;

    // Ambil produk dengan pagination
    const { data, error, count } = await supabase
      .from("Product")
      .select("*", { count: 'exact' })
      .eq("is_active", true) // Hanya produk yang aktif
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase get all products error:", error);
      throw new Error(`Gagal memuat produk: ${error.message}`);
    }

    return { 
      success: true, 
      products: data, 
      totalCount: count || 0,
      errorMessage: null 
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * @function getProductByIdAction
 * @description Mengambil detail produk berdasarkan ID. Dapat diakses oleh semua pengguna.
 * @param id ID produk yang ingin diambil.
 * @returns {Promise<{ success: boolean; errorMessage: string | null; product?: any }>} Detail produk.
 */
export const getProductByIdAction = async (id: string) => {
  try {
    const supabase = await createClient();
    
    if (!id) {
      throw new Error("ID produk tidak valid.");
    }

    const { data, error } = await supabase
      .from("Product")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Produk tidak ditemukan.");
      }
      console.error("Supabase get product by id error:", error);
      throw new Error(`Gagal memuat produk: ${error.message}`);
    }

    return { success: true, product: data, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * @function updateProductAction
 * @description Memperbarui produk berdasarkan ID. Hanya dapat dilakukan oleh user dengan peran 'admin_komunitas' atau 'super_admin'.
 * @param id ID produk yang ingin diperbarui.
 * @param formData FormData yang berisi data produk yang akan diperbarui.
 * @returns {Promise<{ success: boolean; errorMessage: string | null; product?: any }>} Hasil operasi.
 */
export const updateProductAction = async (id: string, formData: FormData) => {
  try {
    const supabaseClient = await createClient();
    
    // Cek apakah user adalah admin_komunitas atau super_admin
    let userId: string;
    try {
      userId = await checkRequiredRole(supabaseClient, "admin_komunitas");
    } catch (error) {
      try {
        userId = await checkRequiredRole(supabaseClient, "super_admin");
      } catch (error) {
        throw new Error("Akses ditolak. Hanya admin_komunitas dan super_admin yang dapat melakukan operasi ini.");
      }
    }

    if (!id) {
      throw new Error("ID produk tidak valid.");
    }

    const judul = formData.get("judul") as string;
    const deskripsi = formData.get("deskripsi") as string;
    const harga = formData.get("harga") as string;
    const stok = formData.get("stok") as string;
    const alamat = formData.get("alamat") as string;

    // Validasi input menggunakan Zod schema
    const validationResult = productSchema.safeParse({ 
      judul, 
      deskripsi, 
      harga: parseFloat(harga), 
      stok: parseInt(stok),
      alamat 
    });
    
    if (!validationResult.success) {
      const firstErrorMessage = validationResult.error.errors[0]?.message;
      console.warn(
        "⚠️ Server-side product validation failed:",
        validationResult.error.errors
      );
      throw new Error(firstErrorMessage || "Validasi data produk gagal.");
    }

    // Update data produk
    const { data, error } = await supabaseClient
      .from("Product")
      .update({
        judul: validationResult.data.judul,
        deskripsi: validationResult.data.deskripsi,
        harga: validationResult.data.harga,
        stok: validationResult.data.stok,
        alamat: validationResult.data.alamat,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Produk tidak ditemukan.");
      }
      console.error("Supabase update product error:", error);
      throw new Error(`Gagal memperbarui produk: ${error.message}`);
    }

    return { success: true, errorMessage: null, product: data };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * @function deleteProductAction
 * @description Menghapus produk berdasarkan ID (soft delete). Hanya dapat dilakukan oleh user dengan peran 'admin_komunitas' atau 'super_admin'.
 * @param id ID produk yang ingin dihapus.
 * @returns {Promise<{ success: boolean; errorMessage: string | null }>} Hasil operasi.
 */
export const deleteProductAction = async (id: string) => {
  try {
    const supabaseClient = await createClient();
    
    // Cek apakah user adalah admin_komunitas atau super_admin
    let userId: string;
    try {
      userId = await checkRequiredRole(supabaseClient, "admin_komunitas");
    } catch (error) {
      try {
        userId = await checkRequiredRole(supabaseClient, "super_admin");
      } catch (error) {
        throw new Error("Akses ditolak. Hanya admin_komunitas dan super_admin yang dapat melakukan operasi ini.");
      }
    }

    if (!id) {
      throw new Error("ID produk tidak valid.");
    }

    // Soft delete - set is_active menjadi false
    const { error } = await supabaseClient
      .from("Product")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Produk tidak ditemukan.");
      }
      console.error("Supabase delete product error:", error);
      throw new Error(`Gagal menghapus produk: ${error.message}`);
    }

    return { success: true, errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * @function searchProductsAction
 * @description Mencari produk berdasarkan judul atau deskripsi. Dapat diakses oleh semua pengguna.
 * @param searchTerm Kata kunci pencarian.
 * @param page Halaman yang ingin diambil (default: 1).
 * @param limit Jumlah produk per halaman (default: 10).
 * @returns {Promise<{ success: boolean; errorMessage: string | null; products?: any[]; totalCount?: number }>} Hasil pencarian produk.
 */
export const searchProductsAction = async (
  searchTerm: string, 
  page: number = 1, 
  limit: number = 10
) => {
  try {
    const supabase = await createClient();
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error("Kata kunci pencarian minimal 2 karakter.");
    }

    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("Product")
      .select("*", { count: 'exact' })
      .eq("is_active", true)
      .or(`judul.ilike.%${searchTerm.trim()}%,deskripsi.ilike.%${searchTerm.trim()}%`)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase search products error:", error);
      throw new Error(`Gagal mencari produk: ${error.message}`);
    }

    return { 
      success: true, 
      products: data, 
      totalCount: count || 0,
      errorMessage: null 
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * @function getProductsByUserAction
 * @description Mengambil produk yang dibuat oleh user tertentu. Hanya dapat diakses oleh admin_komunitas atau super_admin.
 * @param userId ID user yang produknya ingin diambil (optional, default: current user).
 * @param page Halaman yang ingin diambil (default: 1).
 * @param limit Jumlah produk per halaman (default: 10).
 * @returns {Promise<{ success: boolean; errorMessage: string | null; products?: any[]; totalCount?: number }>} Daftar produk user.
 */
export const getProductsByUserAction = async (
  userId?: string, 
  page: number = 1, 
  limit: number = 10
) => {
  try {
    const supabaseClient = await createClient();
    
    // Cek apakah user adalah admin_komunitas atau super_admin
    let currentUserId: string;
    try {
      currentUserId = await checkRequiredRole(supabaseClient, "admin_komunitas");
    } catch (error) {
      try {
        currentUserId = await checkRequiredRole(supabaseClient, "super_admin");
      } catch (error) {
        throw new Error("Akses ditolak. Hanya admin_komunitas dan super_admin yang dapat melakukan operasi ini.");
      }
    }

    const targetUserId = userId || currentUserId;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabaseClient
      .from("Product")
      .select("*", { count: 'exact' })
      .eq("created_by", targetUserId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase get products by user error:", error);
      throw new Error(`Gagal memuat produk user: ${error.message}`);
    }

    return { 
      success: true, 
      products: data, 
      totalCount: count || 0,
      errorMessage: null 
    };
  } catch (error) {
    return handleError(error);
  }
};

/**
 * @function updateProductStockAction
 * @description Memperbarui stok produk. Hanya dapat dilakukan oleh user dengan peran 'admin_komunitas' atau 'super_admin'.
 * @param id ID produk yang ingin diperbarui stoknya.
 * @param newStock Jumlah stok baru.
 * @returns {Promise<{ success: boolean; errorMessage: string | null; product?: any }>} Hasil operasi.
 */
export const updateProductStockAction = async (id: string, newStock: number) => {
  try {
    const supabaseClient = await createClient();
    
    // Cek apakah user adalah admin_komunitas atau super_admin
    let userId: string;
    try {
      userId = await checkRequiredRole(supabaseClient, "admin_komunitas");
    } catch (error) {
      try {
        userId = await checkRequiredRole(supabaseClient, "super_admin");
      } catch (error) {
        throw new Error("Akses ditolak. Hanya admin_komunitas dan super_admin yang dapat melakukan operasi ini.");
      }
    }

    if (!id) {
      throw new Error("ID produk tidak valid.");
    }

    if (newStock < 0) {
      throw new Error("Stok tidak boleh negatif.");
    }

    const { data, error } = await supabaseClient
      .from("Product")
      .update({
        stok: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Produk tidak ditemukan.");
      }
      console.error("Supabase update product stock error:", error);
      throw new Error(`Gagal memperbarui stok produk: ${error.message}`);
    }

    return { success: true, errorMessage: null, product: data };
  } catch (error) {
    return handleError(error);
  }
};