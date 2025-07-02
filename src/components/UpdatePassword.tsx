"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createClient } from "@/auth/client";
import { updatePasswordSchema } from "@/schema/userSchema";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient();

export default function UpdatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const initialCallbackProcessed = useRef(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (initialCallbackProcessed.current) {
        setLoadingInitial(false);
        return;
      }
      initialCallbackProcessed.current = true;

      console.log("Starting auth callback...");
      console.log("Search params:", Object.fromEntries(searchParams.entries()));

      try {

        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        const errorCode = searchParams.get("error_code");

        if (errorParam) {
          console.error("Error in URL:", {
            errorParam,
            errorDescription,
            errorCode,
          });
          if (
            errorCode === "otp_expired" ||
            errorDescription?.includes("expired")
          ) {
            setError("Tautan reset password sudah kedaluwarsa.");
          } else if (errorParam === "access_denied") {
            setError("Akses ditolak.");
          } else {
            setError("Tautan verifikasi tidak valid.");
          }
          setShowForm(false);
          setLoadingInitial(false);
          return;
        }
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        const code = searchParams.get("code");

        console.log("Auth parameters:", { tokenHash, type, code });

        let sessionSet = false;

        if (tokenHash && type === "recovery") {
          console.log("Processing PKCE recovery flow with token_hash...");

          try {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: "recovery",
            });

            if (verifyError) {
              console.error("OTP verification error:", verifyError);
              if (verifyError.message.includes("expired")) {
                setError(
                  "Tautan reset password sudah kedaluwarsa. Silakan minta tautan baru."
                );
              } else if (verifyError.message.includes("invalid")) {
                setError("Tautan tidak valid. Silakan minta tautan baru.");
              } else {
                setError("Gagal memverifikasi tautan. Silakan coba lagi.");
              }
              setShowForm(false);
            } else if (data?.session) {
              console.log("Successfully verified OTP and got session");
              sessionSet = true;
              setSessionValid(true);
              setError(null);
              setShowForm(true);
              // Clean up URL
              window.history.replaceState({}, "", "/update-password");
            } else {
              console.error("No session after OTP verification");
              setError("Gagal memverifikasi tautan. Silakan coba lagi.");
              setShowForm(false);
            }
          } catch (err) {
            console.error("Exception during OTP verification:", err);
            setError("Terjadi kesalahan saat memverifikasi tautan.");
            setShowForm(false);
          }
        }
        else if (code) {
          console.log("Processing code exchange...");

          try {
            const { data, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              console.error("Code exchange error:", exchangeError);
              setError("Tautan tidak valid atau sudah kedaluwarsa.");
              setShowForm(false);
            } else if (data?.session) {
              console.log("Successfully exchanged code for session");
              sessionSet = true;
              setSessionValid(true);
              setError(null);
              setShowForm(true);
              window.history.replaceState({}, "", "/update-password");
            }
          } catch (err) {
            console.error("Exception during code exchange:", err);
            setError("Terjadi kesalahan saat memverifikasi tautan.");
            setShowForm(false);
          }
        }
        // Check for existing session
        else {
          console.log("Checking for existing session...");

          try {
            const {
              data: { session },
              error: sessionCheckError,
            } = await supabase.auth.getSession();
            if (sessionCheckError) {
              console.error("Session check error:", sessionCheckError);
              setError("Terjadi kesalahan saat memeriksa sesi.");
              setShowForm(false);
            } else if (session) {
              console.log("Found existing valid session");
              sessionSet = true;
              setSessionValid(true);
              setShowForm(true);
              setError(null);
            }
          } catch (err) {
            console.error("Exception during session check:", err);
            setError("Terjadi kesalahan saat memeriksa sesi.");
            setShowForm(false);
          }
        }

        if (!sessionSet && !errorParam) {
          console.log("No valid session found, showing error");
          setError(
            "Tautan tidak valid atau sudah kedaluwarsa. Silakan minta tautan reset password baru."
          );
          setShowForm(false);
        }
      } catch (err: unknown) {
        console.error("Exception in handleAuthCallback:", err);
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.";
        setError(message);
        setShowForm(false);
      } finally {
        setLoadingInitial(false);
      }
    };

    handleAuthCallback();
  }, [searchParams]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log(
          "Auth state changed:",
          event,
          session?.user?.id || "no session"
        );

        if (event === "SIGNED_IN" && session) {
          setSessionValid(true);
          setShowForm(true);
          setError(null);
        } else if (event === "SIGNED_OUT") {
          setSessionValid(false);
          setShowForm(false);
        } else if (event === "TOKEN_REFRESHED" && session) {
          setSessionValid(true);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const result = updatePasswordSchema.safeParse({
      password,
      confirmPassword,
    });
    if (!result.success) {
      const firstError = result.error.errors[0]?.message;
      console.warn("⚠️ Validasi Gagal (Frontend):", result.error.errors);
      setError(firstError || "Validasi gagal.");
      setIsPending(false);
      return;
    }
    try {
      // Check session before updating
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error("Session check failed:", sessionError);
        setError(
          "Sesi tidak valid atau kedaluwarsa. Silakan minta tautan baru."
        );
        setIsPending(false);
        return;
      }

      console.log("Updating password...");

      // Update password directly using Supabase client
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error("Update password failed:", updateError);

        if (updateError.message.includes("Password should be at least")) {
          setError("Password terlalu pendek. Minimal 8 karakter.");
        } else if (
          updateError.message.includes("New password should be different")
        ) {
          setError("Password baru harus berbeda dari password lama.");
        } else {
          setError("Gagal memperbarui password. Silakan coba lagi.");
        }
        setIsPending(false);
        return;
      }

      console.log("Password updated successfully");
      toast.success("Password berhasil diubah! Silakan login kembali.");

      // Sign out user for security
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err: unknown) {
      console.error("Exception during password update:", err);
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-sm text-center p-6">
          <CardTitle className="text-xl">Memverifikasi Tautan...</CardTitle>
          <CardDescription className="mt-2">
            Memeriksa tautan reset password Anda. Mohon tunggu...
          </CardDescription>
          <Loader2 className="h-8 w-8 animate-spin mt-4 mx-auto" />
        </Card>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-sm text-center p-6">
          <CardTitle className="text-xl text-red-600">
            Terjadi Kesalahan
          </CardTitle>
          <CardDescription className="text-red-500 mt-2">
            {error || "Tautan tidak valid."}
          </CardDescription>
          <div className="mt-4 text-sm space-y-2">
            <p>
              Kembali ke halaman{" "}
              <Link
                href="/forgot-password"
                className="text-blue-500 hover:underline"
              >
                Lupa Kata Sandi
              </Link>{" "}
              untuk mencoba lagi.
            </p>
            <p className="text-xs text-gray-500">
              Pastikan Anda menggunakan tautan terbaru dari email Anda.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Atur Ulang Kata Sandi
          </CardTitle>
          <CardDescription>
            Masukkan kata sandi baru Anda di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Kata Sandi Baru</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isPending}
                minLength={8}
                placeholder="Minimal 8 karakter"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">
                Konfirmasi Kata Sandi Baru
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isPending}
                minLength={8}
                placeholder="Ulangi kata sandi baru"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !sessionValid}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mereset...
                </>
              ) : (
                "Reset Kata Sandi"
              )}
            </Button>
            {sessionValid && (
              <p className="text-green-600 text-xs text-center">
                ✓ Sesi terverifikasi, Anda dapat mereset password
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
