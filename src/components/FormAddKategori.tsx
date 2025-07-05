// components/FormAddKategori.tsx
"use client";
import React, { useState, useTransition } from "react";
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
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { createCategoryAction } from "@/action/kategoriAction";
import { Textarea } from "./ui/textarea";

const FormAddKategori = () => {
  const [isPending, startTransition] = useTransition();
  const [judul, setJudul] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (formData: FormData) => {
    if (!judul.trim()) {
      toast.error("Nama kategori tidak boleh kosong");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createCategoryAction(formData);

        if ("success" in result && result.success) {
          toast.success(`Kategori '${judul}' berhasil ditambahkan!`);
          setJudul("");
          setDescription("");
        } else {
          toast.error(result.errorMessage || "Gagal menambahkan kategori.");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan saat menambahkan kategori.");
        console.error("Error adding category:", error);
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="pb-6">
        <CardTitle
          className="flex items-center gap-2"
          style={{ color: "#4c7a6b" }}
        >
          <Plus className="h-5 w-5" />
          Tambah Kategori Baru
        </CardTitle>
        <CardDescription>
          Buat kategori baru untuk mengorganisir materi SDA Anda dengan lebih
          baik.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="judul" className="text-sm font-medium">
              Nama Kategori <span className="text-red-500">*</span>
            </Label>
            <Input
              id="judul"
              name="judul"
              placeholder="Contoh: Kopi, Sagu, Perikanan"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              disabled={isPending}
              className="focus:border-[#4c7a6b] focus:ring-[#4c7a6b]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Deskripsi
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Berikan deskripsi singkat tentang kategori ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={4}
              className="focus:border-[#4c7a6b] focus:ring-[#4c7a6b]"
            />
            <p className="text-xs text-gray-500">
              Deskripsi akan membantu pengguna memahami kategori ini dengan
              lebih baik.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isPending || !judul.trim()}
              className="flex-1 bg-[#4c7a6b] hover:bg-[#3d6156] text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kategori
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setJudul("");
                setDescription("");
              }}
              disabled={isPending}
              className="px-6"
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormAddKategori;
