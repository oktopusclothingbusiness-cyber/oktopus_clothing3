import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 overflow-hidden">
      <div className="relative w-full max-w-4xl h-[400px] md:h-[600px] mb-8">
        <Image
          src="https://placehold.co/128x192.png"
          alt="Eyewear 1"
          width={128}
          height={192}
          className="absolute top-[20%] left-[5%] transform -rotate-12 rounded-lg"
          data-ai-hint="eyewear"
        />
        <Image
          src="https://placehold.co/128x192.png"
          alt="Eyewear 2"
          width={128}
          height={192}
          className="absolute top-[50%] left-[20%] transform rotate-6 rounded-lg"
          data-ai-hint="eyewear"
        />
        <Image
          src="https://placehold.co/128x192.png"
          alt="Eyewear 3"
          width={128}
          height={192}
          className="absolute top-[10%] left-[50%] transform -translate-x-1/2 rounded-lg"
          data-ai-hint="eyewear"
        />
        <Image
          src="https://placehold.co/128x192.png"
          alt="Eyewear 4"
          width={128}
          height={192}
          className="absolute top-[50%] right-[20%] transform -rotate-6 rounded-lg"
          data-ai-hint="eyewear"
        />
        <Image
          src="https://placehold.co/128x192.png"
          alt="Eyewear 5"
          width={128}
          height={192}
          className="absolute top-[20%] right-[5%] transform rotate-12 rounded-lg"
          data-ai-hint="eyewear"
        />
      </div>

      <div className="text-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">VogueVerse</h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8">
          Step into a world of style and sophistication.
        </p>
        <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-black">
          <Link href="/store">Enter Store</Link>
        </Button>
      </div>
    </div>
  );
}
