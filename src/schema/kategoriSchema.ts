import { z } from "zod";

export const categorySchema = z.object({
  judul: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(50, "Nama kategori maksimal 50 karakter"),
  description: z
    .string()
    .max(255, "Deskripsi kategori maksimal 255 karakter")
    .optional()
    .nullable(),
});
