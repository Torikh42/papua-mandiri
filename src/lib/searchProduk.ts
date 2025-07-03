import { supabase } from "./supabaseClient"

export async function searchProduk(query: string) {
  const { data, error } = await supabase
    .from("Materi")
    .select("*")
    .or(`judul.ilike.%${query}%,description.ilike.%${query}%`)

  if (error) {
    console.error("Error fetching materi:", error.message)
    return []
  }

  return data
}
