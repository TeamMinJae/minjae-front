"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface ResultCarouselProps {
  memeUrls: string[]
  onComplete: () => void
}

export function ResultCarousel({ memeUrls, onComplete }: ResultCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setTimeout(() => {
      if (currentIndex < memeUrls.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else {
        setIsAutoPlaying(false)
        onComplete()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [currentIndex, isAutoPlaying, memeUrls.length, onComplete])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    if (currentIndex < memeUrls.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      onComplete()
    }
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
    if (index === memeUrls.length - 1) {
      onComplete()
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          <div className="aspect-square relative bg-gray-100">
            <Image
              src={memeUrls[currentIndex] || "/placeholder.svg"}
              alt={`만화 ${currentIndex + 1}컷`}
              fill
              className="object-cover"
            />

            {/* Navigation buttons */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="bg-black/20 hover:bg-black/40 text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="bg-black/20 hover:bg-black/40 text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Slide indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2">
                {memeUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-600">
        {currentIndex + 1} / {memeUrls.length}
        {isAutoPlaying && <span className="ml-2">자동 재생 중...</span>}
      </div>
    </div>
  )
}
