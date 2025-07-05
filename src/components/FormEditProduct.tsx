// components/FormEditProduk.tsx
"use client";

import React, { useTransition } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProdukAction } from "@/action/productAction";
import Image from "next/image";
import { z } from "zod";
import { productSchema } from "@/schema/productSchema";

// ✅ Infer tipe produk dari schema
type Produk = z.infer<typeof productSchema> & { id: string }; // tambah id

type FormEditProdukProps = {
  produk: Produk;
  onActionComplete: () => void;
};

const FormEditProduk = ({ produk, onActionComplete }: FormEditProdukProps) => {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateProdukAction(produk.id, formData);
      if ("success" in result && result.success) {
        toast.success(`Produk '${produk.judul}' berhasil diperbarui!`);
        onActionComplete();
      } else {
        toast.error(result.errorMessage || "Gagal memperbarui produk.");
      }
    });
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Edit Produk: {produk.judul}</DialogTitle>
        <DialogDescription>
          Perbarui detail produk Anda. Status akan kembali menjadi .
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="judul">Judul Produk</Label>
          <Input
            id="judul"
            name="judul"
            required
            defaultValue={produk.judul}
            disabled={isPending}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            name="description"
            required
            defaultValue={produk.description}
            disabled={isPending}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="harga">Harga</Label>
            <Input
              id="harga"
              name="harga"
              type="number"
              required
              defaultValue={produk.harga}
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stok">Stok</Label>
            <Input
              id="stok"
              name="stok"
              type="number"
              required
              defaultValue={produk.stok}
              disabled={isPending}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="alamat">Alamat</Label>
          <Input
            id="alamat"
            name="alamat"
            required
            defaultValue={produk.alamat}
            disabled={isPending}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">Ganti Gambar Produk (Opsional)</Label>
          {produk.imageUrl && (
            <div className="my-2">
              <p className="text-sm mb-1 text-gray-500">Gambar saat ini:</p>
              <Image
                src={produk.imageUrl}
                alt={produk.judul}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
            </div>
          )}
          <Input
            id="imageUrl"
            name="imageUrl"
            type="file"
            accept="image/*"
            disabled={isPending}
          />
        </div>
        <DialogFooter className="pt-4">
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

export default FormEditProduk;
