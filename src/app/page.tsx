import MateriPopulerSection from "@/components/MateriPopulerSection";
import WelcomeCard from "@/components/WelcomeCard";
import React from "react";
import KategoriSdaSection from "@/components/KategoriSdaSection";

const Home = () => {
  return (
    <div className="flex flex-col gap-10 px-6 py-8">
      {" "}
      {/* spacing antar elemen */}
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
      <KategoriSdaSection />
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
