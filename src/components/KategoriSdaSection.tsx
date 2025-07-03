// components/Materi/MateriPopulerSection.tsx
import React from "react";
import MateriCard from "./MateriPopulerCard"; // Import komponen kartu tunggal
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Dummy Data untuk materi populer
const dummyMateriPopuler = [
  {
    id: "materi-1",
    judul: "Panduan Lengkap Pengolahan Kopi Arabika di Papua",
    description:
      "Pelajari langkah-langkah detail dari panen hingga roasting untuk menghasilkan kopi arabika berkualitas tinggi.",
    image_url:
      "https://images.unsplash.com/photo-1511920170033-0d8a70923055?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Contoh gambar kopi
    video_url: "https://www.youtube.com/watch?v=your-video-id-1", // URL video dummy
    langkah_langkah: [
      "Panen buah kopi",
      "Fermentasi",
      "Pengeringan",
      "Grinding",
      "Roasting",
    ],
    category: "kopi",
    created_at: "2025-06-25T10:00:00Z",
    views_count: 1250, // Dummy views count
  },
  {
    id: "materi-2",
    judul: "Membuat Tepung Sagu Berkualitas dari Pohon Sagu Papua",
    description:
      "Panduan praktis cara mengekstrak sagu dari pohon dan mengolahnya menjadi tepung yang siap digunakan.",
    image_url:
      "https://images.unsplash.com/photo-1627581135249-14a0f4b3e8e2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Contoh gambar sagu
    video_url: "https://www.youtube.com/watch?v=your-video-id-2",
    langkah_langkah: [
      "Penebangan pohon",
      "Ekstraksi pati",
      "Pengendapan",
      "Pengeringan",
    ],
    category: "sagu",
    created_at: "2025-06-20T11:30:00Z",
    views_count: 980,
  },
  {
    id: "materi-3",
    judul: "Manfaat dan Pengolahan Minyak Buah Merah Asli Papua",
    description:
      "Kenali khasiat buah merah dan langkah-langkah pengolahannya menjadi minyak kesehatan yang kaya antioksidan.",
    image_url:
      "https://images.unsplash.com/photo-1627581135249-14a0f4b3e8e2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Ganti dengan gambar buah merah asli
    video_url: "https://www.youtube.com/watch?v=your-video-id-3",
    langkah_langkah: [
      "Panen buah",
      "Ekstraksi minyak",
      "Penyaringan",
      "Pengemasan",
    ],
    category: "buah_merah",
    created_at: "2025-06-15T09:15:00Z",
    views_count: 750,
  },
  {
    id: "materi-4",
    judul: "Budidaya Maggot BSF untuk Mengolah Limbah Organik Rumah Tangga",
    description:
      "Panduan mudah memulai budidaya maggot Black Soldier Fly untuk mengurangi sampah dan menghasilkan pakan alternatif.",
    image_url: "/PAMAN.png", // Contoh gambar maggot
    video_url: "https://www.youtube.com/watch?v=your-video-id-4",
    langkah_langkah: [
      "Siapkan media",
      "Pindahkan telur/larva",
      "Pemberian pakan",
      "Panen maggot",
    ],
    category: "limbah_organik",
    created_at: "2025-06-10T14:00:00Z",
    views_count: 1500, // Paling populer dummy
  },
];

const MateriPopulerSection: React.FC = () => {
  // Urutkan dummy data berdasarkan views_count untuk simulasi "populer"
  const sortedMateri = [...dummyMateriPopuler].sort(
    (a, b) => (b.views_count || 0) - (a.views_count || 0)
  );

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <Link href="/materi" passHref>
            <Button
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Lihat Semua Materi
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedMateri.slice(0, 4).map(
            (
              materi // Tampilkan 4 materi teratas
            ) => (
              <MateriCard key={materi.id} materi={materi} />
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default MateriPopulerSection;
