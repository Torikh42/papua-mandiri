// app/materi-details/[id]/page.tsx
"use client"; // <<<--- PENTING: Ubah menjadi Client Component

import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Import Server Actions yang sudah di-refactor
import {
  getMateriByIdAction,
  incrementMateriViewCountAction,
} from "@/action/materiDetails"; // <<<--- PERHATIKAN PATH: dari "@/action/materiDetails" menjadi "@/actions/materiAction"

// Import Server Actions untuk fitur simpan materi
import { saveMateriAction, removeSavedMateriAction, isMateriSavedAction } from '@/action/savedMateriAction';

// Import UI components dari Shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Bookmark, BookmarkCheck, Loader2 } from "lucide-react"; // Ikon panah kembali, Bookmark, BookmarkCheck, Loader2
import { Button } from "@/components/ui/button";
import { toast } from 'sonner'; // Untuk notifikasi pop-up

// Tipe data untuk Kategori yang di-join (sesuaikan dengan skema Supabase Anda)
interface CategoryData {
  id: string;
  judul: string; // Menggunakan 'judul' sesuai dengan skema kategori yang di-join
}

// Tipe data untuk Materi, harus sama persis dengan yang di MateriCard.tsx dan skema DB
interface MateriDetail {
  id: string;
  judul: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  langkah_langkah: string[];
  uploader_id: string;
  category_id: string;
  created_at: string;
  views_count: number | null;
  category: CategoryData | null; // Category bisa null jika tidak ada join atau data kategori tidak ditemukan
}

export default function MateriDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [materi, setMateri] = useState<MateriDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false); // State untuk status simpan materi
  const [isSaving, startSavingTransition] = useTransition(); // Untuk status loading saat menyimpan/menghapus simpanan

  useEffect(() => {
    const fetchMateriAndStatus = async () => {
      setLoading(true);
      setErrorMessage(null);

      // 1. Fetch materi detail
      const { materi: fetchedMateri, errorMessage: materiError } = await getMateriByIdAction(id);

      if (materiError || !fetchedMateri) {
        setErrorMessage(materiError || "Materi tidak ditemukan.");
        setLoading(false);
        // Jika Anda ingin mengarahkan ke halaman 404, Anda bisa menggunakan:
        // router.push('/404'); atau notFound(); (jika di Server Component)
        return;
      }

      setMateri(fetchedMateri as MateriDetail); // Cast ke MateriDetail

      // 2. Increment view count (dipanggil di client side setelah materi berhasil diambil)
      await incrementMateriViewCountAction(fetchedMateri.id);

      // 3. Cek status simpan materi untuk user yang sedang login
      const { isSaved: savedStatus, errorMessage: savedError } = await isMateriSavedAction(fetchedMateri.id);
      if (savedError) {
        console.error("Error checking saved status:", savedError);
        // Tampilkan toast error jika perlu, tapi jangan blokir halaman
        toast.error(`Gagal memeriksa status simpanan: ${savedError}`);
      } else {
        setIsSaved(savedStatus);
      }

      setLoading(false);
    };

    fetchMateriAndStatus();
  }, [id]); // Dependensi ID materi agar fetch ulang jika ID berubah

  // Handler untuk tombol simpan/batalkan simpan
  const handleSaveToggle = () => {
    if (!materi) return; // Pastikan materi sudah dimuat

    startSavingTransition(async () => {
      let result;
      if (isSaved) {
        // Jika sudah disimpan, batalkan simpan
        result = await removeSavedMateriAction(materi.id);
      } else {
        // Jika belum disimpan, simpan
        result = await saveMateriAction(materi.id);
      }

      if (result.success) {
        setIsSaved(!isSaved); // Toggle status
        toast.success(isSaved ? "Materi berhasil dihapus dari simpanan Anda." : "Materi berhasil disimpan!");
      } else {
        toast.error(result.errorMessage || "Gagal mengubah status simpanan materi.");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="ml-3 text-xl text-gray-600">Memuat materi...</p>
      </div>
    );
  }

  if (errorMessage || !materi) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 text-center">
        <Card className="max-w-md mx-auto p-6 bg-red-50 border border-red-200">
          <CardTitle className="text-xl text-red-600">Terjadi Kesalahan</CardTitle>
          <CardDescription className="text-red-500 mt-2">{errorMessage || "Materi tidak ditemukan."}</CardDescription>
          <p className="mt-4 text-sm">
            <Link href="/materi" className="text-blue-500 hover:underline">
              Kembali ke Daftar Materi
            </Link>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" asChild>
          <Link
            href="/materi"
            className="flex items-center text-green-600 hover:text-green-800"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Kembali ke Daftar Materi
          </Link>
        </Button>
        {/* Tombol Simpan/Batalkan Simpan */}
        <Button
          variant={isSaved ? "default" : "outline"}
          className={isSaved ? "bg-green-500 hover:bg-green-600 text-white" : "border-green-500 text-green-500 hover:bg-green-50"}
          onClick={handleSaveToggle}
          disabled={isSaving} // Nonaktifkan tombol saat proses saving/unsaving
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengubah...
            </>
          ) : isSaved ? (
            <>
              <BookmarkCheck className="mr-2 h-4 w-4" /> Tersimpan
            </>
          ) : (
            <>
              <Bookmark className="mr-2 h-4 w-4" /> Simpan Materi
            </>
          )}
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="p-6">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-3xl font-bold text-[#4c7a6b] mr-4">
              {materi.judul}
            </CardTitle>
            {materi.category?.judul && ( // <<<--- Menggunakan 'judul' untuk nama kategori
              <Badge
                variant="secondary"
                className="capitalize text-sm whitespace-nowrap bg-blue-100 text-blue-800"
              >
                {materi.category.judul.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
          <CardDescription className="text-gray-600 text-base">
            {materi.description}
          </CardDescription>
          <p className="text-sm text-gray-500 mt-2">
            Diupload: {new Date(materi.created_at).toLocaleDateString("id-ID")}
            {materi.views_count !== undefined &&
              materi.views_count !== null && (
                <span className="ml-4">Dilihat: {materi.views_count} kali</span>
              )}
          </p>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {materi.image_url && (
            <div className="relative w-full h-80 bg-gray-200 rounded-md overflow-hidden mb-6">
              <Image
                src={materi.image_url}
                alt={`Gambar untuk ${materi.judul}`}
                layout="fill"
                objectFit="contain"
                className="rounded-md"
              />
            </div>
          )}

          {materi.video_url && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3 text-gray-700">
                Video Tutorial
              </h2>
              <div
                className="relative w-full"
                style={{ paddingBottom: "56.25%", height: 0 }}
              >
                {/* Embed YouTube atau video lainnya. Pastikan URL video adalah embeddable */}
                {/* Contoh untuk YouTube: ganti watch?v= menjadi embed/ */}
                <iframe
                  src={
                    materi.video_url.includes("youtube.com/watch?v=")
                      ? materi.video_url.replace("watch?v=", "embed/")
                      : materi.video_url
                  }
                  title={`Video: ${materi.judul}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full rounded-md border-0"
                ></iframe>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {materi.langkah_langkah && materi.langkah_langkah.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-700">
                Langkah-Langkah Pengolahan
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                {materi.langkah_langkah.map((step: string, index: number) => (
                  <li key={index} className="text-base leading-relaxed">
                    <strong className="text-[#4c7a6b]">
                      Langkah {index + 1}:
                    </strong>{" "}
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {(!materi.langkah_langkah || materi.langkah_langkah.length === 0) && (
            <p className="text-gray-500 italic">
              Tidak ada langkah-langkah detail yang tersedia untuk materi ini.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}