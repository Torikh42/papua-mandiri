// app/materi/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { getAllMateriAction } from "@/action/materiDetails";
import MateriCard, { Materi } from "@/components/MateriCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUser } from "@/auth/server";
import SearchMateri from "@/components/SearchMateri";
import FilterMateriByCategory from "@/components/FilterMateriByCategory";

// Define the type for the API response
interface MateriApiResponse {
  success?: boolean;
  materiList?: Materi[];
  errorMessage: string | null;
}

// Define the type for search results
interface SearchResult {
  id: string;
  judul: string;
  description: string;
  category: string;
  image_url: string;
  video_url: string;
  langkah_langkah: string;
  uploader_id: string;
  created_at: string;
}

export default function MateriListPage() {
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [filteredMateri, setFilteredMateri] = useState<Materi[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch all materi with category info
        const result = await getAllMateriAction() as MateriApiResponse;
        if (result.errorMessage) {
          setErrorMessage(result.errorMessage);
        } else if (result.materiList) {
          setMateriList(result.materiList);
          setFilteredMateri(result.materiList);
        }

        // Check user role
        const currentUser = await getUser();
        setIsSuperAdmin(currentUser?.role === "super_admin");
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to apply both search and category filters
  const applyFilters = () => {
    let filtered = materiList;

    // Apply category filter first
    if (selectedCategory) {
      filtered = filtered.filter(
        (materi) => {
          // Type assertion or safe access for category property
          return (materi as Materi & { category?: string }).category === selectedCategory;
        }
      );
    }

    // If there's an active search, use search results instead
    if (isSearching && searchResults.length > 0) {
      const searchResultsConverted = searchResults.map((item): Materi => ({
        id: item.id,
        judul: item.judul,
        description: item.description,
        image_url: item.image_url,
        video_url: item.video_url,
        langkah_langkah: item.langkah_langkah,
        uploader_id: item.uploader_id,
        created_at: item.created_at,
        // Add category as an extended property
        ...(item.category && { category: item.category }),
      }));

      // Apply category filter to search results if category is selected
      if (selectedCategory) {
        filtered = searchResultsConverted.filter(
          (materi) => {
            return (materi as Materi & { category?: string }).category === selectedCategory;
          }
        );
      } else {
        filtered = searchResultsConverted;
      }
    }

    setFilteredMateri(filtered);
  };

  // Apply filters whenever materiList, selectedCategory, or searchResults change
  useEffect(() => {
    applyFilters();
  }, [materiList, selectedCategory, searchResults, isSearching]);

  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);
    if (results.length === 0) {
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center py-10">
          <p className="text-xl">Memuat materi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#4c7a6b" }}>
          Daftar Materi Edukasi
        </h1>
        {isSuperAdmin && (
          <Link href="/dashboard-superadmin?tab=add-materi" passHref>
            <Button style={{ backgroundColor: "#4c7a6b", color: "#fff" }}>
              + Tambah Materi
            </Button>
          </Link>
        )}
      </div>

      <SearchMateri
        onResults={handleSearchResults}
        selectedCategory={selectedCategory}
      />

      <FilterMateriByCategory
        onCategoryFilter={handleCategoryFilter}
        selectedCategory={selectedCategory}
      />
      {errorMessage ? (
        <div className="text-center text-red-500 py-10">
          <p className="text-xl">Terjadi kesalahan saat memuat materi:</p>
          <p>{errorMessage}</p>
        </div>
      ) : filteredMateri && filteredMateri.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMateri.map((materi: Materi) => (
            <MateriCard key={materi.id} materi={materi} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          {isSearching || selectedCategory ? (
            <div>
              <p className="text-xl">Tidak ada materi yang ditemukan.</p>
              <p className="text-sm mt-2">
                {isSearching && selectedCategory
                  ? "Coba ubah kata kunci pencarian atau pilih kategori yang berbeda."
                  : isSearching
                  ? "Coba ubah kata kunci pencarian."
                  : "Coba pilih kategori yang berbeda."}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xl">Belum ada materi tersedia.</p>
              {isSuperAdmin && (
                <p className="mt-2">
                  Silakan{" "}
                  <Link
                    href="/dashboard-superadmin?tab=add-materi"
                    className="text-blue-500 hover:underline"
                  >
                    tambah materi baru
                  </Link>
                  .
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}