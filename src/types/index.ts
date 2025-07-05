// types/index.ts

export interface Kategori {
  id: string;
  judul: string;
  description?: string;
}

export interface Materi {
  id: string;
  judul: string;
  description: string;
  created_at: string;
  updated_at?: string;
  image_url: string | null;
  video_url: string | null; // Allow null
  langkah_langkah: string[];
  uploader_id: string;
  views_count?: number;
  Kategori?: {
    id: string;
    judul: string;
  };
}

export type MateriResult =
  | {
      success: true;
      materiList: Materi[];
      errorMessage: null;
    }
  | {
      success: false;
      materiList?: never;
      errorMessage: string;
    };

    
export type KategoriResult =
  | {
      success: true;
      categories: Kategori[];
      errorMessage: null;
    }
  | {
      success: false;
      categories?: never;
      errorMessage: string;
    };

export type PopularMateriResult =
  | {
      success: true;
      popularMateriList: Materi[];
      errorMessage: null;
    }
  | {
      success: false;
      popularMateriList?: never;
      errorMessage: string;
    };
