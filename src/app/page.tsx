import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

const GalleryImage = ({
  src,
  alt,
  rotation,
  className,
}: {
  src: string;
  alt: string;
  rotation: string;
  className?: string;
}) => (
  <div
    className={`absolute transition-transform duration-500 ease-in-out hover:scale-110 ${rotation} ${className}`}
  >
    <div className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-64 md:w-64 rounded-xl overflow-hidden shadow-2xl">
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        data-ai-hint="fashion model sunglasses"
      />
    </div>
  </div>
);

const OctopusLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="currentColor"
    {...props}
  >
    <path d="M50 0L95.26 25L50 100L4.74 25L50 0Z" fill="currentColor" fillOpacity="0.1"/>
    <path d="M50 12L84.53 31.5L50 88L15.47 31.5L50 12Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M50,25.4c-1.5,0-2.8,0.5-3.8,1.3l-9,7.2c-0.8,0.6-1.2,1.5-1.2,2.4v12.2c0,0.5-0.2,1-0.6,1.3l-3.1,3.1c-0.7,0.7-0.7,1.9,0,2.6l3.1,3.1c0.4,0.4,0.6,0.8,0.6,1.3V62c0,0.9,0.5,1.8,1.2,2.4l9,7.2c1,0.8,2.3,1.3,3.8,1.3s2.8-0.5,3.8-1.3l9-7.2c0.8-0.6,1.2-1.5,1.2-2.4V48.8c0-0.5,0.2-1,0.6-1.3l3.1-3.1c0.7-0.7,0.7-1.9,0-2.6l-3.1-3.1c-0.4-0.4-0.6-0.8-0.6-1.3V36.3c0-0.9-0.5-1.8-1.2-2.4l-9-7.2C52.8,25.9,51.5,25.4,50,25.4z M42.2,42.5c-1,0-1.9-0.8-1.9-1.9s0.8-1.9,1.9-1.9s1.9,0.8,1.9,1.9S43.2,42.5,42.2,42.5z M57.8,42.5c-1,0-1.9-0.8-1.9-1.9s0.8-1.9,1.9-1.9s1.9,0.8,1.9,1.9S58.8,42.5,57.8,42.5z"/>
  </svg>
);

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 overflow-hidden">
      <header className="absolute top-8">
        <OctopusLogo className="h-12 w-12 text-white/80" />
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
            src="https://placehold.co/400x400.png"
            alt="Model with round glasses"
            rotation="-rotate-12"
            className="z-10 -translate-x-16 sm:-translate-x-24 md:-translate-x-40"
          />
          <GalleryImage
            src="https://placehold.co/400x400.png"
            alt="Model profile in pink light"
            rotation="rotate-0"
            className="z-20 scale-110"
          />
          <GalleryImage
            src="https://placehold.co/400x400.png"
            alt="Model with futuristic glasses"
            rotation="rotate-12"
            className="z-10 translate-x-16 sm:translate-x-24 md:translate-x-40"
          />
           <GalleryImage
            src="https://placehold.co/400x400.png"
            alt="Faded model"
            rotation="-rotate-20"
            className="z-0 -translate-x-32 sm:-translate-x-48 md:-translate-x-72 opacity-50"
          />
            <GalleryImage
            src="https://placehold.co/400x400.png"
            alt="Faded model 2"
            rotation="rotate-20"
            className="z-0 translate-x-32 sm:translate-x-48 md:translate-x-72 opacity-50"
          />
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
