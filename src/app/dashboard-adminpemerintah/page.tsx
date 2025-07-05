"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getProdukUntukPemerintahAction,
  getProdukDisetujuiAction,
  getRiwayatPesananAction,
} from "@/action/productAction"; // Saya asumsikan nama filenya produkAction.ts
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog,  DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye } from "lucide-react";
import ReviewProdukDialog from "@/components/ReviewProdukDialog";


// --- PERBAIKAN TIPE DATA DI SINI ---

// Tipe untuk produk yang akan ditinjau. Harus lengkap sesuai kebutuhan ReviewProdukDialog.
type ProdukUntukTinjau = {
  id: string;
  judul: string;
  deskripsi: string;
  harga: number;
  stok: number;
  alamat: string;
  imageUrl: string | null;
  video_url: string | null; // Tambahkan jika dialog membutuhkannya
  created_at: string;
  pembuat: { user_name: string } | null;
};

// Tipe untuk produk yang akan dipesan. Harus lengkap sesuai kebutuhan FormBuatPesanan.
type ProdukUntukPesan = {
  id: string;
  judul: string;
  stok: number;
  // Tambahkan properti lain jika dibutuhkan oleh form pesanan
};

// Tipe untuk riwayat pesanan dengan status yang spesifik.
type RiwayatPesanan = {
  id: string;
  jumlah_dipesan: number;
  created_at: string;
  status_pesanan: 'diproses' | 'selesai' | 'dibatalkan';
  produk: { 
    judul: string; 
    imageUrl: string | null 
  };
};

const DashboardAdminPemerintahPage = () => {
  // State sekarang menggunakan tipe yang sudah spesifik
  const [produkDiajukan, setProdukDiajukan] = useState<ProdukUntukTinjau[]>([]);
  const [produkDisetujui, setProdukDisetujui] = useState<ProdukUntukPesan[]>([]);
  const [riwayatPesanan, setRiwayatPesanan] = useState<RiwayatPesanan[]>([]);
  const [loading, setLoading] = useState({ tinjauan: true, pesanan: true, riwayat: true, });
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const fetchDataTinjauan = useCallback(async () => {
    setLoading((prev) => ({ ...prev, tinjauan: true }));
    const result = await getProdukUntukPemerintahAction();
    if ("success" in result && result.success && result.data)
      setProdukDiajukan(result.data); // Data dari server action sudah lengkap
    setLoading((prev) => ({ ...prev, tinjauan: false }));
  }, []);

  const fetchDataPesanan = useCallback(async () => {
    setLoading((prev) => ({ ...prev, pesanan: true }));
    const result = await getProdukDisetujuiAction();
    if ("success" in result && result.success && result.data)
      setProdukDisetujui(result.data);
    setLoading((prev) => ({ ...prev, pesanan: false }));
  }, []);

  const fetchDataRiwayat = useCallback(async () => {
    setLoading((prev) => ({ ...prev, riwayat: true }));
    const result = await getRiwayatPesananAction();
    if ("success" in result && result.success && result.data)
      setRiwayatPesanan(result.data as RiwayatPesanan[]); // Type assertion untuk keamanan
    setLoading((prev) => ({ ...prev, riwayat: false }));
  }, []);

  useEffect(() => {
    fetchDataTinjauan();
    fetchDataPesanan();
    fetchDataRiwayat();
  }, [fetchDataTinjauan, fetchDataPesanan, fetchDataRiwayat]);

  const handleActionComplete = () => {
    setActiveDialog(null);
    // Refresh semua data setelah ada aksi
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
              <CardDescription>Produk yang diajukan oleh komunitas dan menunggu persetujuan Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.tinjauan ? ( <p className="text-center py-4">Memuat...</p> ) : 
              produkDiajukan.length === 0 ? ( <p className="text-center py-4">Tidak ada produk untuk ditinjau.</p> ) : (
                produkDiajukan.map((produk) => (
                  <div key={produk.id} className="flex justify-between items-center p-4 border-b last:border-b-0">
                    <p>{produk.judul} - oleh <strong>{produk.pembuat?.user_name || "N/A"}</strong></p>
                    <Dialog open={activeDialog === `review-${produk.id}`} onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setActiveDialog(`review-${produk.id}`)}>
                          <Eye className="mr-2 h-4 w-4" /> Tinjau
                        </Button>
                      </DialogTrigger>
                      {/* Sekarang 'produk' memiliki semua properti yang dibutuhkan oleh ReviewProdukDialog */}
                      <ReviewProdukDialog produk={produk} onActionComplete={handleActionComplete} />
                    </Dialog>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... (Konten untuk tab lain tetap sama, tidak perlu diubah) ... */}
      </Tabs>
    </div>
  );
};

export default DashboardAdminPemerintahPage;