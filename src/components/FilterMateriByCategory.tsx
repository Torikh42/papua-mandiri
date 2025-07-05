"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { X, Filter } from "lucide-react"
import { getAllCategoriesAction } from '@/action/kategoriAction'

interface Category {
  id: string
  judul: string
  description: string | null
}

// Nama interface diubah agar lebih jelas
interface FilterMateriByCategoryProps {
  onCategoryFilter: (categoryId: string | null) => void
  selectedCategory: string | null
}

const FilterMateriByCategory = ({ onCategoryFilter, selectedCategory }: FilterMateriByCategoryProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const result = await getAllCategoriesAction()
        
        // --- PERBAIKAN LOGIKA DI SINI ---
        // Gunakan type guard untuk memeriksa apakah aksi berhasil
        if ("success" in result && result.success && result.categories) {
          setCategories(result.categories)
        } else {
          // Jika tidak berhasil, set pesan error
          setError(result.errorMessage || "Gagal memuat kategori.")
        }

      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Terjadi kesalahan saat memuat kategori")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryChange = (categoryId: string) => {
    onCategoryFilter(categoryId === "all" ? null : categoryId)
  }

  const clearFilter = () => {
    onCategoryFilter(null)
  }

  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.judul

  // ... sisa kode JSX Anda sudah benar, tidak perlu diubah ...
  // (isLoading, error, dan return utama)
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-500">Memuat kategori...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-500">Error: {error}</span>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter Kategori:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.judul}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCategory && selectedCategoryName && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedCategoryName}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={clearFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      </div>
      {/* ... sisa kode JSX Anda ... */}
    </div>
  )
}

export default FilterMateriByCategory