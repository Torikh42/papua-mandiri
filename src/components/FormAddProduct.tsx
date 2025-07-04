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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createProductAction } from "@/action/productAction"; // ➕ Ganti path sesuai struktur folder kamu

const FormAddProduk = () => {
  const [isPending, startTransition] = useTransition();

  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [harga, setHarga] = useState<number | "">("");
  const [stok, setStok] = useState<number | "">("");
  const [alamat, setAlamat] = useState("");

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createProductAction(formData);

      if ("success" in result && result.success) {
        toast.success(`Produk '${judul}' berhasil ditambahkan!`);
        setJudul("");
        setDeskripsi("");
        setHarga("");
        setStok("");
        setAlamat("");
      } else {
        toast.error(result.errorMessage || "Gagal menambahkan produk.");
      }
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto text-center">
      <CardHeader>
        <CardTitle>Tambah Produk Baru</CardTitle>
        <CardDescription>Ajukan Produk Baru untuk Dijual.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="judul">Judul Produk</Label>
            <Input
              id="judul"
              name="judul"
              required
              placeholder="Contoh: Kopi Gayo"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              name="deskripsi"
              required
              placeholder="Tulis deskripsi lengkap produk"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="harga">Harga</Label>
            <Input
              id="harga"
              name="harga"
              type="number"
              required
              placeholder="10000"
              value={harga}
              onChange={(e) => setHarga(Number(e.target.value))}
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
              placeholder="Contoh: 20"
              value={stok}
              onChange={(e) => setStok(Number(e.target.value))}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Input
              id="alamat"
              name="alamat"
              required
              placeholder="Contoh: Desa XYZ, Kecamatan ABC"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              disabled={isPending}
            />
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
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Tambah Produk"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormAddProduk;
