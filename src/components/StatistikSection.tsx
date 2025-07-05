import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { getStatistikSuperAdminAction } from "@/action/statistikAction";

// Ini adalah Server Component, jadi bisa async
const StatistikSection = async () => {
  // Panggil server action untuk mendapatkan data statistik
  const result = await getStatistikSuperAdminAction();

  // Siapkan data, gunakan 0 jika gagal mengambil
  const totalUsers = result.success ? result.data.totalUsers : 0;
  const totalMateri = result.success ? result.data.totalMateri : 0;

  // Data lain untuk saat ini bisa di-hardcode sesuai desain
  const completionRate = "+0.8%";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Kartu Total Pengguna (Besar) */}
      <Card className="bg-green-100/50 border-green-200 shadow-sm">
        <CardContent className="p-6 flex flex-col justify-center items-center text-center h-full">
          <p className="text-lg font-semibold text-green-800">Total Pengguna</p>
          <p className="text-6xl font-bold text-green-900 my-2">
            {totalUsers.toLocaleString("id-ID")}
          </p>
          <p className="text-md text-green-700">
            Pengguna yang Terdaftar Aktif
          </p>
        </CardContent>
      </Card>

      {/* Kontainer untuk dua kartu kecil */}


        {/* Kartu Total Materi */}
        <Card className="bg-green-100/50 border-green-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-md font-semibold text-green-800">
                  Total Materi
                </p>
                <p className="text-4xl font-bold text-green-900 mt-1">
                  {totalMateri}
                </p>
                <p className="text-sm text-green-700">
                  Konten Pembelajaran Tersedia
                </p>
              </div>
              <ArrowUpRight className="text-green-600" />
            </div>
            <div className="flex items-center text-xs text-green-900 mt-4">
              <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
              <span className="font-semibold">Completion Rate</span>
              <span className="ml-2">{completionRate}</span>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default StatistikSection;
