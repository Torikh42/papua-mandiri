// action/pamanAiAction.ts
"use server";

import { createClient } from "@/auth/server";
import openai from "@/openai";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type MateriContext = {
  judul: string;
  description: string;
  langkah_langkah: string[];
};

export const askPamanAiAction = async (
  question: string,
  chatHistory: ChatMessage[]
) => {
  if (!question) {
    return { error: "Pertanyaan tidak boleh kosong." };
  }

  try {
    const supabase = await createClient();

    // --- PERBAIKAN LOGIKA PENCARIAN UTAMA DI SINI ---

    // 1. Pecah pertanyaan menjadi kata-kata kunci yang unik.
    // Contoh: "langkah langkah minuman" -> ["langkah", "minuman"]
    const keywords = [...new Set(question.toLowerCase().split(" "))];

    // 2. Buat filter pencarian untuk setiap kata kunci pada kolom judul dan deskripsi.
    // Contoh: ["judul.ilike.%langkah%", "description.ilike.%langkah%", "judul.ilike.%minuman%", ...]
    const searchFilters = keywords
      .map((key) => `judul.ilike.%${key}%,description.ilike.%${key}%`)
      .join(",");

    // 3. Jalankan query dengan filter yang lebih fleksibel.
    const { data: contextData, error: contextError } = await supabase
      .from("Materi")
      .select("judul, description, langkah_langkah")
      .or(searchFilters) // Menggunakan filter yang baru dibuat
      .limit(50);

    // --- AKHIR DARI PERBAIKAN ---

    if (contextError) {
      console.error("Error fetching context:", contextError);
      return { error: "Gagal mengambil konteks materi dari database." };
    }

    const formattedContext =
      contextData && contextData.length > 0
        ? contextData
            .map((materi: MateriContext) => {
              const langkahStr = materi.langkah_langkah
                .map((step, index) => `${index + 1}. ${step}`)
                .join("\n");
              return `### ${materi.judul}\n\n**Deskripsi:**\n${materi.description}\n\n**Langkah-langkah:**\n${langkahStr}`;
            })
            .join("\n\n---\n\n")
        : "Tidak ada konteks yang ditemukan mengenai topik ini di dalam database.";

    const systemPrompt = `Anda adalah "Paman AI", asisten pintar dari situs Papua Mandiri. Jawablah pertanyaan pengguna HANYA berdasarkan konteks materi yang diberikan. Jika konteks tidak ditemukan, katakan dengan sopan bahwa informasi tersebut tidak tersedia. Format jawaban Anda harus rapi dan mudah dibaca seperti artikel. Gunakan Markdown:\n\n- Gunakan \`###\` untuk judul besar\n- Gunakan \`**\` untuk menebalkan\n- Gunakan daftar terurut atau bullet jika perlu\n- Hindari tanda kutip berlebihan\n\nJawab selalu dalam Bahasa Indonesia.`;

    const userMessageWithContext = `Konteks materi:\n\n${formattedContext}\n\n---\n\nJawab pertanyaan berikut dalam bentuk artikel terformat: "${question}"`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: userMessageWithContext },
    ];

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      messages: messages as any,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return { error: "AI tidak memberikan jawaban." };
    }

    return { response };
  } catch (error) {
    console.error("Error in Paman AI Action:", error);
    return { error: "Terjadi kesalahan pada server Paman AI." };
  }
};