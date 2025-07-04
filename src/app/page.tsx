// app/page.tsx
import MateriPopulerSection from "@/components/MateriPopulerSection"; // Sesuaikan path jika berbeda
import WelcomeCard from "@/components/WelcomeCard";
import React from "react";
// --- PERBAIKAN DI SINI ---
// Import KategoriSection, BUKAN KategoriSdaCard secara langsung
import KategoriSdaSection from "@/components/KategoriSdaSection"; // Sesuaikan path jika berbeda
// --- AKHIR PERBAIKAN ---

const Home = () => {
  return (
    <div className="flex flex-col gap-10 px-6 py-8">
      <header></header>
      <WelcomeCard />
      <h2
        style={{ color: "#4C7A4F" }}
        className="text-2xl font-bold text-center"
      >
        Materi Populer
      </h2>
      <MateriPopulerSection />
      <h3
        style={{ color: "#4C7A4F" }}
        className="text-2xl font-bold text-center"
      >
        Kategori Pengolahan SDA
      </h3>
      {/* --- PERBAIKAN DI SINI --- */}
      {/* Render KategoriSdaSection, yang akan mengambil dan menampilkan KategoriSdaCard secara benar */}
      <KategoriSdaSection />
      {/* --- AKHIR PERBAIKAN --- */}
      <h4
        style={{ color: "#4C7A4F" }}
        className="text-2xl font-bold text-center"
      >
        FAQ
      </h4>
      <footer className="text-sm text-gray-500"></footer>
    </div>
  );
};

export default Home;