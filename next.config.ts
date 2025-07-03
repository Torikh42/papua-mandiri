import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "res.cloudinary.com" // <--- Tambahkan domain ini
      // Anda bisa menambahkan domain lain di sini jika dibutuhkan di masa depan, misal:
      // 'supabase.co',
      // 'your-supabase-storage-bucket.supabase.co', // Jika Anda akan host gambar di Supabase Storage
    ],
  },
};

export default nextConfig;
