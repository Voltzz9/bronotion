'use client'

import * as React from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const items = [
  {
    title: "Fast and Focused",
    description: "Capture ideas at the speed of thought with ease.",
    image: "/resources/placeholder.jpg",
  },
  {
    title: "Collaborate Seamlessly",
    description: "Work together like you're in the same room, no matter the distance.",
    image: "/resources/placeholder.jpg",
  },
  {
    title: "Search Instantly",
    description: "Find exactly what you need with lightning-fast search capabilities.",
    image: "/resources/placeholder.jpg",
  },
  {
    title: "Integrate Effortlessly",
    description: "Connect with your favorite apps for endless possibilities.",
    image: "/resources/placeholder.jpg",
  },
  {
    title: "Loved by Professionals",
    description: "Join thousands of professionals using our tools to achieve more.",
    image: "/resources/placeholder.jpg",
  },
]

export function CarouselLandingComponent() {
  return (
    <section className="w-full bg-gradient-to-r from-primary to-secondary py-12 md:py-24">
      <div className="container mx-auto px-4">
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {items.map((item, index) => (
              <CarouselItem key={index}>
                <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4">{item.title}</h2>
                    <p className="text-lg md:text-xl text-white/80">{item.description}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/40 text-white" />
          <CarouselNext className="right-4 bg-white/20 hover:bg-white/40 text-white" />
        </Carousel>
      </div>
    </section>
  )
}