"use client";
import React, { useEffect, useState } from "react";
import MateriCard, { Materi } from "@/components/MateriCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getPopularMateriAction } from "@/action/materiDetails";

const MateriPopulerSection: React.FC = () => {
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const materiResult = await getPopularMateriAction(4);

      if (
        "popularMateriList" in materiResult &&
        Array.isArray(materiResult.popularMateriList)
      ) {
        setMateriList(materiResult.popularMateriList);
      } else {
        setMateriList([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <Button asChild variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
            <Link href="/materi">Lihat Semua Materi</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 h-96 rounded-lg animate-pulse"
              ></div>
            ))
          ) : materiList.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500">
              Belum ada materi populer.
            </div>
          ) : (
            materiList.map((materi) => (
              // Cukup panggil MateriCard seperti ini. Key ada di komponen teratas.
              <MateriCard key={materi.id} materi={materi} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default MateriPopulerSection;
