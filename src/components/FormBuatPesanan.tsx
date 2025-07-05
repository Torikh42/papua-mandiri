// components/FormBuatPesanan.tsx
"use client";

import React, { useState, useTransition } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { createPesananPemerintahAction } from "@/action/productAction";
import { Loader2 } from "lucide-react";

type FormBuatPesananProps = {
  produk: { id: string; judul: string; stok: number };
  onActionComplete: () => void;
};

const FormBuatPesanan = ({ produk, onActionComplete }: FormBuatPesananProps) => {
  const [jumlah, setJumlah] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (jumlah > produk.stok) {
      toast.error(`Stok tidak mencukupi. Stok tersedia: ${produk.stok}`);
      return;
    }

    startTransition(async () => {
      const result = await createPesananPemerintahAction(produk.id, jumlah, catatan);
      if ("success" in result && result.success) {
        toast.success(`Berhasil memesan ${jumlah} unit ${produk.judul}.`);
        onActionComplete();
      } else {
        toast.error("Gagal membuat pesanan.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p>Anda akan membuat pesanan untuk: <strong>{produk.judul}</strong></p>
      <p className="text-sm text-gray-500">Stok tersedia: {produk.stok} unit</p>
      <div className="grid gap-2">
        <Label htmlFor="jumlah">Jumlah Dipesan</Label>
        <Input
          id="jumlah"
          type="number"
          min="1"
          max={produk.stok}
          value={jumlah}
          onChange={(e) => setJumlah(Number(e.target.value))}
          required
          disabled={isPending}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="catatan">Catatan Pesanan (Opsional)</Label>
        <Textarea
          id="catatan"
          placeholder="Instruksi pengiriman, dll."
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Buat Pesanan
      </Button>
    </form>
  );
};

export default FormBuatPesanan;