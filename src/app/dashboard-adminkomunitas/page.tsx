"use client";
import React from "react";
import SearchProduk from "@/components/SearchProduk"; // pastikan path ini sesuai

const page = () => {
  return (
    <div className="max-w-xl mx-auto py-10 flex flex-col space-y-12">
      <SearchProduk />

      <h2 className="text-2xl font-bold text-center" style={{ color: "#4C7A4F" }}>
        Menu Utama
      </h2>

      <h3 className="text-2xl font-bold" style={{ color: "#4C7A4F" }}>
        Barang yang Diajukan
      </h3>

      <h4 className="text-2xl font-bold" style={{ color: "#4C7A4F" }}>
        Rekomendasi
      </h4>

      <footer className="text-center text-gray-500 text-sm pt-10">
        &copy; 2025 My Search App
      </footer>
    </div>
  );
};

export default page;
