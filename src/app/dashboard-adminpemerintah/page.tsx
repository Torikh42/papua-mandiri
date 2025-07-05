"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getProdukUntukPemerintahAction,
  getProdukDisetujuiAction,
  getRiwayatPesananAction,
} from "@/action/productAction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, ShoppingCart } from "lucide-react";
import ReviewProdukDialog from "@/components/ReviewProdukDialog";
import FormBuatPesanan from "@/components/FormBuatPesanan";
import Image from "next/image";

// Define proper types for all data structures
interface User {
  user_name: string;
  [key: string]: unknown; // For any additional properties that might exist
}

interface ProdukUntukTinjau {
  id: string;
  judul: string;
  created_at: string;
  pembuat: User | null;
  [key: string]: unknown; // For any additional properties that might exist
}

interface ProdukUntukPesan {
  id: string;
  judul: string;
  imageUrl: string | null;
  stok: number;
  [key: string]: unknown; // For any additional properties that might exist
}

interface ProdukDalamPesanan {
  judul: string;
  imageUrl: string | null;
}

interface RiwayatPesanan {
  id: string;
  jumlah_dipesan: number;
  created_at: string;
  status_pesanan: string;
  produk: ProdukDalamPesanan;
}

// Define response types for the actions
interface ProdukResponse<T> {
  success: boolean;
  data?: T[];
  errorMessage?: string;
}

interface RiwayatResponse {
  success: boolean;
  data?: RiwayatPesanan[];
  errorMessage?: string;
}

const DashboardAdminPemerintahPage = () => {
  const [produkDiajukan, setProdukDiajukan] = useState<ProdukUntukTinjau[]>([]);
  const [produkDisetujui, setProdukDisetujui] = useState<ProdukUntukPesan[]>([]);
  const [riwayatPesanan, setRiwayatPesanan] = useState<RiwayatPesanan[]>([]);
  const [loading, setLoading] = useState({
    tinjauan: true,
    pesanan: true,
    riwayat: true,
  });
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const fetchDataTinjauan = useCallback(async () => {
    setLoading((prev) => ({ ...prev, tinjauan: true }));
    const result = await getProdukUntukPemerintahAction() as ProdukResponse<ProdukUntukTinjau>;
    if (result.success && result.data) {
      setProdukDiajukan(result.data);
    }
    setLoading((prev) => ({ ...prev, tinjauan: false }));
  }, []);

  const fetchDataPesanan = useCallback(async () => {
    setLoading((prev) => ({ ...prev, pesanan: true }));
    const result = await getProdukDisetujuiAction() as ProdukResponse<ProdukUntukPesan>;
    if (result.success && result.data) {
      setProdukDisetujui(result.data);
    }
    setLoading((prev) => ({ ...prev, pesanan: false }));
  }, []);

  const fetchDataRiwayat = useCallback(async () => {
    setLoading((prev) => ({ ...prev, riwayat: true }));
    const result = await getRiwayatPesananAction() as RiwayatResponse;
    if (result.success && result.data) {
      setRiwayatPesanan(result.data);
    }
    setLoading((prev) => ({ ...prev, riwayat: false }));
  }, []);

  useEffect(() => {
    fetchDataTinjauan();
    fetchDataPesanan();
    fetchDataRiwayat();
  }, [fetchDataTinjauan, fetchDataPesanan, fetchDataRiwayat]);

  const handleActionComplete = () => {
    setActiveDialog(null);
    fetchDataTinjauan();
    fetchDataPesanan();
    fetchDataRiwayat();
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Dasbor Admin Pemerintah</h1>

      <Tabs defaultValue="tinjauan-produk" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tinjauan-produk">Tinjauan Produk</TabsTrigger>
          <TabsTrigger value="buat-pesanan">Buat Pesanan Baru</TabsTrigger>
          <TabsTrigger value="riwayat-pesanan">Riwayat Pesanan</TabsTrigger>
        </TabsList>

        <TabsContent value="tinjauan-produk">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Produk untuk Ditinjau</CardTitle>
            </CardHeader>
            <CardContent>
              {loading.tinjauan ? (
                <p className="text-center py-4">Memuat...</p>
              ) : produkDiajukan.length === 0 ? (
                <p className="text-center py-4">
                  Tidak ada produk untuk ditinjau.
                </p>
              ) : (
                produkDiajukan.map((produk) => (
                  <div
                    key={produk.id}
                    className="flex justify-between items-center p-4 border-b"
                  >
                    <p>
                      {produk.judul} - oleh {produk.pembuat?.user_name || "N/A"}
                    </p>
                    <Dialog
                      open={activeDialog === `review-${produk.id}`}
                      onOpenChange={(isOpen) =>
                        !isOpen && setActiveDialog(null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setActiveDialog(`review-${produk.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Tinjau
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tinjau Produk</DialogTitle>
                        </DialogHeader>
                        <ReviewProdukDialog
                          produk={produk}
                          onActionComplete={handleActionComplete}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buat-pesanan">
          <Card>
            <CardHeader>
              <CardTitle>Produk Tersedia untuk Dipesan</CardTitle>
            </CardHeader>
            <CardContent>
              {loading.pesanan ? (
                <p className="text-center py-4">Memuat...</p>
              ) : produkDisetujui.length === 0 ? (
                <p className="text-center py-4">
                  Tidak ada produk yang bisa dipesan.
                </p>
              ) : (
                produkDisetujui.map((produk) => (
                  <div
                    key={produk.id}
                    className="flex justify-between items-center p-4 border-b"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={produk.imageUrl || "/placeholder.png"}
                        alt={produk.judul}
                        width={60}
                        height={60}
                        className="rounded-md object-cover"
                      />
                      <div>
                        <p className="font-semibold">{produk.judul}</p>
                        <p className="text-sm">Stok: {produk.stok}</p>
                      </div>
                    </div>
                    <Dialog
                      open={activeDialog === `order-${produk.id}`}
                      onOpenChange={(isOpen) =>
                        !isOpen && setActiveDialog(null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setActiveDialog(`order-${produk.id}`)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" /> Buat Pesanan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Buat Pesanan</DialogTitle>
                        </DialogHeader>
                        <FormBuatPesanan
                          produk={produk}
                          onActionComplete={handleActionComplete}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="riwayat-pesanan">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pesanan Anda</CardTitle>
            </CardHeader>
            <CardContent>
              {loading.riwayat ? (
                <p className="text-center py-4">Memuat...</p>
              ) : riwayatPesanan.length === 0 ? (
                <p className="text-center py-4">Belum ada riwayat pesanan.</p>
              ) : (
                riwayatPesanan.map((pesanan) => (
                  <div
                    key={pesanan.id}
                    className="flex justify-between items-center p-4 border-b"
                  >
                    <div>
                      <p className="font-semibold">{pesanan.produk.judul}</p>
                      <p className="text-sm">
                        Jumlah: {pesanan.jumlah_dipesan} unit
                      </p>
                      <p className="text-xs text-gray-500">
                        Tgl:{" "}
                        {new Date(pesanan.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {pesanan.status_pesanan}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardAdminPemerintahPage;