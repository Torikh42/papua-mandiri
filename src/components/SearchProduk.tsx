"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { searchProduk } from "@/lib/searchProduk"

type Item = {
  id: string
  judul: string
  description: string
}

const SearchProduk = () => {
  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const results = await searchProduk(search)
      setItems(results || [])
    }

    if (search.length > 0) {
      fetchData()
    } else {
      setItems([])
    }
  }, [search])

  return (
    <div>
      <Command>
        <CommandInput
          placeholder="Cari Produk yang Diajukan"
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {items.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => router.push(`/materi-details/${item.id}`)}
            >
              <div>
                <div className="font-semibold">{item.judul}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}

export default SearchProduk
