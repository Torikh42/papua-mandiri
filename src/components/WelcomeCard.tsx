"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Heart,
  Users,
} from "lucide-react";
import Link from "next/link";

const WelcomeCard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Ayo Olah Sumber Daya Alam, Raih Manfaatnya!",
      description:
        "Eksplorasi kekayaan alam Papua lewat produk dan kreasi autentik. Dari bahan segar hingga hasil olahan mandiri semuanya berakar dari bumi Papua, untuk dapur dan hidup yang lebih mandiri. Nikmati hasilnya, rasakan jejak lokalnya!",
      icon: <Leaf className="h-6 w-6 sm:h-8 sm:w-8 text-white/80" />,
      gradient: "linear-gradient(135deg, #6EA57C 0%, #8FC2D1 100%)",
      buttonText: "Jelajahi Materi",
      href: "/materi",
    },
    {
      title: "Komunitas Petani Papua Terpercaya",
      description:
        "Bergabunglah dengan komunitas petani lokal yang berkomitmen menghadirkan produk segar berkualitas tinggi. Dukung ekonomi lokal, nikmati hasil bumi terbaik Papua!",
      icon: <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white/80" />,
      gradient: "linear-gradient(135deg, #4c7a6b 0%, #6EA57C 100%)",
      buttonText: "Jelajahi Kategori",
      href: "/kategori-materi",
    },
    {
      title: "Selamat Datang di Papua Mandiri!",
      description:
        "Ternyata banyak loh yang bisa diolah dari kekayaan alam Papua — dari buah merah hingga rempah lokal! Yuk, jelajahi potensi alam Papua dan mulai hidup mandiri dengan olahan penuh cita rasa dan manfaat!",
      icon: <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white/80" />,
      gradient: "linear-gradient(135deg, #8FC2D1 0%, #A8E6CF 100%)",
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Ganti slide setiap 5 detik

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="w-full max-w-6xl mx-auto relative px-2 sm:px-4">
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 text-white py-8 px-4 sm:py-12 sm:px-8 md:py-16 md:px-12 lg:px-16 min-h-[320px] sm:min-h-[400px] flex flex-col justify-center"
              style={{
                background: slide.gradient,
              }}
            >
              <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-4 sm:gap-8">
                {/* Content Section */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                    {slide.icon}
                    <div className="h-6 sm:h-8 w-px bg-white/30"></div>
                    <span className="text-xs sm:text-sm font-medium text-white/80 uppercase tracking-wider">
                      Papua Authentic
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3 sm:mb-4 px-2 sm:px-0">
                    {slide.title}
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg text-gray-100 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0">
                    {slide.description}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 px-2 sm:px-0">
                    {/* Tombol hanya ditampilkan jika ada buttonText dan href */}
                    {slide.buttonText && slide.href && (
                       <Button
                        asChild
                        className="bg-white/20 hover:bg-white/30 text-white font-semibold border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 w-full sm:w-auto text-sm sm:text-base"
                        size="default"
                      >
                        <Link href={slide.href}>
                          <ArrowRight className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          {slide.buttonText}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="hidden xl:block flex-shrink-0">
                  <div className="relative">
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center">
                      <div className="w-16 h-16 lg:w-24 lg:h-24 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                        {React.cloneElement(slide.icon, {
                          className: "h-8 w-8 lg:h-12 lg:w-12 text-white",
                        })}
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 lg:-top-4 lg:-right-4 w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full backdrop-blur-sm"></div>
                    <div className="absolute -bottom-2 -left-2 lg:-bottom-4 lg:-left-4 w-4 h-4 lg:w-6 lg:h-6 bg-white/15 rounded-full backdrop-blur-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-all duration-200 hover:scale-110 hidden xs:block"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-all duration-200 hover:scale-110 hidden xs:block"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-gray-800 w-4 sm:w-8"
                : "bg-gray-400 hover:bg-gray-600"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="text-center mt-2 sm:mt-4">
        <span className="text-xs sm:text-sm text-gray-600">
          {currentSlide + 1} / {slides.length}
        </span>
      </div>
    </div>
  );
};

export default WelcomeCard;