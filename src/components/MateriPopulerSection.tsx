"use client";
import React, { useEffect, useState } from "react";
import MateriCard from "./MateriPopulerCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getPopularMateriAction } from "@/action/materiDetails";
import { getAllCategoriesAction } from "@/action/kategoriAction";

export interface Materi {
  id: string;
  judul: string;
  description: string;
  image_url?: string;
  video_url?: string;
  langkah_langkah: string[];
  uploader_id?: string;
  category: string; // id kategori
  created_at: string;
  views_count?: number;
}

interface Category {
  id: string;
  judul: string;
}

const MateriPopulerSection: React.FC = () => {
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [materiResult, kategoriResult] = await Promise.all([
        getPopularMateriAction(4),
        getAllCategoriesAction(),
      ]);
      if (
        "popularMateriList" in materiResult &&
        Array.isArray(materiResult.popularMateriList)
      ) {
        setMateriList(materiResult.popularMateriList);
      } else {
        setMateriList([]);
      }
      if (
        "categories" in kategoriResult &&
        Array.isArray(kategoriResult.categories)
      ) {
        setCategories(kategoriResult.categories);
      } else {
        setCategories([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Helper untuk dapatkan nama kategori dari id
  const getCategoryName = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.judul : id;
  };

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
          {loading ? (
            <div className="col-span-4 text-center text-gray-500">
              Memuat materi populer...
            </div>
          ) : materiList.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500">
              Belum ada materi populer.
            </div>
          ) : (
            materiList.map((materi) => (
              <Link key={materi.id} href={`/materi-details/${materi.id}`}>
                <MateriCard
                  materi={{
                    ...materi,
                    category: getCategoryName(materi.category), // Kirim nama kategori
                  }}
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default MateriPopulerSection;
