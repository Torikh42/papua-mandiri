"use server";
import { createClient } from "@/auth/server";
import { handleError } from "@/lib/utils";


export interface Materi {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type MateriSortBy = "title" | "created_at";
export type SortOrder = "asc" | "desc";

// 1. Search Materi (by title/description)
export const searchMateri = async (
  query: string,
  sortBy: MateriSortBy = "created_at",
  sortOrder: SortOrder = "desc",
  page = 1,
  limit = 10
) => {
  try {
    const supabase = await createClient();

    let searchQuery = supabase.from("materi").select("*", { count: "exact" });

    if (query.trim()) {
      searchQuery = searchQuery.or(
        `title.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    searchQuery = searchQuery
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await searchQuery;

    if (error) throw error;

    return {
      success: true,
      data: {
        materi: data || [],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
      },
      errorMessage: null,
    };
  } catch (error) {
    return {
      data: {
        materi: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
      },
      ...handleError(error),
    };
  }
};

// 2. Get All Materi (tanpa search)
export const getAllMateri = async (
  sortBy: MateriSortBy = "created_at",
  sortOrder: SortOrder = "desc",
  page = 1,
  limit = 10
) => {
  return searchMateri("", sortBy, sortOrder, page, limit); // pakai ulang fungsi di atas
};

// 3. Materi Suggestion (untuk autocomplete)
export const getMateriSuggestions = async (query: string, limit = 5) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("materi")
      .select("id, title")
      .ilike("title", `${query}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      success: true,
      suggestions:
        data?.map((item) => ({
          id: item.id,
          text: item.title,
        })) || [],
      errorMessage: null,
    };
  } catch (error) {
    return {
      suggestions: [],
      ...handleError(error),
    };
  }
};

// 4. Get Materi Detail by ID
export const getMateriById = async (id: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("materi")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      errorMessage: null,
    };
  } catch (error) {
    return {

      data: null,
      ...handleError(error),
    };
  }
};
