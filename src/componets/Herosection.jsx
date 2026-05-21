import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      subtitle: "NEW ARRIVAL",
      title: "Summer Collection 2026 Lookbook",
      image: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/e4967aa2-3740-4cb0-ae5b-89c8ed39043f/M+J+BRK+FLC+FZ.png",
      bgColor: "bg-[#f4f2f0]"
    },
    {
      id: 2,
      subtitle: "LIMITED EDITION",
      title: "Urban Streetwear Essentials",
      image: "https://static.nike.com/a/images/t_default/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/f50b2710-c91e-4240-892e-6bd5c435be41/WMNS+AIR+JORDAN+1+RETRO+HI+OG.png",
      bgColor: "bg-[#e5e7eb]"
    },
    {
      id: 3,
      subtitle: "SPECIAL OFFER",
      title: "Elevate Your Style With 50% Off",
      image: "https://i.pinimg.com/736x/0a/08/b7/0a08b7590e03ceae18ceb5e7668863d9.jpg",
      bgColor: "bg-[#fceef5]"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="py-4 bg-white">
      {/* - md:h-[500px]: កំណត់កម្ពស់ឱ្យនៅថេរជានិច្ច មិនថាប្តូរ Slide ឬអក្សរវែងខ្លី
          - flex-row: ចែក Content ជាពីរសងខាង (ឆ្វេង-ស្តាំ)
      */}
      <div className={`transition-colors duration-1000 ease-in-out ${slides[currentSlide].bgColor} rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row items-stretch min-h-[550px] md:h-[500px] relative`}>
        
        {/* ផ្នែកអក្សរ (Left Side - Always 50%) */}
        <div className="flex-1 flex flex-col justify-center p-10 md:p-16 lg:p-20 z-10">
          <p className="text-[#004d2c] font-bold tracking-[0.2em] text-xs md:text-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {slides[currentSlide].subtitle}
          </p>
          <h1 
            key={`title-${currentSlide}`}
            className="text-gray-900 text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-[1.1] mb-8 max-w-lg tracking-tight animate-in fade-in slide-in-from-left-8 duration-700"
          >
            {slides[currentSlide].title}
          </h1>
          
          <button className="bg-gray-900 text-white w-fit px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#004d2c] transition-all active:scale-95 shadow-xl">
            Shop Collection
          </button>
        </div>

        {/* ផ្នែករូបភាព (Right Side - Always 50%) */}
        <div className="flex-1 relative overflow-hidden">
          {/* - h-full: បង្ខំឱ្យរូបភាពមានកម្ពស់ស្មើនឹង Container មេជានិច្ច
              - object-cover: ធានាថារូបភាពពេញប្រអប់ និងមិនយារ
          */}
          <img 
            key={`image-${currentSlide}`}
            src={slides[currentSlide].image} 
            alt="Fashion" 
            className="w-full h-full object-cover object-center animate-in fade-in zoom-in-105 duration-1000"
          />
          
          {/* Subtle gradient for smooth blending on desktop */}
          <div className={`hidden md:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent to-transparent`} 
               style={{ backgroundImage: `linear-gradient(to right, ${slides[currentSlide].bgColor.replace('bg-[', '').replace(']', '')}, transparent)` }}
          />
        </div>

        {/* Indicators (Dots) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-20 md:translate-x-0 flex gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-500 rounded-full ${
                currentSlide === index 
                ? "w-10 h-1.5 bg-gray-900" 
                : "w-2 h-2 bg-gray-400 hover:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;