Proyek Papua Mandiri 🇮🇩
📖 Tentang Proyek
Papua Mandiri adalah sebuah platform digital inovatif yang bertujuan untuk memberdayakan komunitas lokal di Papua melalui dua pilar utama: edukasi dan ekonomi. Platform ini menyediakan wadah untuk berbagi materi pembelajaran mengenai pengolahan sumber daya alam lokal, sekaligus memfasilitasi alur kerja di mana produk-produk dari komunitas dapat ditawarkan, ditinjau, dan dipesan oleh pihak pemerintah.

Visi kami adalah untuk mewujudkan kemandirian Papua dengan memanfaatkan kekayaan alamnya secara berkelanjutan, meningkatkan keterampilan masyarakat, dan membuka akses pasar yang lebih luas untuk produk-produk lokal berkualitas.

✨ Fitur Utama
Manajemen Materi Edukasi: Super Admin dapat membuat, membaca, memperbarui, dan menghapus (CRUD) materi pembelajaran yang kaya konten, termasuk gambar, video, dan langkah-langkah detail.

Manajemen Produk Komunitas: Sebuah alur kerja lengkap di mana Admin Komunitas dapat mengajukan produk, yang kemudian ditinjau dan disetujui/ditolak oleh Admin Pemerintah.

Dasbor Berbasis Peran: Antarmuka dasbor yang berbeda dan disesuaikan untuk setiap peran:

Super Admin: Manajemen total atas pengguna, materi, dan kategori.

Admin Komunitas: Mengajukan produk, mengelola status produk, dan menanggapi pesanan.

Admin Pemerintah: Meninjau produk yang diajukan dan membuat pesanan.

User: Menyimpan materi favorit dan melihat dasbor pribadi.

Asisten AI "Paman AI": Sebuah chatbot kontekstual yang ditenagai oleh model AI DeepSeek, dilatih untuk menjawab pertanyaan pengguna secara spesifik berdasarkan konten materi yang ada di platform (menggunakan pola RAG).

Riwayat Percakapan AI: Pengguna dapat melihat kembali riwayat percakapan mereka dengan Paman AI melalui sidebar, seperti aplikasi chat modern.

Manajemen Pesanan: Admin Pemerintah dapat membuat pesanan untuk produk yang telah disetujui, dan Admin Komunitas dapat melihat serta mengelola pesanan yang masuk.

🛠️ Teknologi yang Digunakan
Proyek ini dibangun menggunakan tumpukan teknologi modern yang berfokus pada kinerja, skalabilitas, dan pengalaman pengembang.

Framework: Next.js (App Router)

Bahasa: TypeScript

Backend & Database: Supabase (PostgreSQL, Auth)

Styling: Tailwind CSS

Komponen UI: shadcn/ui

Model AI: DeepSeek (diakses melalui OpenRouter)

Media Hosting: Cloudinary (untuk unggahan gambar & video)

Validasi Skema: Zod

Deployment: Vercel

🚀 Menjalankan Proyek Secara Lokal
Untuk menjalankan proyek ini di lingkungan pengembangan lokal Anda, ikuti langkah-langkah berikut.

1. Prasyarat
Node.js (v18 atau lebih baru)

npm, yarn, atau pnpm

2. Instalasi
Kloning repositori dan instal semua dependensi yang dibutuhkan:

```
git clone (https://github.com/Torikh42/papua-mandiri)
cd papua-mandiri
npm install
```

3. Konfigurasi Environment Variables
Salin file .env.example menjadi .env dan isi semua variabel yang dibutuhkan.


File: ``.env.local``

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI Model (OpenRouter/DeepSeek)
DEEPSEEK_API_KEY=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# URL Situs (untuk pengembangan)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Menjalankan Server
Jalankan server pengembangan:

Bash
```
npm run dev
```

Buka http://localhost:3000 di browser Anda untuk melihat hasilnya.
