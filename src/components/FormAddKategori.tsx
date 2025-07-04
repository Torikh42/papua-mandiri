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
import { Loader2 } from "lucide-react";
import { createCategoryAction } from "@/action/kategoriAction"; // Sesuaikan path jika dipisah
import { Textarea } from "./ui/textarea"; // Import Textarea Shadcn

const FormAddKategori = () => {
  const [isPending, startTransition] = useTransition();
  const [judul, setJudul] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createCategoryAction(formData);

      if ("success" in result && result.success) {
        toast.success(`Kategori '${judul}' berhasil ditambahkan!`);
        setJudul(""); // Reset form
        setDescription(""); // Reset form
      } else {
        toast.error(result.errorMessage || "Gagal menambahkan kategori.");
      }
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Tambah Kategori Baru</CardTitle>
        <CardDescription>
          Tambahkan kategori SDA untuk materi atau produk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="judul">Nama Kategori</Label>
            <Input
              id="judul"
              name="judul"
              placeholder="Contoh: Kopi, Sagu, Perikanan"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Deskripsi singkat tentang kategori ini."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Tambah Kategori"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormAddKategori;
