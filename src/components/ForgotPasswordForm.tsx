
"use client"; 

import { useState } from "react";
import { forgotPasswordAction } from "@/action/userAction"; 
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
import { toast } from "sonner"; 

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const result = await forgotPasswordAction(email);

    if (result.success) {
      toast.success(
        result.message ||
          "Link reset password telah dikirim ke email Anda. Silakan cek kotak masuk Anda."
      );
      setEmail(""); 
    } else {
      toast.error(
        result.errorMessage ||
          "Terjadi kesalahan saat mengirim link reset password. Silakan coba lagi nanti."
      );
    }

    setIsPending(false);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Lupa Kata Sandi?</CardTitle>
        <CardDescription>
          Masukkan email Anda di bawah ini untuk menerima tautan reset kata
          sandi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Tautan Reset"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
