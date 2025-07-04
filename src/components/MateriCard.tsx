// components/MateriCard.tsx - Enhanced version with category display

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Tag } from 'lucide-react';

export interface Materi {
  id: string;
  created_at: string;
  judul: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  langkah_langkah: string;
  uploader_id: string;
  category: string;
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
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg hover:scale-105 transition-transform duration-200">
      {/* Image Section */}
      {materi.image_url && (
        <Image
          src={materi.image_url}
          alt={materi.judul}
          width={400}
          height={192}
          className="w-full h-full object-cover"
          style={{ width: '100%', height: '100%' }}
          priority={true}
        />
      )}
      
      <CardHeader className="flex-grow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg font-bold leading-tight"
            style={{ color: '#4C7A6b' }}>
            {materi.judul}
          </CardTitle>
          {materi.Kategori && (
            <Badge variant="secondary" className="shrink-0">
              <Tag className="w-3 h-3 mr-1" />
              {materi.Kategori.judul}
            </Badge>
          )}
        </div>
        
        <CardDescription className="text-sm text-gray-600 line-clamp-3">
          {materi.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(materi.created_at)}
          </div>
        </div>
        
        <Link href={`/materi-details/${materi.id}`} className="w-full">
            <Button
            className="w-full"
            style={{ backgroundColor: '#4C7A6b', color: 'white' }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#3b5e52')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#4C7A6b')}
            >
            Lihat Detail
            </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default MateriCard;