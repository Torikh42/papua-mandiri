import { z } from "zod";

export const userSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap wajib diisi(minimal 3 karakter)"),
  email: z.string().email(),
  password: z.string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Harus ada huruf besar")
    .regex(/[a-z]/, "Harus ada huruf kecil")
    .regex(/[0-9]/, "Harus ada angka")
    .regex(/[^A-Za-z0-9]/, "Harus ada simbol"),
});