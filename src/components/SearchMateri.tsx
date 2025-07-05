// components/SearchMateri.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { searchMateri } from "@/lib/searchMateri"
import { Materi } from "./MateriCard"

type Item = {
  id: string
  judul: string
  description: string
}

interface SearchMateriProps {
  onResults?: (results: Materi[]) => void;
  selectedCategory: string | null;
}

const SearchMateri = ({ onResults, selectedCategory }: SearchMateriProps) => {
  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      if (search.length === 0) {
        setItems([])
        onResults?.([])
        return
      }

      setIsLoading(true)
      try {
        const results = await searchMateri(search, selectedCategory)
        setItems(results || [])
        onResults?.(results || [])
      } catch (error) {
        console.error("Error searching materi:", error)
        setItems([])
        onResults?.([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      fetchData()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, selectedCategory, onResults])

  return (
    <div className="mb-6">
      <Command>
        <CommandInput
          placeholder="Cari materi..."
          value={search}
          onValueChange={setSearch}
        />
        {search.length > 0 && (
          <CommandList>
            {isLoading ? (
              <CommandItem disabled>
                <div className="text-gray-500">Mencari...</div>
              </CommandItem>
            ) : items.length > 0 ? (
              items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => router.push(`/materi-details/${item.id}`)}
                >
                  <div>
                    <div className="font-semibold">{item.judul}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled>
                <div className="text-gray-500">Tidak ada hasil ditemukan</div>
              </CommandItem>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  )
}

export default SearchMateri