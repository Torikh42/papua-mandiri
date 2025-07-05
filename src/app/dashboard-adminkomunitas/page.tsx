import React from "react";
import MateriCarouselSection from "@/components/MateriCarouselSection";
import DashboardAdminKomunitasClient from "./DashboardClient"; // Import komponen client yang baru

// Halaman ini sekarang menjadi Server Component
const DashboardAdminKomunitasPage = async () => {
  return (
    // Panggil komponen client...
    <DashboardAdminKomunitasClient>
      {/* ...dan lewatkan komponen server sebagai children! */}
      <MateriCarouselSection />
    </DashboardAdminKomunitasClient>
  );
};

export default DashboardAdminKomunitasPage;