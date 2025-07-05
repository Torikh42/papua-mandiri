"use client";

import React, { useState, useTransition, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMateriAction } from "@/action/materiDetails";
import { getAllCategoriesAction } from "@/action/kategoriAction";

interface Category {
  id: string;
  judul: string;
}

interface CategoryApiResponse {
  success?: boolean;
  categories?: Category[];
  errorMessage?: string;
}

const FormAddMateri = () => {
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [langkah_langkah, setLangkahLangkah] = useState<string[]>([""]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null);
      const result: CategoryApiResponse = await getAllCategoriesAction();

      if (result.success && Array.isArray(result.categories)) {
        setCategories(result.categories);
        if (result.categories.length > 0) {
          setSelectedCategoryId(result.categories[0].id);
        }
      } else {
        setCategoryError(
          result.errorMessage ||
            "Gagal memuat kategori. Mohon tambahkan kategori terlebih dahulu."
        );
      }
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  const handleLangkahChange = (index: number, value: string) => {
    const newLangkah = [...langkah_langkah];
    newLangkah[index] = value;
    setLangkahLangkah(newLangkah);
  };

  const addLangkah = () => {
    setLangkahLangkah([...langkah_langkah, ""]);
  };

  const removeLangkah = (index: number) => {
    const newLangkah = langkah_langkah.filter((_, i) => i !== index);
    setLangkahLangkah(newLangkah);
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      formData.set("category", selectedCategoryId);
      formData.delete("langkah_langkah");

      langkah_langkah
        .filter((s) => s.trim() !== "")
        .forEach((item) => formData.append("langkah_langkah", item));

      const result = await createMateriAction(formData);

      if ("success" in result && result.success) {
        toast.success(
          typeof result.message === "string" && result.message
            ? result.message
            : "Materi berhasil ditambahkan!"
        );
      } else {
        toast.error(result.errorMessage || "Gagal menambahkan materi.");
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border border-gray-300 shadow-xl overflow-hidden">
      <CardHeader>
        <CardTitle style={{ color: "#4c7a6b" }} className="text-2xl">
          Tambah Materi Baru
        </CardTitle>
        <CardDescription style={{ color: "#4c7a6b" }}>
          Isi detail materi edukasi baru yang akan ditambahkan ke sistem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-5">
          {/* Judul */}
          <div className="grid gap-2">
            <Label htmlFor="judul" style={{ color: "#4c7a6b" }}>
              Judul Materi
            </Label>
            <Input
              id="judul"
              name="judul"
              placeholder="Contoh: Pengolahan Kopi Terbaik"
              required
              disabled={isPending}
            />
          </div>

          {/* Deskripsi */}
          <div className="grid gap-2">
            <Label htmlFor="description" style={{ color: "#4c7a6b" }}>
              Deskripsi
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Deskripsi lengkap materi ini..."
              required
              disabled={isPending}
            />
          </div>

          {/* Kategori */}
          <div className="grid gap-2">
            <Label htmlFor="category" style={{ color: "#4c7a6b" }}>
              Kategori SDA
            </Label>
            {loadingCategories ? (
              <p className="text-sm text-gray-500 flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat
                kategori...
              </p>
            ) : categoryError ? (
              <p className="text-sm text-red-500">{categoryError}</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-yellow-600">
                Belum ada kategori. Tambahkan kategori terlebih dahulu.
              </p>
            ) : (
              <Select
                onValueChange={setSelectedCategoryId}
                value={selectedCategoryId}
                disabled={isPending}
              >
                <SelectTrigger id="category" name="category" className="border">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.judul}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Upload Gambar */}
          <div className="grid gap-2">
            <Label htmlFor="imageFile" style={{ color: "#4c7a6b" }}>
              Gambar Materi (Opsional)
            </Label>
            <Input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/*"
              disabled={isPending}
            />
          </div>

          {/* Upload Video */}
          <div className="grid gap-2">
            <Label htmlFor="videoFile" style={{ color: "#4c7a6b" }}>
              Video Materi (Opsional)
            </Label>
            <Input
              id="videoFile"
              name="videoFile"
              type="file"
              accept="video/*"
              disabled={isPending}
            />
          </div>

          {/* Langkah-langkah */}
          <div className="grid gap-2">
            <Label style={{ color: "#4c7a6b" }}>Langkah-Langkah</Label>
            {langkah_langkah.map((langkah, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder={`Langkah ${index + 1}`}
                  value={langkah}
                  onChange={(e) => handleLangkahChange(index, e.target.value)}
                  disabled={isPending}
                  required={index === 0}
                />
                {langkah_langkah.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLangkah(index)}
                    disabled={isPending}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={addLangkah}
              disabled={isPending}
              className="text-sm"
            >
              + Tambah Langkah
            </Button>
          </div>

          {/* Tombol Submit */}
          <Button
            type="submit"
            disabled={isPending || loadingCategories || categories.length === 0}
            className="bg-[#4c7a6b] hover:bg-[#3d655b] text-white font-semibold transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Tambah Materi"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormAddMateri;
