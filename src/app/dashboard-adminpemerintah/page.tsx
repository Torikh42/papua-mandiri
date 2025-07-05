"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getProdukUntukPemerintahAction,
  getProdukDisetujuiAction,
  getRiwayatPesananAction,
} from "@/action/productAction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, ShoppingCart} from "lucide-react";
import ReviewProdukDialog from "@/components/ReviewProdukDialog";
import FormBuatPesanan from "@/components/FormBuatPesanan";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

// --- TIPE DATA YANG LENGKAP DAN SPESIFIK ---

// Tipe data utama untuk produk yang mencakup semua field yang dibutuhkan
interface Produk {
  id: string;
  judul: string;
  description: string;
  harga: number;
  stok: number;
  alamat: string;
  imageUrl: string | null;
  video_url: string | null;
  created_at: string;
  pembuat: { 
    user_name: string;
  } | null;
};

// Tipe untuk riwayat pesanan dengan status yang spesifik
interface RiwayatPesanan {
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
  const [produkDiajukan, setProdukDiajukan] = useState<Produk[]>([]);
  const [produkDisetujui, setProdukDisetujui] = useState<Produk[]>([]);
  const [riwayatPesanan, setRiwayatPesanan] = useState<RiwayatPesanan[]>([]);
  const [loading, setLoading] = useState({ tinjauan: true, pesanan: true, riwayat: true });
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const fetchDataTinjauan = useCallback(async () => {
    setLoading((prev) => ({ ...prev, tinjauan: true }));
    const result = await getProdukUntukPemerintahAction();
    if ("success" in result && result.success && result.data) {
      setProdukDiajukan(result.data as Produk[]);
    }
    setLoading((prev) => ({ ...prev, tinjauan: false }));
  }, []);

  const fetchDataPesanan = useCallback(async () => {
    setLoading((prev) => ({ ...prev, pesanan: true }));
    const result = await getProdukDisetujuiAction();
    if ("success" in result && result.success && result.data) {
      setProdukDisetujui(result.data as Produk[]);
    }
    setLoading((prev) => ({ ...prev, pesanan: false }));
  }, []);

  const fetchDataRiwayat = useCallback(async () => {
    setLoading((prev) => ({ ...prev, riwayat: true }));
    const result = await getRiwayatPesananAction();
    if ("success" in result && result.success && result.data) {
      setRiwayatPesanan(result.data as RiwayatPesanan[]);
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
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="tinjauan-produk">Tinjauan Produk</TabsTrigger>
          <TabsTrigger value="buat-pesanan">Buat Pesanan Baru</TabsTrigger>
          <TabsTrigger value="riwayat-pesanan">Riwayat Pesanan</TabsTrigger>
        </TabsList>

        <TabsContent value="tinjauan-produk" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Produk untuk Ditinjau</CardTitle>
              <CardDescription>Produk yang diajukan oleh komunitas dan menunggu persetujuan Anda.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-gray-200">
              {loading.tinjauan ? ( <div className="text-center py-8 flex items-center justify-center gap-2"><Loader2 className="animate-spin"/>Memuat...</div> ) : 
              produkDiajukan.length === 0 ? ( <p className="text-center text-gray-500 py-8">Tidak ada produk untuk ditinjau.</p> ) : (
                produkDiajukan.map((produk) => (
                  <div key={produk.id} className="flex justify-between items-center p-4">
                    <p>{produk.judul} - oleh <strong>{produk.pembuat?.user_name || "N/A"}</strong></p>
                    <Dialog open={activeDialog === `review-${produk.id}`} onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setActiveDialog(`review-${produk.id}`)}>
                          <Eye className="mr-2 h-4 w-4" /> Tinjau
                        </Button>
                      </DialogTrigger>
                      <ReviewProdukDialog produk={produk} onActionComplete={handleActionComplete} />
                    </Dialog>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buat-pesanan" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Produk Tersedia untuk Dipesan</CardTitle>
              <CardDescription>Daftar produk yang telah disetujui dan siap untuk dipesan.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-gray-200">
              {loading.pesanan ? ( <div className="text-center py-8 flex items-center justify-center gap-2"><Loader2 className="animate-spin"/>Memuat...</div> ) : 
              produkDisetujui.length === 0 ? ( <p className="text-center text-gray-500 py-8">Tidak ada produk yang bisa dipesan.</p> ) : (
                produkDisetujui.map((produk) => (
                  <div key={produk.id} className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-4">
                      <Image src={produk.imageUrl || "/placeholder.png"} alt={produk.judul} width={60} height={60} className="rounded-md object-cover border"/>
                      <div>
                        <p className="font-semibold">{produk.judul}</p>
                        <p className="text-sm text-gray-600">Stok: {produk.stok}</p>
                      </div>
                    </div>
                    <Dialog open={activeDialog === `order-${produk.id}`} onOpenChange={(isOpen) => !isOpen && setActiveDialog(null)}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setActiveDialog(`order-${produk.id}`)}><ShoppingCart className="mr-2 h-4 w-4"/> Buat Pesanan</Button>
                      </DialogTrigger>
                      <DialogContent><DialogHeader><DialogTitle>Buat Pesanan</DialogTitle></DialogHeader><FormBuatPesanan produk={produk} onActionComplete={handleActionComplete} /></DialogContent>
                    </Dialog>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="riwayat-pesanan" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pesanan Anda</CardTitle>
              <CardDescription>Daftar semua pesanan yang telah Anda buat.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-gray-200">
              {loading.riwayat ? ( <div className="text-center py-8 flex items-center justify-center gap-2"><Loader2 className="animate-spin"/>Memuat...</div> ) : 
              riwayatPesanan.length === 0 ? ( <p className="text-center text-gray-500 py-8">Belum ada riwayat pesanan.</p> ) : (
                riwayatPesanan.map((pesanan) => (
                  <div key={pesanan.id} className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-4">
                      <Image src={pesanan.produk.imageUrl || "/placeholder.png"} alt={pesanan.produk.judul} width={60} height={60} className="rounded-md object-cover border"/>
                      <div>
                        <p className="font-semibold">{pesanan.produk.judul}</p>
                        <p className="text-sm text-gray-600">Jumlah: {pesanan.jumlah_dipesan} unit</p>
                        <p className="text-xs text-gray-500">Tgl: {new Date(pesanan.created_at).toLocaleDateString("id-ID")}</p>
                      </div>
                    </div>
                    <Badge variant={pesanan.status_pesanan === 'selesai' ? 'default' : pesanan.status_pesanan === 'dibatalkan' ? 'destructive' : 'secondary'}>
                      {pesanan.status_pesanan}
                    </Badge>
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