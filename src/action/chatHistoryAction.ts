"use server";

import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { askPamanAiAction } from "./pamanAiAction"; // Asumsi aksi Paman AI ada di sini

/**
 * Mengambil semua judul percakapan milik user yang sedang login.
 */
export const getConversationsAction = async () => {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User tidak login.");

        const { data, error } = await supabase
            .from("Percakapan")
            .select("id, judul, created_at")
            .eq("userId", user.id)
            .order("created_at", { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return handleError(error);
    }
}

/**
 * Mengambil semua pesan dari satu percakapan tertentu.
 */
export const getMessagesAction = async (conversationId: string) => {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User tidak login.");

        // Verifikasi kepemilikan
        const { count } = await supabase.from("Percakapan").select('*', {count: 'exact', head: true}).eq('id', conversationId).eq('userId', user.id);
        if (count === 0) throw new Error("Akses ditolak.");

        const { data, error } = await supabase
            .from("Pesan")
            .select("id, role, konten")
            .eq("percakapanId", conversationId)
            .order("created_at", { ascending: true });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return handleError(error);
    }
}


/**
 * Aksi utama: Menerima pertanyaan user, mendapatkan jawaban AI, 
 * dan menyimpan keduanya ke database.
 */
export const getResponseAndSaveHistoryAction = async (
    conversationId: string | null,
    userMessage: string
) => {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User tidak login.");

        let currentConversationId = conversationId;

        // Jika ini adalah pesan pertama, buat percakapan baru
        if (!currentConversationId) {
            const { data: newConversation, error: newConvError } = await supabase
                .from("Percakapan")
                .insert({
                    userId: user.id,
                    judul: userMessage.substring(0, 50) + "...", // Judul dari pesan pertama
                })
                .select("id")
                .single();
            
            if (newConvError || !newConversation) throw new Error("Gagal membuat percakapan baru.");
            currentConversationId = newConversation.id;
        }

        // Simpan pesan dari user
        const { error: userMsgError } = await supabase.from("Pesan").insert({
            percakapanId: currentConversationId,
            role: 'user',
            konten: userMessage
        });
        if (userMsgError) throw userMsgError;

        // Dapatkan jawaban dari Paman AI (menggunakan aksi yang sudah ada)
        const aiResult = await askPamanAiAction(userMessage, []); // Riwayat dikelola di DB, jadi bisa kirim array kosong
        if (aiResult.error || !aiResult.response) {
            throw new Error(aiResult.error || "AI tidak memberikan jawaban.");
        }
        const aiMessage = aiResult.response;

        // Simpan jawaban dari AI
        const { error: aiMsgError } = await supabase.from("Pesan").insert({
            percakapanId: currentConversationId,
            role: 'assistant',
            konten: aiMessage
        });
        if (aiMsgError) throw aiMsgError;

        revalidatePath("/paman-ai"); // Refresh sidebar
        return { success: true, aiMessage, conversationId: currentConversationId };

    } catch(error) {
        return handleError(error);
    }
}