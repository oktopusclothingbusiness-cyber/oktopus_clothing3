import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Glasses } from 'lucide-react';

const GlassesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="6" cy="15" r="4" />
    <circle cx="18" cy="15" r="4" />
    <path d="M10 15h4" />
    <path d="M9.5 15a6.5 6.5 0 0 0-5.22 9.36" />
    <path d="M14.5 15a6.5 6.5 0 0 1 5.22 9.36" />
  </svg>
);


export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 overflow-hidden">
      <div className="flex flex-col items-center justify-center flex-grow">
        <GlassesIcon className="w-10 h-10 mb-8" />
        <div className="relative w-full max-w-4xl h-[300px] md:h-[450px] mb-8">
          <Image
            src="https://placehold.co/300x400.png"
            alt="Eyewear 2"
            width={180}
            height={240}
            className="absolute top-1/2 left-[calc(50%-260px)] -translate-y-1/2 transform -rotate-12 rounded-2xl shadow-lg"
            data-ai-hint="eyewear fashion"
          />
          <Image
            src="https://placehold.co/300x400.png"
            alt="Eyewear 1"
            width={210}
            height={280}
            className="absolute top-1/2 left-[calc(50%-160px)] -translate-y-1/2 transform -rotate-6 rounded-2xl shadow-2xl z-10"
            data-ai-hint="eyewear fashion"
          />
          <Image
            src="https://placehold.co/300x400.png"
            alt="Eyewear 3"
            width={240}
            height={320}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl z-20"
            data-ai-hint="eyewear fashion"
          />
           <Image
            src="https://placehold.co/300x400.png"
            alt="Eyewear 4"
            width={210}
            height={280}
            className="absolute top-1/2 right-[calc(50%-160px)] -translate-y-1/2 transform rotate-6 rounded-2xl shadow-2xl z-10"
            data-ai-hint="eyewear fashion"
          />
          <Image
            src="https://placehold.co/300x400.png"
            alt="Eyewear 5"
            width={180}
            height={240}
            className="absolute top-1/2 right-[calc(50%-260px)] -translate-y-1/2 transform rotate-12 rounded-2xl shadow-lg"
            data-ai-hint="eyewear fashion"
          />
        </div>

        <div className="text-center z-10">
          <h1 className="text-4xl md:text-5xl font-semibold mb-8">Eyewear That Stands Out</h1>
          <Button asChild size="lg" className="bg-white text-black rounded-full hover:bg-gray-200">
            <Link href="/store">Enter Store <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}