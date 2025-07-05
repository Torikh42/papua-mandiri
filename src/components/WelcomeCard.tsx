"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Heart, Users } from "lucide-react";


const WelcomeCard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Ayo Olah Sumber Daya Alam, Raih Manfaatnya!",
      description: "Eksplorasi kekayaan alam Papua lewat produk dan kreasi autentik. Dari bahan segar hingga hasil olahan mandiri semuanya berakar dari bumi Papua, untuk dapur dan hidup yang lebih mandiri. Nikmati hasilnya, rasakan jejak lokalnya!",
      icon: <Leaf className="h-8 w-8 text-white/80" />,
      gradient: "linear-gradient(135deg, #6EA57C 0%, #8FC2D1 100%)",
      buttonText: "Jelajahi Resep"
    },
    {
      title: "Komunitas Petani Papua Terpercaya",
      description: "Bergabunglah dengan komunitas petani lokal yang berkomitmen menghadirkan produk segar berkualitas tinggi. Dukung ekonomi lokal, nikmati hasil bumi terbaik Papua!",
      icon: <Users className="h-8 w-8 text-white/80" />,
      gradient: "linear-gradient(135deg, #4c7a6b 0%, #6EA57C 100%)",
      buttonText: "Bergabung Sekarang"
    },
    {
      title: "Selamat Datang di Papua Mandiri!",
      description: "Ternyata banyak loh yang bisa diolah dari kekayaan alam Papua — dari buah merah hingga rempah lokal! Yuk, jelajahi potensi alam Papua dan mulai hidup mandiri dengan olahan penuh cita rasa dan manfaat!",
      icon: <Heart className="h-8 w-8 text-white/80" />,
      gradient: "linear-gradient(135deg, #8FC2D1 0%, #A8E6CF 100%)",
      buttonText: "Coba Sekarang"
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

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
    <div className="max-w-6xl mx-auto relative">
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 text-white py-12 px-8 md:py-16 md:px-12 lg:px-16 min-h-[400px] flex flex-col justify-center"
              style={{
                background: slide.gradient,
              }}
            >
              <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-8">
                {/* Content Section */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                    {slide.icon}
                    <div className="h-8 w-px bg-white/30"></div>
                    <span className="text-sm font-medium text-white/80 uppercase tracking-wider">
                      Papua Authentic
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                    {slide.title}
                  </h1>
                  
                  <p className="text-base md:text-lg text-gray-100 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    {slide.description}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    <Button 
                      className="bg-white/20 hover:bg-white/30 text-white font-semibold border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                      size="lg"
                    >
                      <ArrowRight className="mr-2 h-5 w-5" />
                      {slide.buttonText}
                    </Button>
                    
                    <button className="text-white/80 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors duration-200">
                      Pelajari Lebih Lanjut
                    </button>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="hidden lg:block flex-shrink-0">
                  <div className="relative">
                    <div className="w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center">
                      <div className="w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                        {React.cloneElement(slide.icon, { className: "h-12 w-12 text-white" })}
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm"></div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-white/15 rounded-full backdrop-blur-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-3 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-gray-800 w-8"
                : "bg-gray-400 hover:bg-gray-600"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-600">
          {currentSlide + 1} / {slides.length}
        </span>
      </div>
    </div>
  );
};

export default WelcomeCard;