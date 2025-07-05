// types/index.ts

export interface Kategori {
  id: string;
  judul: string;
  description?: string;
}

export interface Materi {
  id: string;
  judul: string;
  description?: string;
  Kategori?: Kategori;
  created_at: string; // ← Ganti ke string agar cocok dengan hasil API dan komponen
  updated_at?: string;
  image_url: string | null; // ← Tambahkan agar tidak error di MateriCard
  views_count?: number;
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
