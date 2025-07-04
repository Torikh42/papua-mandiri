// components/Kategori/KategoriSdaCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface Kategori {
  id: string;
  judul: string; // Nama kategori di DB
  description?: string | null;
  created_at?: string;
}

interface KategoriSdaCardProps {
  kategori: Kategori;
}

const KategoriSdaCard: React.FC<KategoriSdaCardProps> = ({ kategori }) => {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-4 pb-2 flex-grow">
        <CardTitle
          className="text-xl font-bold leading-tight line-clamp-2"
          style={{ color: "#4C7A6b" }}
        >
          {kategori.judul}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 line-clamp-3 mt-1">
          {kategori.description || "Tidak ada deskripsi tersedia."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 mt-auto"></CardContent>
    </Card>
  );
};

export default KategoriSdaCard;
