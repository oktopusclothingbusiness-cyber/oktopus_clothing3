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
    <path d="M49.8,1.2c-1.5,0-2.9,0.5-4,1.4L35.2,11c-0.8,0.6-1.3,1.5-1.3,2.5v12.9c0,0.5-0.2,1-0.6,1.4l-3.3,3.3c-0.8,0.8-0.8,2,0,2.8l3.3,3.3c0.4,0.4,0.6,0.9,0.6,1.4V48c0,1,0.5,1.9,1.3,2.5l10.6,8.4c0.8,0.6,1.8,0.9,2.8,0.9s2-0.3,2.8-0.9l10.6-8.4c0.8-0.6,1.3-1.5,1.3-2.5V37.4c0-0.5,0.2-1,0.6-1.4l3.3-3.3c0.8-0.8,0.8-2,0-2.8l-3.3-3.3c-0.4-0.4-0.6-0.9-0.6-1.4V13.5c0-1-0.5-1.9-1.3-2.5L53.8,2.6C52.7,1.7,51.3,1.2,49.8,1.2z M40.4,32.3c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S41.5,32.3,40.4,32.3z M59.6,32.3c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S60.7,32.3,59.6,32.3z" />
    <path d="M42.1,61.4c-0.4-0.1-0.8-0.2-1.2-0.2c-4.4,0-8,3.6-8,8c0,3.9,2.8,7.1,6.5,7.8c-2.1,4-6.4,6.7-11.3,6.7c-7,0-12.7-5.7-12.7-12.7c0-6.1,4.3-11.2,10-12.4v-0.1c-5.7-1.2-10-6.3-10-12.4C15.4,30.7,21.1,25,28.1,25c4.9,0,9.2,2.7,11.3,6.7c-3.7,0.7-6.5,3.9-6.5,7.8C32.9,44,36.5,47.6,40.9,47.6c0.4,0,0.8,0,1.2-0.1c0.1,0,0.1,0,0.2,0V61.4z" />
    <path d="M57.9,61.4V47.5c0.1,0,0.1,0,0.2,0c0.4,0,0.8-0.1,1.2-0.1c4.4,0,8-3.6,8-8s-3.6-8-8-8c-0.4,0-0.8,0-1.2,0.1v-0.1c5.7-1.2,10-6.3,10-12.4c0-7-5.7-12.7-12.7-12.7c-4.9,0-9.2,2.7-11.3,6.7c3.7,0.7,6.5,3.9,6.5,7.8c0,4.4-3.6,8-8,8c-0.4,0-0.8-0.1-1.2-0.1v13.9c0.4,0,0.8,0.1,1.2,0.1c4.4,0,8,3.6,8,8s-3.6,8-8,8c-0.4,0-0.8,0-1.2-0.1c2.1,4,6.4,6.7,11.3,6.7c7,0,12.7-5.7,12.7-12.7C70.6,67.7,66.3,62.6,60.6,61.4v-0.1C60.1,61.3,59,61.4,57.9,61.4z" />
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
