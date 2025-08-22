import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { OctopusLogo } from "@/components/icons/octopus-logo";
import { Eyewear1 } from "@/components/icons/eyewear-1";
import { Eyewear2 } from "@/components/icons/eyewear-2";
import { Eyewear3 } from "@/components/icons/eyewear-3";
import { Eyewear4 } from "@/components/icons/eyewear-4";
import { Eyewear5 } from "@/components/icons/eyewear-5";


const GalleryImage = ({
  rotation,
  className,
  children,
}: {
  rotation: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`absolute transition-transform duration-500 ease-in-out hover:scale-110 ${rotation} ${className}`}
  >
    <div className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-64 md:w-64 rounded-xl overflow-hidden shadow-2xl">
      {children}
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 overflow-hidden">
      <header className="absolute top-8">
        <OctopusLogo className="h-16 w-16 text-white/80" />
      </header>

      <main className="flex flex-col items-center justify-center flex-grow text-center mt-20 md:mt-0">
        <div className="relative w-full h-80 md:h-96 flex items-center justify-center mb-8">
          <div className="absolute w-full h-full">
            <Image
              src="https://placehold.co/800x200.png"
              alt="Background Blur"
              layout="fill"
              objectFit="contain"
              className="opacity-10 blur-xl"
              data-ai-hint="sunglasses"
            />
          </div>
          <GalleryImage
            rotation="-rotate-12"
            className="z-10 -translate-x-16 sm:-translate-x-24 md:-translate-x-40"
          >
            <Eyewear1 className="h-full w-full" />
          </GalleryImage>
          <GalleryImage
            rotation="rotate-0"
            className="z-20 scale-110"
          >
            <Eyewear2 className="h-full w-full" />
          </GalleryImage>
          <GalleryImage
            rotation="rotate-12"
            className="z-10 translate-x-16 sm:translate-x-24 md:translate-x-40"
          >
            <Eyewear3 className="h-full w-full" />
          </GalleryImage>
           <GalleryImage
            rotation="-rotate-20"
            className="z-0 -translate-x-32 sm:-translate-x-48 md:-translate-x-72 opacity-50"
          >
            <Eyewear4 className="h-full w-full" />
          </GalleryImage>
            <GalleryImage
            rotation="rotate-20"
            className="z-0 translate-x-32 sm:translate-x-48 md:translate-x-72 opacity-50"
          >
            <Eyewear5 className="h-full w-full" />
          </GalleryImage>
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
          Eyewear That Stands Out
        </h1>
        <Button asChild className="rounded-full bg-white text-black hover:bg-gray-200 px-6 py-3 group">
          <Link href="#">
            Enter Store
            <Store className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </main>
    </div>
  );
}