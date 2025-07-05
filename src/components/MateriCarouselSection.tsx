// components/MateriCarouselSection.tsx
import React from "react";
import { getPopularMateriAction } from "@/action/materiDetails";
import MateriCard from "./MateriCard";
import { Materi, PopularMateriResult } from "@/types";

const MateriCarouselSection = async () => {
  const result: PopularMateriResult = await getPopularMateriAction(8);

  if (
    !result.success ||
    !result.popularMateriList ||
    result.popularMateriList.length === 0
  ) {
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

  const materiList: Materi[] = result.popularMateriList;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: "#4c7a6b" }}>
          Rekomendasi
        </h2>
        <p className="text-sm text-gray-500">
          {materiList.length} materi populer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {materiList.map((materi: Materi) => (
          <div
            key={materi.id}
            className="transform hover:scale-105 transition-transform duration-200"
          >
            <MateriCard materi={materi} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MateriCarouselSection;
