"use server";

import { createClient } from "@/auth/server";
import openai from "@/openai";
import { formatAiResponse } from "@/utils/formatter";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type MateriContext = {
  judul: string;
  description: string;
  langkah_langkah: string[];
};

type PamanAIResponse = {
  response?: string;
  error?: string;
};

export const askPamanAiAction = async (
  question: string,
  chatHistory: ChatMessage[]
): Promise<PamanAIResponse> => {
  if (!question.trim()) {
    return { error: "Pertanyaan tidak boleh kosong." };
  }

  try {
    const supabase = await createClient();

    // 1. Improved context fetching
    const keywords = [
      ...new Set(question.toLowerCase().split(/\s+/).filter(Boolean)),
    ];
    const searchFilters = keywords
      .map((key) => `judul.ilike.%${key}%,description.ilike.%${key}%`)
      .join(",");

    const { data: contextData, error: contextError } = await supabase
      .from("Materi")
      .select("judul, description, langkah_langkah")
      .or(searchFilters)
      .limit(50);

    if (contextError) {
      console.error("Error fetching context:", contextError);
      return { error: "Gagal mengambil konteks materi dari database." };
    }

    // 2. Format context
    const formattedContext = contextData?.length
      ? contextData.map(formatMateriContext).join("\n\n---\n\n")
      : "Tidak ada konteks yang ditemukan mengenai topik ini di dalam database.";

    // 3. Prepare AI prompt
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      {
        role: "user",
        content: `Konteks materi:\n\n${formattedContext}\n\n---\n\nJawab pertanyaan berikut: "${question}"`,
      },
    ];

    // 4. Call AI API
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      messages,
    });

    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) {
      return { error: "AI tidak memberikan jawaban." };
    }

    return { response: formatAiResponse(rawResponse) };
  } catch (error) {
    console.error("Error in Paman AI Action:", error);
    return handlePamanAIError(error);
  }
};

// Helper functions
const systemPrompt = `Anda adalah "Paman AI", asisten pintar dari situs Papua Mandiri...`; // Keep your existing prompt

function formatMateriContext(materi: MateriContext): string {
  const langkahStr = materi.langkah_langkah
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");
  return `### ${materi.judul}\n\n**Deskripsi:**\n${materi.description}\n\n**Langkah-langkah:**\n${langkahStr}`;
}

function handlePamanAIError(error: unknown): PamanAIResponse {
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: "Terjadi kesalahan yang tidak diketahui." };
}
