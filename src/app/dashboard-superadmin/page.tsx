// components/DashboardSuperAdmin.tsx
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormAddKategori from "@/components/FormAddKategori";
import FormAddMateri from "@/components/FormAddMateri";
import StatistikSection from "@/components/StatistikSection";
import MateriCarouselSection from "@/components/MateriCarouselSection";
import MateriList from "@/components/MateriList";

const DashboardSuperAdmin = async () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "#4c7a6b" }}>
            Dashboard Super Admin
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola semua materi dan kategori dalam sistem
          </p>
        </div>

        <StatistikSection />
        <div className="mt-8">
          <Tabs defaultValue="kelola-materi" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                value="kelola-materi"
                className="data-[state=active]:bg-[#4c7a6b] data-[state=active]:text-white"
              >
                Kelola Materi
              </TabsTrigger>
              <TabsTrigger
                value="tambah-materi"
                className="data-[state=active]:bg-[#4c7a6b] data-[state=active]:text-white"
              >
                Tambah Materi
              </TabsTrigger>
              <TabsTrigger
                value="tambah-kategori"
                className="data-[state=active]:bg-[#4c7a6b] data-[state=active]:text-white"
              >
                Tambah Kategori
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kelola-materi" className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: "#4c7a6b" }}
                >
                  Daftar Materi
                </h2>
                <MateriList />
              </div>
            </TabsContent>

            <TabsContent value="tambah-materi" className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: "#4c7a6b" }}
                >
                  Tambah Materi Baru
                </h2>
                <FormAddMateri />
              </div>
            </TabsContent>

            <TabsContent value="tambah-kategori" className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: "#4c7a6b" }}
                >
                  Tambah Kategori Baru
                </h2>
                <FormAddKategori />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <MateriCarouselSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSuperAdmin;
