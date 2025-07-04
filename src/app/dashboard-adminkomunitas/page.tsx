"use client";

import React from "react";
import SearchProduk from "@/components/SearchProduk";
import FormAddProduct from "@/components/FormAddProduct"; // pastikan path ini benar
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"; // pastikan ini diimpor dengan benar

const Page = () => {
  return (
    <div className="max-w-xl mx-auto py-10 flex flex-col space-y-12">
      <SearchProduk />

      <h2 className="text-2xl font-bold text-center" style={{ color: "#4C7A6b" }}>
        Menu Utama
      </h2>

      <h3 className="text-2xl font-bold" style={{ color: "#4C7A6b" }}>
        Barang yang Diajukan
      </h3>

      <Tabs defaultValue="add-product" className="w-full">

        <TabsContent value="add-product" className="mt-6">
          <FormAddProduct />
        </TabsContent>
      </Tabs>

      <h4 className="text-2xl font-bold" style={{ color: "#4C7A6b" }}>
        Rekomendasi
      </h4>

      <footer className="text-center text-gray-500 text-sm pt-10">
        &copy; 2025 My Search App
      </footer>
    </div>
  );
};

export default Page;
