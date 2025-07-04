// lib/searchMateri.ts
import { supabase } from "./supabaseClient"

export async function searchMateri(query: string, categoryId?: string | null) {
  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    let queryBuilder = supabase
      .from("Materi")
      .select(`
        *,
        Kategori!category (
          id,
          judul
        )
      `)
      .or(`judul.ilike.%${query}%,description.ilike.%${query}%`)

    // Add category filter if provided
    if (categoryId) {
      queryBuilder = queryBuilder.eq("category", categoryId)
    }

    const { data, error } = await queryBuilder
      .limit(10)
      .order("judul", { ascending: true })

    if (error) {
      console.error("Error fetching materi:", error.message)
      throw new Error(error.message)
    }

    return data || []
  } catch (error) {
    console.error("Error in searchMateri:", error)
    throw error
  }
}