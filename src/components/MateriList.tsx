// components/MateriList.tsx
"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import {
  getAllMateriWithCategory,
  deleteMateriAction,
} from "@/action/materiDetails";
import { getAllCategoriesAction } from "@/action/kategoriAction";
import { Button } from "./ui/button";
import { Edit, Trash2, Loader2, Search, Filter } from "lucide-react";
import { Dialog, DialogTrigger } from "./ui/dialog";
import FormEditMateri from "./FormEditMateri";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Materi, Kategori, MateriResult, KategoriResult } from "@/types";

const MateriList = () => {
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [filteredMateriList, setFilteredMateriList] = useState<Materi[]>([]);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMateri, setEditingMateri] = useState<Materi | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchMateriAndCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [materiResult, categoryResult] = await Promise.all([
        getAllMateriWithCategory(),
        getAllCategoriesAction(),
      ]);

      if ("success" in materiResult && materiResult.success) {
        const result = materiResult as MateriResult;
        setMateriList(result.materiList);
        setFilteredMateriList(result.materiList);
      }

      if (
        "success" in categoryResult &&
        categoryResult.success &&
        categoryResult.categories
      ) {
        const result = categoryResult as KategoriResult;
        setCategories(result.categories);
      }
    } catch (error) {
      toast.error("Gagal memuat data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMateriAndCategories();
  }, [fetchMateriAndCategories]);

  useEffect(() => {
    let filtered = materiList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((materi) =>
        materi.judul.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (materi) => materi.Kategori?.id === selectedCategory
      );
    }

    setFilteredMateriList(filtered);
  }, [materiList, searchTerm, selectedCategory]);

  const handleDelete = (materiId: string, judul: string) => {
    startTransition(async () => {
      try {
        const result = await deleteMateriAction(materiId);
        if (result) {
          toast.success(`Materi "${judul}" berhasil dihapus.`);
          fetchMateriAndCategories();
        } else {
          toast.error( "Gagal menghapus materi.");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan saat menghapus materi.");
        console.error("Error deleting materi:", error);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 h-8 w-8"
            style={{ color: "#4c7a6b" }}
          />
          <p className="text-gray-600">Memuat daftar materi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari materi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.judul}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Menampilkan {filteredMateriList.length} dari {materiList.length}{" "}
          materi
        </p>
        {(searchTerm || selectedCategory !== "all") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
            }}
          >
            Reset Filter
          </Button>
        )}
      </div>

      {/* Materi List */}
      <div className="grid gap-4">
        {filteredMateriList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Tidak ada materi yang ditemukan
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Coba ubah kata kunci pencarian atau filter kategori
            </p>
          </div>
        ) : (
          filteredMateriList.map((materi) => (
            <div
              key={materi.id}
              className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow duration-200 bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3
                    className="font-semibold text-lg mb-2"
                    style={{ color: "#4c7a6b" }}
                  >
                    {materi.judul}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="border-[#4c7a6b] text-[#4c7a6b]"
                    >
                      {materi.Kategori?.judul || "Tanpa Kategori"}
                    </Badge>
                  </div>
                  {materi.description && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {materi.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Dialog
                    open={editingMateri?.id === materi.id}
                    onOpenChange={(isOpen) => !isOpen && setEditingMateri(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMateri(materi)}
                        className="hover:bg-[#4c7a6b] hover:text-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    {editingMateri && (
                      <FormEditMateri
                        materi={editingMateri}
                        categories={categories}
                        onActionComplete={() => {
                          setEditingMateri(null);
                          fetchMateriAndCategories();
                        }}
                      />
                    )}
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle style={{ color: "#4c7a6b" }}>
                          Konfirmasi Penghapusan
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus materi 
                          {materi.judul}? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(materi.id, materi.judul)}
                          disabled={isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Menghapus...
                            </>
                          ) : (
                            "Ya, Hapus"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MateriList;
