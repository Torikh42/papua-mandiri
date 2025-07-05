// components/ReviewProdukDialog.tsx
"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateProdukStatusAction } from "@/action/productAction";

// Tipe data untuk props yang diterima
type ReviewProdukDialogProps = {
  produk: {
    id: string;
    judul: string;
    description: string;
    harga: number;
    stok: number;
    alamat: string;
    imageUrl: string | null;
  };
  onActionComplete: () => void;
};

const ReviewProdukDialog = ({
  produk,
  onActionComplete,
}: ReviewProdukDialogProps) => {
  const [catatan, setCatatan] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (status: "disetujui" | "ditolak") => {
    startTransition(async () => {
      const result = await updateProdukStatusAction(produk.id, status, catatan);
      if (result.success) {
        toast.success(`Produk "${produk.judul}" telah berhasil di-${status}.`);
        onActionComplete(); // Panggil callback untuk refresh & tutup dialog
      } else {
        toast.error(result.errorMessage || "Gagal memperbarui status produk.");
      }
    });
  };

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>{produk.judul}</DialogTitle>
        <DialogDescription>
          Tinjau detail produk di bawah ini dan berikan persetujuan atau
          penolakan.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto">
        {/* Kolom Gambar */}
        <div className="flex items-center justify-center bg-gray-100 rounded-md">
          {produk.imageUrl ? (
            <Image
              src={produk.imageUrl}
              alt={produk.judul}
              width={400}
              height={400}
              className="rounded-md object-contain"
            />
          ) : (
            <div className="text-gray-500">Tidak ada gambar</div>
          )}
        </div>

        {/* Kolom Detail */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Deskripsi</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {produk.description}
            </p>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg">Detail Lainnya</h3>
            <dl className="mt-2 text-sm text-gray-900">
              <div className="flex justify-between">
                <dt className="text-gray-500">Harga</dt>
                <dd>Rp {produk.harga.toLocaleString("id-ID")}</dd>
              </div>
              <div className="flex justify-between mt-1">
                <dt className="text-gray-500">Stok</dt>
                <dd>{produk.stok} unit</dd>
              </div>
              <div className="flex flex-col mt-2">
                <dt className="text-gray-500">Alamat</dt>
                <dd className="mt-1">{produk.alamat}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Form Aksi */}
      <div className="space-y-2 pt-4 border-t">
        <Label htmlFor="catatan">Catatan untuk Komunitas (Opsional)</Label>
        <Textarea
          id="catatan"
          placeholder="Tuliskan alasan persetujuan atau penolakan di sini..."
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          disabled={isPending}
        />
      </div>

      <DialogFooter className="pt-4">
        <Button
          variant="destructive"
          onClick={() => handleUpdateStatus("ditolak")}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{" "}
          Tolak
        </Button>
        <Button
          onClick={() => handleUpdateStatus("disetujui")}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{" "}
          Setujui
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ReviewProdukDialog;
