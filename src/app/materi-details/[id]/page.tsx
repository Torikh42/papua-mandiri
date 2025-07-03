// app/materi-details/[id]/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation"; // Untuk menampilkan 404 jika materi tidak ditemukan

// Import Server Actions
import {
  getMateriByIdAction,
  incrementMateriViewCountAction,
} from "@/action/materiDetails";

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
import { ChevronLeft } from "lucide-react"; // Ikon panah kembali
import { Button } from "@/components/ui/button";

// Halaman ini adalah Server Component karena bersifat async dan memanggil Server Action
export default async function MateriDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params; // Ambil ID materi dari URL parameter

  // Panggil Server Action untuk mengambil detail materi
  const result = await getMateriByIdAction(id);

  // Jika materi tidak ditemukan atau a da error, tampilkan halaman Not Found (Next.js convention)
  if (result.errorMessage) {
    console.error(
      `Failed to load materi with ID ${id}: ${result.errorMessage}`
    );
    // Anda bisa mengarahkan ke halaman error khusus atau cukup notFound()
    notFound();
  }

  const materi = "materi" in result ? result.materi : null;

  // Jika materi ditemukan, panggil Server Action untuk menambah view count
  // Ini akan dieksekusi di server saat halaman di-render
  if (materi) {
    await incrementMateriViewCountAction(materi.id);
  }

  // Tampilkan loading state atau error jika materi belum ada (seharusnya ditangani notFound())
  if (!materi) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-gray-500">Materi tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link
            href="/materi"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Kembali ke Daftar Materi
          </Link>
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="p-6">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-3xl font-bold text-gray-800 mr-4">
              {materi.judul}
            </CardTitle>
            {materi.category?.name && (
              <Badge
                variant="secondary"
                className="capitalize text-sm whitespace-nowrap bg-blue-100 text-blue-800"
              >
                {materi.category.name.replace(/_/g, " ")}
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
                objectFit="contain" // Menggunakan 'contain' agar gambar tidak terpotong
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
                    <strong className="text-blue-600">
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

          {/* Anda bisa menambahkan informasi uploader atau tombol edit/delete untuk admin di sini */}
          {/* Misalnya:
          <Separator className="my-6" />
          <p className="text-sm text-gray-500">Diupload oleh: {materi.uploader_id || "Tidak diketahui"}</p>
          */}
        </CardContent>
      </Card>
    </div>
  );
}
