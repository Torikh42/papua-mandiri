import { z } from "zod";
// Schema untuk search/filter materi
export const searchMateriSchema = z.object({
    query: z.string().optional(),
    sortBy: z.enum(["id", "created_at", "updated_at", "judul"]).default("created_at"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(50).default(10)
  });
  