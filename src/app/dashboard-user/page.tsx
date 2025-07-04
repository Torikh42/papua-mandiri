// app/dashboard-user/page.tsx
import React from "react";
import { getSavedMaterialsAction } from "@/action/savedMateriAction";
import UserDashboardClient from "./UserDashboardClient"; // Import komponen client baru

// Halaman ini tetap menjadi Server Component, bagus untuk SEO dan load awal
export default async function UserDashboardPage() {
  // Ambil data di server
  const { savedMateriList, errorMessage } = await getSavedMaterialsAction();

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-[#4c7a6b] mb-8">
        Dashboard Pengguna
      </h1>
      <h2 className="text-2xl font-semibold text-[#4c7a6b] mb-6">
        Materi Tersimpan Anda
      </h2>

      {errorMessage ? (
        <div className="text-center text-red-500 py-10">
          <p className="text-xl">
            Terjadi kesalahan saat memuat materi tersimpan:
          </p>
          <p>{errorMessage}</p>
        </div>
      ) : (
        // Render komponen client dan kirim data sebagai prop
        <UserDashboardClient initialMaterials={savedMateriList || []} />
      )}
    </div>
  );
}
