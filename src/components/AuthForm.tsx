// components/AuthForm.tsx
"use client";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { toast } from "sonner";
import { CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { loginAction, signUpAction } from "@/action/userAction";

type Props = {
  type: "login" | "sign up";
};

const AuthForm = ({ type }: Props) => {
  const isLoginForm = type === "login";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (FormData: FormData) => {
    startTransition(async () => {
      const email = FormData.get("email") as string;
      const password = FormData.get("password") as string;

      let result;

      if (isLoginForm) {
        result = await loginAction(email, password);
      } else {
        const fullName = FormData.get("fullName") as string;
        const confirmPassword = FormData.get("confirmPassword") as string;
        const location = FormData.get("location") as string; // <-- Ambil nilai lokasi

        // --- PERUBAHAN DI SINI: Panggilan signUpAction dengan 'location' ---
        result = await signUpAction(
          fullName,
          email,
          password,
          confirmPassword,
          location // <-- Teruskan lokasi
        );
        // --- AKHIR PERUBAHAN ---
      }

      if (!result.errorMessage) {
        toast.success(
          isLoginForm
            ? "Anda berhasil masuk."
            : "Anda berhasil mendaftar."
        );
        router.replace("/");
      } else {
        console.error(result.errorMessage);
        toast.error(
          result.errorMessage ||
            (isLoginForm
              ? "Terjadi kesalahan saat masuk."
              : "Terjadi kesalahan saat mendaftar.")
        );
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <CardContent className="grid w-full items-center gap-4">
        {/* Input khusus sign up */}
        {!isLoginForm && (
          <>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Masukkan nama lengkap Anda"
                type="text"
                required
                disabled={isPending}
              />
            </div>
            {/* --- PERUBAHAN DI SINI: Tambahkan input location --- */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                name="location"
                placeholder="Masukkan lokasi Anda (contoh: Cibinong, Jawa Barat)"
                type="text"
                required
                disabled={isPending}
              />
            </div>
            {/* --- AKHIR PERUBAHAN --- */}
          </>
        )}
        {/* Input email dan password SELALU tampil */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Masukkan email Anda"
            type="email"
            required
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="Masukkan password Anda"
            type="password"
            required
            disabled={isPending}
          />
        </div>
        {/* Confirm Password hanya saat sign up, tepat di bawah password */}
        {!isLoginForm && (
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Konfirmasi password Anda"
              type="password"
              required
              disabled={isPending}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-4 flex flex-col gap-6">
        <Button className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : isLoginForm ? (
            "Login"
          ) : (
            "Daftar"
          )}
        </Button>
        {isLoginForm && (
          <Link
            href="/forgot-password"
            className="text-sm text-blue-500 hover:underline"
          >
            Lupa password?
          </Link>
        )}

        <p className="text-xs">
          {isLoginForm ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <Link
            href={isLoginForm ? "/sign-up" : "/login"}
            className={`text-blue-500 ${
              isPending ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {isLoginForm ? "Daftar" : "Login"}
          </Link>
        </p>
      </CardFooter>
    </form>
  );
};

export default AuthForm;