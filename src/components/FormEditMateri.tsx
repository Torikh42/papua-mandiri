"use client";

import React, { useState, useTransition } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateMateriAction } from "@/action/materiDetails";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Materi } from "./MateriCard";

type FormEditMateriProps = {
  materi: Materi;
  onActionComplete: () => void;
  categories?: Array<{ id: string; judul: string }>; // Add categories prop
};

const FormEditMateri = ({
  materi,
  onActionComplete,
  categories = [],
}: FormEditMateriProps) => {
  const [isPending, startTransition] = useTransition();
  const [langkah_langkah, setLangkahLangkah] = useState<string[]>(
    materi.langkah_langkah?.length > 0 ? materi.langkah_langkah : [""]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    materi.category || ""
  );

  const handleLangkahChange = (index: number, value: string) => {
    const newLangkah = [...langkah_langkah];
    newLangkah[index] = value;
    setLangkahLangkah(newLangkah);
  };

  const addLangkah = () => setLangkahLangkah([...langkah_langkah, ""]);

  const removeLangkah = (index: number) => {
    if (langkah_langkah.length > 1) {
      const newLangkah = langkah_langkah.filter((_, i) => i !== index);
      setLangkahLangkah(newLangkah);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Add category to form data
    formData.set("category", selectedCategory);

    // Clear existing langkah_langkah and add filtered ones
    formData.delete("langkah_langkah");
    langkah_langkah
      .filter((step) => step.trim() !== "")
      .forEach((step) => formData.append("langkah_langkah", step.trim()));

    // Validate required fields
    const judul = formData.get("judul") as string;
    const description = formData.get("description") as string;

    if (!judul?.trim()) {
      toast.error("Judul materi harus diisi.");
      return;
    }

    if (!description?.trim()) {
      toast.error("Deskripsi materi harus diisi.");
      return;
    }

    if (!selectedCategory) {
      toast.error("Kategori materi harus dipilih.");
      return;
    }

    const validSteps = langkah_langkah.filter((step) => step.trim() !== "");
    if (validSteps.length === 0) {
      toast.error("Minimal satu langkah harus diisi.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateMateriAction(materi.id, formData);

        if (result) {
          toast.success(`Materi '${judul}' berhasil diperbarui!`);
          onActionComplete();
        } else {
          toast.error("Gagal memperbarui materi.");
        }
      } catch (error) {
        console.error("Error updating materi:", error);
        toast.error("Terjadi kesalahan saat memperbarui materi.");
      }
    });
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Materi: {materi.judul}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Judul Materi */}
        <div className="space-y-2">
          <Label htmlFor="judul">Judul Materi *</Label>
          <Input
            id="judul"
            name="judul"
            defaultValue={materi.judul}
            disabled={isPending}
            required
          />
        </div>

        {/* Deskripsi */}
        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi *</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={materi.description}
            disabled={isPending}
            rows={4}
            required
          />
        </div>

        {/* Kategori */}
        <div className="space-y-2">
          <Label htmlFor="category">Kategori *</Label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.judul}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gambar */}
        <div className="space-y-2">
          <Label htmlFor="imageFile">Gambar Materi</Label>
          {materi.image_url && (
            <div className="mb-2">
              <p className="text-sm text-gray-600 mb-2">Gambar saat ini:</p>
              <Image
                src={materi.image_url}
                alt={materi.judul}
                width={200}
                height={150}
                className="rounded-md object-cover border"
              />
            </div>
          )}
          <Input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
            disabled={isPending}
          />
          <p className="text-sm text-gray-500">
            Kosongkan jika tidak ingin mengubah gambar
          </p>
        </div>

        {/* Video */}
        <div className="space-y-2">
          <Label htmlFor="videoFile">Video Materi</Label>
          {materi.video_url && (
            <div className="mb-2">
              <p className="text-sm text-gray-600 mb-2">Video saat ini:</p>
              <a
                href={materi.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                Lihat Video Saat Ini
              </a>
            </div>
          )}
          <Input
            id="videoFile"
            name="videoFile"
            type="file"
            accept="video/*"
            disabled={isPending}
          />
          <p className="text-sm text-gray-500">
            Kosongkan jika tidak ingin mengubah video
          </p>
        </div>

        {/* Langkah-langkah */}
        <div className="space-y-2">
          <Label>Langkah-Langkah *</Label>
          {langkah_langkah.map((langkah, index) => (
            <div key={index} className="flex gap-2 items-center">
              <div className="flex-1">
                <Input
                  placeholder={`Langkah ${index + 1}`}
                  value={langkah}
                  onChange={(e) => handleLangkahChange(index, e.target.value)}
                  disabled={isPending}
                />
              </div>
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

        <DialogFooter className="pt-6">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memperbarui...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default FormEditMateri;
