// schema/materiSchema.ts
import { z } from "zod";

export const materiSchema = z.object({
  // --- PERBAIKAN DI SINI: Ubah 'title' menjadi 'judul' ---
  judul: z.string().min(3, "Judul materi minimal 3 karakter"),
  // --- AKHIR PERBAIKAN ---

  description: z.string().min(10, "Deskripsi materi minimal 10 karakter"),
  image_url: z
    .union([z.string().url("URL video tidak valid"), z.literal("")])
    .optional(),
  video_url: z
    .union([z.string().url("URL video tidak valid"), z.literal("")])
    .optional(),
  step: z
    .array(z.string().min(1, "Langkah tidak boleh kosong"))
    .min(1, "Setidaknya satu langkah diperlukan (Bahasa Indonesia)"),
  category: z.string().uuid("Kategori tidak valid").optional(), 
});
