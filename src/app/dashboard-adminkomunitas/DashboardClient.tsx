"use client";

import React, { useState, useEffect, useCallback } from "react";
// Nama import dipertahankan sesuai permintaan Anda
import FormAjukanProduk from "@/components/FormAddProduct";
import {
  getProdukKomunitasAction,
  // getPesananUntukKomunitasAction, // Dinonaktifkan sementara karena tidak dipakai
  // updateStatusPesananKomunitasAction,
} from "@/action/productAction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Package, Plus, Edit } from "lucide-react"; // Ikon yang tidak dipakai dihapus
import { Button } from "@/components/ui/button";
import FormEditProduk from "@/components/FormEditProduct";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

// 1. Tipe data diganti dari 'any' menjadi lebih spesifik
// API Response type (what we get from the server)
type ProdukApiResponse = {
  id: string;
  judul: string;
  deskripsi: string; // API returns 'deskripsi'
  harga: number;
  stok: number;
  alamat: string;
  imageUrl: string | null;
  status: "diajukan" | "ditinjau" | "disetujui" | "ditolak";
  catatan_pemerintah: string | null;
  created_at: string;
};

// Component type (what we use in the component)
type Produk = {
  id: string;
  judul: string;
  description: string; // Component uses 'description'
  harga: number;
  stok: number;
  alamat: string;
  imageUrl: string | null;
  status: "diajukan" | "ditinjau" | "disetujui" | "ditolak";
  catatan_pemerintah: string | null;
  created_at: string;
};

// Tipe Pesanan disimpan untuk referensi nanti
/*
type Pesanan = {
  id: string;
  jumlah_dipesan: number;
  status_pesanan: "diproses" | "selesai" | "dibatalkan";
  catatan_pesanan: string | null;
  created_at: string;
  produk: {
    judul: string;
  };
};
*/

const DashboardAdminKomunitasClient = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  // const [pesananList, setPesananList] = useState<Pesanan[]>([]); // Dinonaktifkan sementara
  const [loading, setLoading] = useState({ produk: true, pesanan: true });
  // const [isPending, startTransition] = useTransition(); // Dinonaktifkan karena handleUpdatePesanan tidak dipakai
  const [editingProduk, setEditingProduk] = useState<Produk | null>(null);

  const fetchProduk = useCallback(async () => {
    setLoading((prev) => ({ ...prev, produk: true }));
    const result = await getProdukKomunitasAction();
    if ("success" in result && result.success && result.data) {
      // Transform the data to match our Produk type if needed
      const transformedData = result.data.map(
        (item: ProdukApiResponse): Produk => ({
          ...item,
          description: item.deskripsi, // Transform 'deskripsi' to 'description'
        })
      );
      setProdukList(transformedData);
    }
    setLoading((prev) => ({ ...prev, produk: false }));
  }, []);

  // Logika untuk pesanan dinonaktifkan sementara
  /*
  const fetchPesanan = useCallback(async () => {
    setLoading((prev) => ({ ...prev, pesanan: true }));
    const result = await getPesananUntukKomunitasAction();
    if ("success" in result && result.success && result.data) setPesananList(result.data);
    setLoading((prev) => ({ ...prev, pesanan: false }));
  }, []);
  */

  useEffect(() => {
    fetchProduk();
    // fetchPesanan();
  }, [fetchProduk]);

  // Handler untuk pesanan dinonaktifkan sementara
  /*
  const handleUpdatePesanan = (pesananId: string, status: "selesai" | "dibatalkan") => {
    startTransition(async () => {
      const result = await updateStatusPesananKomunitasAction(pesananId, status);
      if ("success" in result && result.success) {
        toast.success(`Status pesanan berhasil diubah menjadi ${status}.`);
        fetchPesanan();
      } else {
        toast.error(result.errorMessage || "Gagal mengubah status pesanan.");
      }
    });
  };
  */

  const handleActionComplete = () => {
    setEditingProduk(null);
    fetchProduk();
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:py-10">
      <div className="text-center mb-8">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: "#4c7a6b" }}
        >
          Dashboard Admin Komunitas
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Kelola produk dan pesanan dengan mudah
        </p>
      </div>

      {/* 2. Default tab diubah dan jumlah kolom disesuaikan menjadi 2 */}
      <Tabs defaultValue="status-produk" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-0 h-auto sm:h-10 bg-gray-50 p-2 rounded-lg">
          {/* Tab Pesanan Masuk disembunyikan untuk sementara */}
          {/* <TabsTrigger value="pesanan-masuk" ... /> */}
          <TabsTrigger
            value="status-produk"
            className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-1 px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 rounded-md"
            style={{ color: "#4c7a6b" }}
          >
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Status Produk</span>
            <span className="sm:hidden">Status</span>
          </TabsTrigger>
          <TabsTrigger
            value="tambah-produk"
            className="flex items-center gap-2 text-xs sm:text-sm py-2 sm:py-1 px-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 rounded-md"
            style={{ color: "#4c7a6b" }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajukan Produk</span>
            <span className="sm:hidden">Ajukan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status-produk" className="mt-6">
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle
                className="text-lg sm:text-xl font-semibold flex items-center gap-2"
                style={{ color: "#4c7a6b" }}
              >
                <Package className="h-5 w-5" />
                Daftar Produk Diajukan
              </CardTitle>
              <CardDescription>
                Berikut adalah status dari semua produk yang telah Anda ajukan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-gray-200">
              {loading.produk ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2
                    className="animate-spin mr-2"
                    style={{ color: "#4c7a6b" }}
                  />
                  <span style={{ color: "#4c7a6b" }}>Memuat produk...</span>
                </div>
              ) : produkList.length > 0 ? (
                produkList.map((produk) => (
                  <div
                    key={produk.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 gap-3"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        {produk.judul}
                      </p>
                      {produk.catatan_pemerintah && (
                        <div className="bg-amber-50 p-3 rounded-md border-l-4 border-amber-200 mt-2">
                          <p className="text-sm text-amber-800">
                            <strong>Catatan:</strong>{" "}
                            {produk.catatan_pemerintah}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Badge
                        variant={
                          produk.status === "disetujui"
                            ? "default"
                            : produk.status === "ditolak"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {produk.status}
                      </Badge>
                      {(produk.status === "diajukan" ||
                        produk.status === "ditolak") && (
                        <Dialog
                          open={editingProduk?.id === produk.id}
                          onOpenChange={(isOpen) =>
                            !isOpen && setEditingProduk(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingProduk(produk)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {editingProduk && (
                            <FormEditProduk
                              produk={editingProduk}
                              onActionComplete={handleActionComplete}
                            />
                          )}
                        </Dialog>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    Anda belum mengajukan produk apa pun.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Konten untuk "Pesanan Masuk" disembunyikan */}
        {/* <TabsContent value="pesanan-masuk" ... /> */}

        <TabsContent value="tambah-produk" className="mt-6">
          <div className="flex justify-center">
            <FormAjukanProduk onProductSubmitted={fetchProduk} />
          </div>
        </TabsContent>
      </Tabs>
      <div className="mt-8 sm:mt-12 border-t pt-6 sm:pt-8">{children}</div>
    </div>
  );
};

export default DashboardAdminKomunitasClient;
