// app/materi/page.tsx
import React from 'react';
import { getAllMateriAction } from '@/action/materiDetails'; // Import Server Action untuk mengambil semua materi
import MateriCard, { Materi } from '@/components/KategoriCard'; // Import komponen MateriCard dan interface Materi
import { Button } from '@/components/ui/button'; // Import Button dari Shadcn UI
import Link from 'next/link'; // Import Link dari Next.js
import { getUser } from '@/auth/server'; // Import getUser untuk cek role admin

// Ini adalah Server Component, sehingga data diambil di server
export default async function MateriListPage() {
  // Panggil Server Action untuk mengambil semua materi dari database
  // Materi akan otomatis di-join dengan nama kategori karena konfigurasi di materiAction.ts
  const result = await getAllMateriAction();
  const errorMessage = result.errorMessage;
  const materiList = 'materiList' in result ? result.materiList : undefined;

  // Dapatkan informasi user yang sedang login untuk mengecek role admin
  const currentUser = await getUser();
  const isSuperAdmin = currentUser?.role === "super_admin";

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Daftar Materi Edukasi</h1>
        {isSuperAdmin && ( // Tampilkan tombol "+ Tambah Materi" hanya jika user adalah super_admin
          <Link href="/dashboard-superadmin?tab=add-materi" passHref> {/* Arahkan ke tab add materi di dashboard admin */}
            <Button>+ Tambah Materi</Button>
          </Link>
        )}
      </div>

      {errorMessage ? ( // Tampilkan pesan error jika ada masalah saat memuat materi
        <div className="text-center text-red-500 py-10">
          <p className="text-xl">Terjadi kesalahan saat memuat materi:</p>
          <p>{errorMessage}</p>
        </div>
      ) : materiList && materiList.length > 0 ? ( // Jika materi ditemukan dan ada isinya
        // Tampilkan materi dalam grid responsif
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {materiList.map((materi: Materi) => ( // Mapping setiap objek materi ke komponen MateriCard
            <MateriCard key={materi.id} materi={materi} />
          ))}
        </div>
      ) : ( // Jika tidak ada materi yang tersedia
        <div className="text-center text-gray-500 py-10">
          <p className="text-xl">Belum ada materi tersedia.</p>
          {isSuperAdmin && ( // Berikan tautan untuk menambah materi jika user adalah super_admin
            <p className="mt-2">Silakan {" "}
              <Link href="/dashboard-superadmin?tab=add-materi" className="text-blue-500 hover:underline">
                tambah materi baru
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}