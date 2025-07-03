"use client"

import React from "react"
import SearchMateri from "@/components/SearchMateri"

const Kategori = () => {
  return (
    <div className="px-6 py-8">
      <h1 style={{ color: "#4C7A4F" }} className="text-2xl font-bold text-center">
        Kategori SDA
      </h1>
      <p className="text-center text-gray-600 mt-2">
        Jelajahi berbagai kategori seperti makanan, kerajinan, dan lainnya.
      </p>
    </div>
  )
}

const MateriPage = () => {
  return (
    <div className="max-w-xl mx-auto py-10 flex flex-col space-y-12">
      <Kategori />
      <SearchMateri />
      <footer className="text-center text-gray-500 text-sm pt-10">
        &copy; 2025 My Search App
      </footer>
    </div>
  )
}

export default MateriPage
