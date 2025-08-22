import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eyewear1 } from '@/components/icons/eyewear-1';
import { Eyewear2 } from '@/components/icons/eyewear-2';
import { Eyewear3 } from '@/components/icons/eyewear-3';
import { Eyewear4 } from '@/components/icons/eyewear-4';
import { Eyewear5 } from '@/components/icons/eyewear-5';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 overflow-hidden">
      <div className="relative w-full max-w-4xl h-[400px] md:h-[600px] mb-8">
        <Eyewear1 className="absolute w-32 h-48 md:w-48 md:h-64 top-[20%] left-[5%] transform -rotate-12 rounded-lg" />
        <Eyewear2 className="absolute w-32 h-48 md:w-48 md:h-64 top-[50%] left-[20%] transform rotate-6 rounded-lg" />
        <Eyewear3 className="absolute w-32 h-48 md:w-48 md:h-64 top-[10%] left-[50%] transform -translate-x-1/2 rounded-lg" />
        <Eyewear4 className="absolute w-32 h-48 md:w-48 md:h-64 top-[50%] right-[20%] transform -rotate-6 rounded-lg" />
        <Eyewear5 className="absolute w-32 h-48 md:w-48 md:h-64 top-[20%] right-[5%] transform rotate-12 rounded-lg" />
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
