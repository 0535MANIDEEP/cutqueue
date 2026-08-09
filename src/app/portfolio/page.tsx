"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface PortfolioImage {
  id: string
  imageUrl: string
  caption: string | null
  category: string
  likes: number
  barber: {
    user: { name: string }
  }
}

const categories = ["all", "fade", "beard", "classic", "creative"]

export default function PortfolioPage() {
  const [images, setImages] = useState<PortfolioImage[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/portfolio")
      if (res.ok) {
        setImages(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch portfolio:", error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = selectedCategory === "all"
    ? images
    : images.filter((img) => img.category === selectedCategory)

  return (
    <div className="min-h-screen bg-[#0A0F0D] pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#EFE9DA] mb-2">Portfolio</h1>
          <p className="text-[#EFE9DA]/50">Showcase your best work</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-[#E8B547] text-[#0A0F0D]"
                  : "bg-[#141C18] text-[#EFE9DA]/60 border border-[#263329] hover:border-[#E8B547]/30"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-[#EFE9DA]/50">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center">
            <p className="text-[#EFE9DA]/40 mb-4">No images yet</p>
            <p className="text-sm text-[#EFE9DA]/30">
              Barbers can upload their work from the dashboard
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((image) => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="relative aspect-square">
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Portfolio image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm font-medium text-white">{image.caption}</p>
                      <p className="text-xs text-white/60">
                        by {image.barber.user.name}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
