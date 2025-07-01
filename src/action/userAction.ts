"use server";
import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";
import { userSchema } from "@/schema/userSchema";
export type UserRole = "petani" | "pengolah" | "pembeli" | "admin komunitas";

export const loginAction = async (email: string, password: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Email atau password salah.");
      }
      throw error;
    }
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const signUpAction = async (
  fullName: string,
  email: string,
  password: string,
  role: UserRole,
  location: string // tambahkan parameter location
) => {
  try {
    userSchema.parse({ fullName, email, password });

    const supabase = await createClient();

    // 1. Buat user di Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error("Gagal mendapatkan ID pengguna setelah pendaftaran.");
    }

    // 2. Tambahkan profil ke tabel 'User'
    const { error: profileError } = await supabase.from("User").insert({
      // Jika nama tabel Anda memang "User"
      id: userId,
      user_name: fullName, // Sesuaikan dengan nama kolom di DB
      user_email: email, // Sesuaikan dengan nama kolom di DB
      role,
      location,
    });

    if (profileError) {
      console.error("Gagal membuat profil pengguna:", profileError);
      throw new Error(
        "Pendaftaran berhasil, tetapi gagal membuat profil. Silakan coba lagi."
      );
    }

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const logoutAction = async () => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};
