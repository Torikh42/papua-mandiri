// components/Materi/MateriCard.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Tipe data untuk Kategori yang di-join (dari tabel Kategori)
interface CategoryData {
  id: string;
  name: string;
}

// Tipe data untuk Materi, sesuai dengan skema DB Anda dan hasil JOIN dari getAllMateriAction
export interface Materi { // Export interface Materi agar bisa diimpor di page.tsx
  id: string;
  judul: string;
  description: string;
  image_url?: string | null; // Bisa null jika tidak ada gambar
  video_url?: string | null; // Bisa null jika tidak ada video
  langkah_langkah: string[];
  uploader_id?: string | null; // Bisa null jika ON DELETE SET NULL
  category: CategoryData; // Category sekarang adalah objek CategoryData
  created_at: string;
  views_count?: number | null; // Opsional jika ada kolom ini di DB
}

interface MateriCardProps {
  materi: Materi;
}

const MateriCard: React.FC<MateriCardProps> = ({ materi }) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Link mengarah ke halaman detail materi menggunakan ID */}
      <Link href={`/materi-details/${materi.id}`} className="block">
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
          {materi.image_url ? (
            <Image
              src={materi.image_url}
              alt={materi.judul}
              layout="fill" // Menggunakan layout="fill" untuk gambar responsif
              objectFit="cover" // Gambar akan mengisi area div
              className="transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-300 text-gray-600 text-sm">
              Gambar Tidak Tersedia
            </div>
          )}
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start mb-1">
            <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
              {materi.judul}
            </CardTitle>
            {/* Menampilkan nama kategori dari objek category yang di-join */}
            {materi.category?.name && ( 
              <Badge variant="secondary" className="capitalize text-xs whitespace-nowrap">
                {materi.category.name.replace(/_/g, ' ')} {/* Mengganti underscore dengan spasi */}
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm text-gray-600 line-clamp-3">
            {materi.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 text-xs text-gray-500">
          {/* Menampilkan tanggal upload dengan format lokal */}
          <p>Diupload: {new Date(materi.created_at).toLocaleDateString('id-ID')}</p>
        </CardContent>
      </Link>
    </Card>
  );
};

export default MateriCard;