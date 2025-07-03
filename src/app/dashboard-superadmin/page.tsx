// app/dashboard-superadmin/page.tsx
"use client"; // Menggunakan client component karena ada interaksi UI (Tabs)

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Impor Tabs Shadcn
import FormAddKategori from '@/components/FormAddKategori';
import FormAddMateri from '@/components/FormAddMateri';

const DashboardSuperAdmin = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Super Admin</h1>
      
      <Tabs defaultValue="add-category" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add-category">Tambah Kategori</TabsTrigger>
          <TabsTrigger value="add-materi">Tambah Materi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="add-category" className="mt-6">
          <FormAddKategori />
        </TabsContent>
        
        <TabsContent value="add-materi" className="mt-6">
          <FormAddMateri />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardSuperAdmin;