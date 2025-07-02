"use server";
import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";
import { userSchema } from "@/schema/userSchema";
import { updatePasswordSchema } from "@/schema/userSchema";

export type UserRole = "petani" | "pengolah" | "pembeli" | "admin komunitas";

export const loginAction = async (email: string, password: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Email atau password salah.");
      }
      throw error;
    }
    const userId = data.user?.id;
    if (!userId) {
      throw new Error("Gagal mendapatkan ID pengguna setelah login.");
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("User ")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error(
        "Gagal mengambil profil pengguna dari tabel:",
        profileError
      );
      throw new Error("Gagal mengambil informasi profil pengguna.");
    }

    console.log("User berhasil login:");
    console.log("User Id:", data.user?.id);
    console.log("User email:", data.user?.email);
    console.log("User role (dari Supabase Auth):", data.user?.role);
    console.log("User role (dari tabel User):", userProfile.role);

    return { errorMessage: null, userRole: userProfile.role };
  } catch (error) {
    return handleError(error);
  }
};

export const signUpAction = async (
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
  role: UserRole,
  location: string
) => {
  try {
    userSchema.parse({ fullName, email, password });

    if (password !== confirmPassword) {
      throw new Error("Password dan konfirmasi password tidak sama");
    }

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error("Gagal mendapatkan ID pengguna setelah pendaftaran.");
    }

    const { error: profileError } = await supabase.from("User ").insert({
      id: userId,
      user_name: fullName,
      user_email: email,
      role, // Ini adalah tempat `UserRole` kustom Anda disimpan
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

export const forgotPasswordAction = async (email: string) => {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
    });

    if (error) {
      if (
        error.message.includes("not found") ||
        error.message.includes("user not found")
      ) {
        return {
          success: true,
          message:
            "Jika email Anda terdaftar, tautan reset password akan dikirimkan.",
          errorMessage: null,
        };
      }

      throw error;
    }

    return {
      success: true,
      message:
        "Tautan reset password telah dikirim ke email Anda. Silakan cek kotak masuk Anda.",
      errorMessage: null,
    };
  } catch (error) {
    return { success: false, ...handleError(error), message: null };
  }
};

export const updatePasswordAction = async (
  password: string,
  confirmPassword: string
) => {
  try {
    const validationResult = updatePasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      const firstErrorMessage = validationResult.error.errors[0]?.message;
      console.warn(
        "⚠️ Server-side password validation failed:",
        validationResult.error.errors
      );

      throw new Error(firstErrorMessage || "Validasi password gagal.");
    }

    const supabase = await createClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error(
        "Sesi tidak valid. Silakan minta tautan reset password baru."
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      console.error("Update password error from Supabase:", updateError);

      if (updateError.message.includes("Password should be at least")) {
        throw new Error("Password terlalu pendek. Minimal 8 karakter.");
      } else if (
        updateError.message.includes("New password should be different")
      ) {
        throw new Error("Password baru harus berbeda dari password lama.");
      } else if (
        updateError.message.includes("invalid_grant") ||
        updateError.message.includes("invalid token")
      ) {
        throw new Error(
          "Sesi Anda sudah kedaluwarsa. Silakan minta tautan reset password baru."
        );
      }

      throw new Error("Gagal memperbarui password. Silakan coba lagi.");
    }

    return {
      success: true,
      message: "Password Anda berhasil direset!",
      errorMessage: null,
    };
  } catch (error: unknown) {
    console.error("Exception in updatePasswordAction:", error);
    return {
      success: false,
      ...handleError(error),
      message: null,
    };
  }
};
