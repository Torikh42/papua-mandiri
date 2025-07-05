// Fungsi ini lebih cocok untuk membersihkan dan menstandarkan Markdown
export function formatAiResponse(rawResponse: string): string {
  if (!rawResponse) return "";

  let formatted = rawResponse;

  // Ganti heading yang terlalu dalam (#### atau lebih) menjadi ###
  formatted = formatted.replace(/^#{4,}/gm, "###");

  // Standarkan BOLD: ganti ***teks*** menjadi **teks**
  formatted = formatted.replace(/\*{3,}([^*]+)\*{3,}/g, "**$1**");

  // Hapus spasi berlebih, tetapi pertahankan baris baru
  formatted = formatted.replace(/([^\n])\s{3,}/g, "$1 ");

  // Pastikan ada baris baru setelah tanda baca untuk paragraf baru
  formatted = formatted.replace(/([.!?])\s*([A-Z\d])/g, "$1\n\n$2");

  // Hapus baris baru yang berlebihan (lebih dari 2 baris baru berturut-turut)
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  return formatted.trim();
}
