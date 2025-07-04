// app/paman-ai/page.tsx
import PamanAiForm from '@/components/PamanAiForm'; // Pastikan path import benar
import React from 'react';

export default function PamanAiPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Paman AI</h1>
        <p className="text-lg text-gray-600 mt-2">
          Asisten cerdas Anda untuk menemukan informasi seputar materi Papua Mandiri.
        </p>
      </div>
      <PamanAiForm />
    </div>
  );
}