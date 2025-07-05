"use client";

import React, { useRef, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { ajukanProdukAction } from "@/action/productAction";

// 1. Definisikan tipe untuk props yang akan diterima komponen
type FormAjukanProdukProps = {
  onProductSubmitted: () => void; // Menerima sebuah fungsi tanpa parameter
};

// 2. Terima props di dalam function signature komponen
const FormAjukanProduk = ({ onProductSubmitted }: FormAjukanProdukProps) => {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const judulProduk = formData.get("judul") as string;

    startTransition(async () => {
      const result = await ajukanProdukAction(formData);

      if ("success" in result && result.success) {
        toast.success(`Produk '${judulProduk}' berhasil diajukan!`);
        formRef.current?.reset();
        onProductSubmitted();
      } else {
        // --- TAMBAHKAN CONSOLE.ERROR DI SINI ---
        console.error("Detail Error:", result);
        toast.error(
          result.errorMessage || "Terjadi kesalahan yang tidak diketahui."
        );
      }
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-sm border-0 bg-white">
      <CardHeader className="text-center pb-4">
        <CardTitle
          className="text-lg sm:text-xl font-semibold flex items-center justify-center gap-2"
          style={{ color: "#4c7a6b" }}
        >
          <Plus className="h-5 w-5" />
          Ajukan Produk Baru
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Produk yang Anda ajukan akan ditinjau oleh pemerintah sebelum
          ditampilkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label
              htmlFor="judul"
              className="font-medium"
              style={{ color: "#4c7a6b" }}
            >
              Judul Produk
            </Label>
            <Input
              id="judul"
              name="judul"
              required
              placeholder="Contoh: Madu Hutan Asli"
              disabled={isPending}
              className="border-gray-300 focus:border-[#4c7a6b] focus:ring-[#4c7a6b]"
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="description"
              className="font-medium"
              style={{ color: "#4c7a6b" }}
            >
              Deskripsi
            </Label>
            <Textarea
              id="description"
              name="description"
              required
              placeholder="Tulis deskripsi lengkap produk Anda..."
              disabled={isPending}
              className="border-gray-300 focus:border-[#4c7a6b] focus:ring-[#4c7a6b] min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label
                htmlFor="harga"
                className="font-medium"
                style={{ color: "#4c7a6b" }}
              >
                Harga (Rp)
              </Label>
              <Input
                id="harga"
                name="harga"
                type="number"
                required
                placeholder="50000"
                disabled={isPending}
                className="border-gray-300 focus:border-[#4c7a6b] focus:ring-[#4c7a6b]"
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="stok"
                className="font-medium"
                style={{ color: "#4c7a6b" }}
              >
                Stok
              </Label>
              <Input
                id="stok"
                name="stok"
                type="number"
                required
                placeholder="100"
                disabled={isPending}
                className="border-gray-300 focus:border-[#4c7a6b] focus:ring-[#4c7a6b]"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="alamat"
              className="font-medium"
              style={{ color: "#4c7a6b" }}
            >
              Alamat
            </Label>
            <Input
              id="alamat"
              name="alamat"
              required
              placeholder="Contoh: Desa Sentani, Jayapura"
              disabled={isPending}
              className="border-gray-300 focus:border-[#4c7a6b] focus:ring-[#4c7a6b]"
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="imageUrl"
              className="font-medium flex items-center gap-2"
              style={{ color: "#4c7a6b" }}
            >
              <Upload className="h-4 w-4" />
              Gambar Produk (Opsional)
            </Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="file"
              accept="image/*"
              disabled={isPending}
              className="border-gray-300 focus:border-[#4c7a6b] focus:ring-[#4c7a6b] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format yang didukung: JPG, PNG, GIF (Max. 5MB)
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full mt-4 transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "#4c7a6b",
              borderColor: "#4c7a6b",
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengajukan Produk...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Ajukan Produk
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormAjukanProduk;
