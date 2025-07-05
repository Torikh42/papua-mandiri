"use client"; // Komponen ini perlu berjalan di client untuk mendeteksi URL

import { usePathname } from "next/navigation";
import Footer from "./Footer"; // Pastikan path import Footer benar

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Daftar halaman yang tidak akan menampilkan footer
  const noFooterPages = ["/paman-ai"];

  // Cek apakah halaman saat ini ada di dalam daftar noFooterPages
  const showFooter = !noFooterPages.includes(pathname);

  return (
    <>
      {children}
      {showFooter && <Footer />}
    </>
  );
}