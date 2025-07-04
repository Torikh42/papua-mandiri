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
import Image from "next/image";

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
        const location = FormData.get("location") as string;

        result = await signUpAction(
          fullName,
          email,
          password,
          confirmPassword,
          location
        );
      }

      if (result && !result.errorMessage) {
        toast.success(
          isLoginForm ? "Anda berhasil masuk." : "Anda berhasil mendaftar."
        );
        router.replace("/");
      } else {
        console.error(result?.errorMessage);
        toast.error(
          result?.errorMessage ||
            (isLoginForm
              ? "Terjadi kesalahan saat masuk."
              : "Terjadi kesalahan saat mendaftar.")
        );
      }
    });
  };

  // Kita kelompokkan semua input dan footer ke dalam satu variabel JSX
  // agar mudah ditempatkan di dalam tata letak yang berbeda.
  const formFieldsAndFooter = (
    <>
      <CardContent className="grid w-full items-center gap-5">
        {/* Input khusus sign up */}
        {!isLoginForm && (
          <>
            <div className="flex flex-col space-y-1.5">
                <Label htmlFor="fullName" className="text-[#4c7a6b]">
                Nama Lengkap
                </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Masukkan nama lengkap Anda"
                type="text"
                required
                disabled={isPending}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
                <Label htmlFor="location" className="text-[#4c7a6b]">
                Lokasi
                </Label>
              <Input
                id="location"
                name="location"
                placeholder="Masukkan lokasi Anda (contoh: Cibinong, Jawa Barat)"
                type="text"
                required
                disabled={isPending}
              />
            </div>
          </>
        )}
        {/* Input email dan password SELALU tampil */}
        <div className="flex flex-col space-y-1.5">
            <Label htmlFor="email" className="text-[#4c7a6b]">
            Email
            </Label>
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
            <Label htmlFor="password" className="text-[#4c7a6b]">
            Password
            </Label>
          <Input
            id="password"
            name="password"
            placeholder="Masukkan password Anda"
            type="password"
            required
            disabled={isPending}
          />
        </div>
        {/* Confirm Password hanya saat sign up */}
        {!isLoginForm && (
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-[#4c7a6b]">
              Konfirmasi Password
            </Label>
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
        <Button
          className="w-full"
          style={{ backgroundColor: "#4c7a6b" }}
          disabled={isPending}
        >
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
            className="text-sm hover:underline" style={{ color: '#6AA1B0' }}>
          
            Lupa password?
          </Link>
        )}

      <p className="text-xs">
        {isLoginForm ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
        <Link
          href={isLoginForm ? "/sign-up" : "/login"}
          className={isPending ? "pointer-events-none opacity-50" : ""}
          style={{ color: "#6AA1B0" }}
        >
          {isLoginForm ? "Daftar" : "Login"}
        </Link>
      </p>

      </CardFooter>
    </>
  );

  return (
    <form action={handleSubmit}>
      {isLoginForm ? (
        // --- TATA LETAK UNTUK LOGIN ---
        <>
          <div className="p-6 pt-0">
            <Image
              src="https://res.cloudinary.com/dsw1iot8d/image/upload/v1719392211/Frame_98_zskkzk.png"
              alt="Login Illustration"
              width={250}
              height={180}
              className="mx-auto"
              priority
            />
          </div>
          {formFieldsAndFooter}
        </>
      ) : (
        // --- TATA LETAK UNTUK SIGN UP ---
        <div className="flex flex-col md:flex-row items-stretch">
          {/* Kolom Kiri: Gambar (hanya tampil di layar medium ke atas) */}
          <div className="hidden md:flex w-full md:w-2/5 items-center justify-center p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-l-lg">
            <Image
              src="https://res.cloudinary.com/dsw1iot8d/image/upload/v1719392193/Frame_100_wts108.png"
              alt="Sign Up Illustration"
              width={300}
              height={450}
              className="object-contain"
              priority
            />
          </div>
          {/* Kolom Kanan: Form */}
          <div className="w-full md:w-3/5 p-2">{formFieldsAndFooter}</div>
        </div>
      )}
    </form>
  );
};

export default AuthForm;
