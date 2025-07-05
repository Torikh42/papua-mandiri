// app/dashboard-user/UserDashboardClient.tsx
"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import { Materi } from "@/components/MateriCard"; // Pastikan path import benar
import MateriCard from "@/components/MateriCard"; // Pastikan path import benar
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { removeSavedMateriAction } from "@/action/savedMateriAction"; // Import action yang sudah ada

// Komponen ini menerima data awal dari Server Component
export default function UserDashboardClient({
  initialMaterials,
}: {
  initialMaterials: Materi[];
}) {
  // State untuk menyimpan daftar materi, diinisialisasi dengan data dari server
  const [materials, setMaterials] = useState(initialMaterials);
  const [isPending, startTransition] = useTransition();

  const handleRemove = (materiId: string) => {
    startTransition(async () => {
      const result = await removeSavedMateriAction(materiId);

      if (result.success) {
        // Hapus item dari state agar UI langsung terupdate
        setMaterials((currentMaterials) =>
          currentMaterials.filter((materi) => materi.id !== materiId)
        );
        toast.success("Materi berhasil dihapus dari simpanan Anda.");
      } else {
        toast.error(result.errorMessage || "Gagal menghapus materi.");
      }
    });
  };

  if (materials.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        <p className="text-xl">Anda belum menyimpan materi apa pun.</p>
        <p className="mt-2">
          Jelajahi{" "}
          <Link href="/materi" className="text-blue-500 hover:underline">
            daftar materi
          </Link>{" "}
          dan mulai menyimpan favorit Anda!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {materials.map((materi) => (
        <div key={materi.id} className="relative group">
          <MateriCard materi={materi} />
          
          {/* Tombol Hapus dengan Dialog Konfirmasi */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                style ={{ backgroundColor: "#4c7a6b" }} // Warna merah
                aria-label="Hapus dari simpanan"
                disabled={isPending}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan menghapus materi "{materi.judul}" dari daftar simpanan Anda. Anda tidak dapat mengurungkan tindakan ini.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  style={{ backgroundColor: "#4c7a6b", color: "#fff" }}
                  className="hover:brightness-90 transition"
                  onClick={() => handleRemove(materi.id)}
                >
                  Ya, Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}