import React from "react";
import { getPopularMateriAction } from "@/action/materiDetails";
import MateriCard from "./MateriCard";
import { PopularMateriResult } from "@/types";

const MateriCarouselSection = async () => {
  const result = await getPopularMateriAction(8) as PopularMateriResult;

  if (!result.success || !result.popularMateriList || result.popularMateriList.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#4c7a6b" }}>
          Rekomendasi
        </h2>
        <p className="text-gray-500 text-center py-8">
          Belum ada materi populer yang tersedia
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: "#4c7a6b" }}>
          Rekomendasi
        </h2>
        <p className="text-sm text-gray-500">
          {result.popularMateriList.length} materi populer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {result.popularMateriList.map((materi) => (
          <div
            key={materi.id}
            className="transform hover:scale-100 transition-transform duration-200"
          >
            <MateriCard materi={{
              ...materi,
              description: materi.description || "",
              // Add missing required properties with default values
              video_url: null,
              langkah_langkah: [],
              uploader_id: "",
              Kategori: materi.Kategori ? {
                id: materi.Kategori.id,
                judul: materi.Kategori.judul
              } : undefined
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MateriCarouselSection;