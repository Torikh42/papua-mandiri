import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Materi {
  id: string;
  judul: string;
  description: string;
  image_url?: string;
  video_url?: string;
  langkah_langkah: string[];
  uploader_id?: string;
  category: string;
  created_at: string;
}

interface MateriCardProps {
  materi: Materi;
}

const MateriCard: React.FC<MateriCardProps> = ({ materi }) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        {materi.image_url ? (
          <Image
            src={materi.image_url}
            alt={materi.judul}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-300 text-gray-600 text-sm">
            Gambar Tidak Tersedia
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-1">
        <CardTitle
          className="text-lg font-bold leading-tight line-clamp-2"
          style={{ color: '#4C7A6b' }}
        >
          {materi.judul}
        </CardTitle>
          <Badge variant="secondary" className="capitalize text-xs whitespace-nowrap">
            {materi.category.replace(/_/g, ' ')}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-600 line-clamp-3">
          {materi.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 text-xs text-gray-500">
        <p>Diupload: {new Date(materi.created_at).toLocaleDateString('id-ID')}</p>
      </CardContent>
    </Card>
  );
};

export default MateriCard;