// AuthForm.tsx
"use client";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { toast } from "sonner";
import { CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input"; // Typo here, should be from "./ui/input"
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { loginAction, signUpAction, UserRole } from "@/action/userAction";

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
        const role = FormData.get("role") as UserRole;
        const location = FormData.get("location") as string;
        result = await signUpAction(
          fullName,
          email,
          password,
          confirmPassword,
          role,
          location
        );
      }

      if (!result.errorMessage) {
        toast.success(
          isLoginForm
            ? "You have successfully logged in."
            : "You have successfully signed up."
        );
        router.replace("/");
      } else {
        console.error(result.errorMessage);
        toast.error(
          result.errorMessage ||
            (isLoginForm
              ? "An error occurred while logging in."
              : "An error occurred while signing up.")
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
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                type="text"
                required
                disabled={isPending} // Tetap disabled saat loading
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                required
                disabled={isPending} // Tetap disabled saat loading
                className="border rounded px-2 py-1"
                defaultValue=""
              >
                <option value="" disabled>
                  Select role
                </option>
                <option value="petani">petani</option>
                <option value="pengolah">pengolah</option>
                <option value="pembeli">pembeli</option>
                <option value="admin_komunitas">admin komunitas</option>
              </select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Enter your location"
                type="text"
                required
                disabled={isPending} // Tetap disabled saat loading
              />
            </div>
          </>
        )}
        {/* Input email dan password SELALU tampil */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter your email"
            type="email"
            required
            disabled={isPending} // Tetap disabled saat loading
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="Enter your password"
            type="password"
            required
            disabled={isPending} // Tetap disabled saat loading
          />
        </div>
        {/* Confirm Password hanya saat sign up, tepat di bawah password */}
        {!isLoginForm && (
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              type="password"
              required
              disabled={isPending} // Tetap disabled saat loading
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-4 flex flex-col gap-6">
        <Button className="w-full" disabled={isPending}> {/* <-- disabled hanya di tombol */}
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : isLoginForm ? (
            "Login"
          ) : (
            "Sign Up"
          )}
        </Button>
        {/* Tombol "Forgot Password" hanya muncul di form login */}
        {isLoginForm && (
          <Link
            href="/forgot-password"
            className="text-sm text-blue-500 hover:underline" // <-- Hapus kondisi isPending di sini
          >
            Forgot password?
          </Link>
        )}

        <p className="text-xs">
          {isLoginForm ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link
            href={isLoginForm ? "/sign-up" : "/login"}
            className={`text-blue-500 ${
              isPending ? "pointer-events-none opacity-50" : "" // <-- Biarkan ini jika Anda ingin menonaktifkan link Sign Up/Login saat isPending
            }`}
          >
            {isLoginForm ? "Sign Up" : "Login"}
          </Link>
        </p>
      </CardFooter>
    </form>
  );
};

export default AuthForm;