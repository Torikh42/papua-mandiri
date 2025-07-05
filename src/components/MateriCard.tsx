import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye, Tag } from "lucide-react";

export interface Materi {
id: string;
  judul: string;
  description: string;
  created_at: string;
  updated_at?: string;
  image_url: string | null;
  video_url: string | null; // Ubah dari 'string' ke 'string | null'
  langkah_langkah: string[]; // Atau string[] | null jika bisa null
  uploader_id: string;
  category? : string
  views_count?: number;
  Kategori?: {
    id: string;
    judul: string;
  };
}

interface MateriCardProps {
  materi: Materi;
}

const MateriCard: React.FC<MateriCardProps> = ({ materi }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div className="relative w-full h-48 bg-gray-200">
        {materi.image_url ? (
          <Image
            src={materi.image_url}
            alt={materi.judul}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-300 text-gray-500">
            Gambar Tidak Tersedia
          </div>
        )}
      </div>

      <CardHeader className="flex-grow">
        {materi.Kategori && (
          <Badge variant="secondary" className="w-fit shrink-0 mb-2">
            <Tag className="w-3 h-3 mr-1.5" />
            {materi.Kategori.judul}
          </Badge>
        )}
        <CardTitle
          className="text-lg font-bold leading-tight line-clamp-2"
          style={{ color: "#4C7A6b" }}
        >
          {materi.judul}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 line-clamp-3 pt-1">
          {materi.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(materi.created_at)}
          </div>
          {materi.views_count !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {materi.views_count}
            </div>
          )}
        </div>

        <Button
          asChild
          className="w-full"
          style={{ backgroundColor: "#4C7A6b", color: "white" }}
        >
          <Link href={`/materi-details/${materi.id}`}>Lihat Detail</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default MateriCard;
