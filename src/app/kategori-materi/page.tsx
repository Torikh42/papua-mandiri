import React from "react";
import { getAllCategoriesAction } from "@/action/kategoriAction";
import KategoriSdaCard from "@/components/KategoriSdaCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUser } from "@/auth/server";

// Define types for the category data
type Category = {
  id: string;
  judul: string;
  description: string;
};

type CategoriesResponse =
  | {
      success: true;
      categories: Category[];
      errorMessage: null;
    }
  | {
      success: false;
      errorMessage: string;
    };

export default async function KategoriListPage() {
  const result = (await getAllCategoriesAction()) as CategoriesResponse;
  const currentUser = await getUser();
  const isSuperAdmin = currentUser?.role === "super_admin";

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#4c7a6b" }}>
          Semua Kategori SDA
        </h1>
        {isSuperAdmin && (
          <Link href="/dashboard-superadmin?tab=add-kategori" passHref>
            <Button style={{ backgroundColor: "#4c7a6b", color: "#fff" }}>
              + Tambah Kategori
            </Button>
          </Link>
        )}
      </div>

      {!result.success ? (
        <div className="text-center text-red-500 py-10">
          <p className="text-xl">Terjadi kesalahan saat memuat kategori:</p>
          <p>{result.errorMessage}</p>
        </div>
      ) : result.categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {result.categories.map((kategori: Category) => (
            <KategoriSdaCard key={kategori.id} kategori={kategori} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p className="text-xl">Belum ada kategori tersedia.</p>
          {isSuperAdmin && (
            <p className="mt-2">
              Silakan{" "}
              <Link
                href="/dashboard-superadmin?tab=add-category"
                className="hover:underline"
                style={{ color: "#4C7A6b" }}
              >
                tambah kategori baru
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
