// components/footer.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, Instagram, Facebook } from 'lucide-react'; // Import ikon

const Footer = () => {
  return (
    <footer
    className="text-white py-1 px-2 sm:px-3"
    style={{
      background: "var(--Gradasi-Hijau-Biru, linear-gradient(90deg, #6EA57C 0%, #8FC2D1 100%))",
    }}
  >
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kolom 1: Logo, Nama, Deskripsi */}
        <div className="flex flex-col items-start space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/PAMAN.png" // Pastikan Anda memiliki logo ini
              height={50}
              width={50}
              alt="Paman Logo"
              className="sm:h-[60px] sm:w-[60px]"
            />
            <div>
              <h2 className="text-xl font-bold leading-tight">Paman</h2>
              <span className="text-sm font-semibold">Papua Mandiri</span>
            </div>
          </Link>
          <p className="text-sm mt-2">
          Papua Mandiri adalah aplikasi yang menghadirkan berbagai produk dan inspirasi dari hasil olahan sumber daya alam Papua. Jelajahi resep autentik, produk lokal, dan tips kemandirian yang berbasis kearifan lokal. Satu langkah kecil untuk mendukung kemandirian pangan dan ekonomi Papua!
          </p>
        </div>

        {/* Kolom 2: Menu Utama */}
        <div>
          <h3 className="text-lg font-bold mb-4">Menu Utama</h3>
          <ul className="space-y-2">
            <li><Link href="/materi/belajar" className="text-sm hover:underline">Mulai Belajar</Link></li> {/* Asumsi rute ini ada */}
            <li><Link href="/materi" className="text-sm hover:underline">Riwayat Materi</Link></li> {/* Asumsi rute ini ada */}
            <li><Link href="/materi/ditandai" className="text-sm hover:underline">Materi Ditandai</Link></li> {/* Asumsi rute ini ada */}
            <li><Link href="/paman-ai" className="text-sm hover:underline">Paman AI</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Contact Us */}
        <div>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Phone size={16} />
              <span className="text-sm">Phone Number</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} />
              <span className="text-sm">Email</span>
            </li>
            <li className="flex items-center gap-2">
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                <Instagram size={16} />
                <span className="text-sm">Instagram</span>
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                <Facebook size={16} />
                <span className="text-sm">Facebook</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Teks Hak Cipta */}
      <div className="border-t border-gray-600 mt-10 pt-6 text-center text-xs text-gray-300">
        <p>&copy; Copyright by Anak Bawang. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;