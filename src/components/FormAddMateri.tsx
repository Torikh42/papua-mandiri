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
import { Textarea } from "./ui/textarea";
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
  name: string;
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
      const result = await getAllCategoriesAction();
      if ("success" in result && result.success && result.categories) {
        const mappedCategories = result.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.judul,
        }));
        setCategories(mappedCategories);
        if (mappedCategories.length > 0) {
          setSelectedCategoryId(mappedCategories[0].id);
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

      // Hapus langkah_langkah lama di FormData
      formData.delete("langkah_langkah");
      // Tambahkan langkah_langkah satu per satu (supaya getAll di server menghasilkan array)
      langkah_langkah
        .filter((s) => s.trim() !== "")
        .forEach((item) => formData.append("langkah_langkah", item));

      const result = await createMateriAction(formData);

      if ("success" in result && result.success) {
        toast.success(
          typeof (result as any).message === "string" && (result as any).message
            ? (result as any).message
            : "Materi berhasil ditambahkan!"
        );
      } else {
        toast.error(result.errorMessage || "Gagal menambahkan materi.");
      }
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Tambah Materi Baru</CardTitle>
        <CardDescription>
          Isi detail materi edukasi baru yang akan ditambahkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="judul">Judul Materi</Label>
            <Input
              id="judul"
              name="judul"
              placeholder="Contoh: Pengolahan Kopi Terbaik"
              required
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Deskripsi lengkap materi ini..."
              required
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Kategori SDA</Label>
            {loadingCategories ? (
              <p className="text-sm text-gray-500 flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat
                kategori...
              </p>
            ) : categoryError ? (
              <p className="text-sm text-red-500">{categoryError}</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-yellow-600">
                Belum ada kategori. Silakan tambahkan kategori terlebih dahulu.
              </p>
            ) : (
              <Select
                onValueChange={setSelectedCategoryId}
                value={selectedCategoryId}
                disabled={isPending}
              >
                <SelectTrigger id="category" name="category">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imageUrl">URL Gambar (Opsional)</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              placeholder="http://example.com/gambar.jpg"
              type="url"
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="videoUrl">URL Video (Opsional)</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              placeholder="http://example.com/video.mp4"
              type="url"
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label>Langkah-Langkah</Label>
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
            >
              + Tambah Langkah
            </Button>
          </div>

            <Button
            type="submit"
            disabled={isPending || loadingCategories || categories.length === 0}
            style={{ backgroundColor: "#4c7a6b", color: "#fff" }}
            className="hover:opacity-90"
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
