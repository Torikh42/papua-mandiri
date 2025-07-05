"use server";

import { createClient } from "@/auth/server";
import openai from "@/openai";
import { formatAiResponse } from "@/utils/formatter";
import { handleError } from "@/lib/utils";

// Tipe untuk riwayat percakapan yang dikirim dari client
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// Tipe untuk data konteks yang diambil dari database
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

    // 1. Ambil konteks dari database berdasarkan kata kunci pertanyaan
    const keywords = [...new Set(question.toLowerCase().split(" "))];
    const searchFilters = keywords
      .map((key) => `judul.ilike.%${key}%,description.ilike.%${key}%`)
      .join(",");

    const { data: contextData, error: contextError } = await supabase
      .from("Materi")
      .select("judul, description, langkah_langkah")
      .or(searchFilters)
      .limit(5);

    if (contextError) {
      console.error("Error fetching context:", contextError);
      return { error: "Gagal mengambil konteks materi dari database." };
    }

    // 2. Format konteks yang ditemukan untuk diberikan kepada AI
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

    // 3. Siapkan prompt untuk AI
    const systemPrompt = `Anda adalah "Paman AI", asisten pintar dari situs Papua Mandiri. Jawablah pertanyaan pengguna HANYA berdasarkan konteks materi yang diberikan. Jika konteks tidak ditemukan, katakan dengan sopan bahwa informasi tersebut tidak tersedia. Format jawaban Anda harus rapi dan mudah dibaca seperti artikel. Gunakan Markdown:\n\n- Gunakan \`###\` untuk judul besar\n- Gunakan \`**\` untuk menebalkan\n- Gunakan daftar terurut atau bullet jika perlu.\n\nJawab selalu dalam Bahasa Indonesia.`;

    const userMessageWithContext = `Konteks materi:\n\n${formattedContext}\n\n---\n\nJawab pertanyaan berikut dalam bentuk artikel terformat: "${question}"`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: userMessageWithContext },
    ];

    // 4. Panggil API AI
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: messages as any,
    });

    const rawResponse = completion.choices[0]?.message?.content;

    if (!rawResponse) {
      return { error: "AI tidak memberikan jawaban." };
    }
    
    // 5. Bersihkan dan format respons dari AI
    const formattedResponse = formatAiResponse(rawResponse);

    // 6. Kembalikan respons yang sudah bersih
    return { response: formattedResponse };

  } catch (error) {
    console.error("Error in Paman AI Action:", error);
    return handleError(error);
  }
};