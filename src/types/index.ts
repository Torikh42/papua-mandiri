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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MateriResult {
  success: boolean;
  materiList: Materi[];
  errorMessage?: string;
}

export interface KategoriResult {
  success: boolean;
  categories: Kategori[];
  errorMessage?: string;
}

export interface PopularMateriResult {
  success: boolean;
  popularMateriList: Materi[];
  errorMessage?: string;
}
