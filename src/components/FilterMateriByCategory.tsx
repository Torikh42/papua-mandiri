// components/FilterMateriByCategory.tsx
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
import { getAllCategoriesAction } from '@/action/kategoriAction' // Menggunakan action yang sudah ada

interface Category {
  id: string
  judul: string
  description: string | null
}

interface FilterMateriByCategory {
  onCategoryFilter: (categoryId: string | null) => void
  selectedCategory: string | null
}

const FilterMateriByCategory = ({ onCategoryFilter, selectedCategory }: FilterMateriByCategory) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        // Sesuaikan dengan struktur response dari getAllCategoriesAction
        const result = await getAllCategoriesAction()
        
        if (result.errorMessage) {
          setError(result.errorMessage)
        } else if (result.categories) {
          setCategories(result.categories)
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
    if (categoryId === "all") {
      onCategoryFilter(null)
    } else {
      onCategoryFilter(categoryId)
    }
  }

  const clearFilter = () => {
    onCategoryFilter(null)
  }

  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.judul

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

          {selectedCategory && (
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

      {/* Alternative: Quick filter buttons */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryFilter(null)}
        >
          Semua
        </Button>
        {categories.slice(0, 5).map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryFilter(category.id)}
          >
            {category.judul}
          </Button>
        ))}
        {categories.length > 5 && (
          <span className="text-sm text-gray-500 self-center">
            +{categories.length - 5} lainnya
          </span>
        )}
      </div>
    </div>
  )
}

export default FilterMateriByCategory