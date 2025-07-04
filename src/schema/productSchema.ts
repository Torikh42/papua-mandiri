import { z } from "zod";

export const productSchema = z.object({
  judul: z.string().min(1, "Judul produk wajib diisi").max(255, "Judul terlalu panjang"),
  deskripsi: z.string().min(1, "Deskripsi produk wajib diisi"),
  harga: z.number().positive("Harga harus lebih besar dari 0"),
  stok: z.number().int().min(0, "Stok tidak boleh negatif"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
});