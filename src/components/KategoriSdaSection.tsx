// components/Kategori/KategoriSection.tsx
import React from "react";
import KategoriSdaCard from "./KategoriSdaCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllCategoriesAction } from "@/action/kategoriAction"; // Import Server Action

const KategoriSection: React.FC = async () => {
  // Jadikan async component
  const result = await getAllCategoriesAction(); // Ambil semua kategori

  if ("errorMessage" in result && result.errorMessage) {
    return (
      <div className="text-center text-red-500">
        Gagal memuat kategori: {result.errorMessage}
      </div>
    );
  }

  if (
    !("categories" in result) ||
    !result.categories ||
    result.categories.length === 0
  ) {
    return (
      <div className="text-center text-gray-500">
        Belum ada kategori tersedia.
      </div>
    );
  }

  // Tampilkan hingga 4 kategori (bisa disesuaikan)
  const categoriesToShow = result.categories.slice(0, 4);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <Button
            asChild
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <Link href="/kategori-materi">Lihat Semua Kategori</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesToShow
            .filter(
              (kategori) =>
                kategori &&
                typeof kategori.judul === "string" &&
                kategori.judul.trim() !== ""
            )
            .map((kategori) => (
              <KategoriSdaCard key={kategori.id} kategori={kategori} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default KategoriSection;
