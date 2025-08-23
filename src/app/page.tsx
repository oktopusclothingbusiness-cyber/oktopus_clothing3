

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';
import { MobileFooter } from '@/components/mobile-footer';

export default function LandingPage() {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen bg-black text-white">
        <div className="flex flex-col items-center justify-center flex-grow p-4 overflow-hidden">
          
          <div className="flex-1 flex flex-col justify-center items-center w-full">
              <Image 
                src="https://i.ibb.co/GfTs981G/okto-new-logo-white.png"
                alt="Logo placeholder"
                width={144}
                height={64}
                className="mb-8"
                data-ai-hint="logo"
              />
              
              <div className="relative w-full h-[300px] md:h-[500px] flex items-center justify-center mb-12">
                <Image
                  src="https://i.ibb.co/PsgRHxCN/pic-1.png"
                  alt="Eyewear 2"
                  width={180}
                  height={240}
                  className="absolute top-1/2 left-[calc(50%-140px)] md:left-[calc(50%-320px)] -translate-y-1/2 transform -rotate-12 rounded-2xl shadow-lg w-[90px] h-[120px] md:w-[180px] md:h-[240px] transition-transform duration-300 ease-in-out hover:scale-110"
                  data-ai-hint="eyewear fashion"
                />
                <Image
                  src="https://placehold.co/300x400.png"
                  alt="Eyewear 1"
                  width={210}
                  height={280}
                  className="absolute top-1/2 left-[calc(50%-85px)] md:left-[calc(50%-200px)] -translate-y-1/2 transform -rotate-6 rounded-2xl shadow-2xl z-10 w-[105px] h-[140px] md:w-[210px] md:h-[280px] transition-transform duration-300 ease-in-out hover:scale-110"
                  data-ai-hint="eyewear fashion"
                />
                <Image
                  src="https://i.ibb.co/k23QM5vt/pic-1.png"
                  alt="Eyewear 3"
                  width={240}
                  height={320}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl z-20 w-[120px] h-[160px] md:w-[240px] md:h-[320px] transition-transform duration-300 ease-in-out hover:scale-110"
                  data-ai-hint="eyewear fashion"
                />
                 <Image
                  src="https://placehold.co/300x400.png"
                  alt="Eyewear 4"
                  width={210}
                  height={280}
                  className="absolute top-1/2 right-[calc(50%-85px)] md:right-[calc(50%-200px)] -translate-y-1/2 transform rotate-6 rounded-2xl shadow-2xl z-10 w-[105px] h-[140px] md:w-[210px] md:h-[280px] transition-transform duration-300 ease-in-out hover:scale-110"
                  data-ai-hint="eyewear fashion"
                />
                <Image
                  src="https://placehold.co/300x400.png"
                  alt="Eyewear 5"
                  width={180}
                  height={240}
                  className="absolute top-1/2 right-[calc(50%-140px)] md:right-[calc(50%-320px)] -translate-y-1/2 transform rotate-12 rounded-2xl shadow-lg w-[90px] h-[120px] md:w-[180px] md:h-[240px] transition-transform duration-300 ease-in-out hover:scale-110"
                  data-ai-hint="eyewear fashion"
                />
              </div>
      
              <div className="text-center z-30">
                <h1 className="text-4xl md:text-6xl font-semibold mb-8">T-Shirts That Stands Out!</h1>
                <Button asChild size="lg" className="bg-white text-black rounded-full hover:bg-gray-200">
                  <Link href="/store">Enter Store <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col min-h-screen bg-black text-white">
        <main className="flex flex-col items-center justify-center flex-grow p-4 overflow-hidden">
          <div className="flex-1 flex flex-col justify-center items-center w-full">
            <Image 
                src="https://i.ibb.co/GfTs981G/okto-new-logo-white.png"
                alt="Logo placeholder"
                width={144}
                height={64}
                className="mb-8"
                data-ai-hint="logo"
              />
              <div className="relative w-full h-[300px] md:h-[500px] flex items-center justify-center mb-12">
                  <Image
                    src="https://i.ibb.co/PsgRHxCN/pic-1.png"
                    alt="Eyewear 2"
                    width={180}
                    height={240}
                    className="absolute top-1/2 left-[calc(50%-140px)] -translate-y-1/2 transform -rotate-12 rounded-2xl shadow-lg w-[90px] h-[120px] transition-transform duration-300 ease-in-out hover:scale-110"
                    data-ai-hint="eyewear fashion"
                  />
                  <Image
                    src="https://placehold.co/300x400.png"
                    alt="Eyewear 1"
                    width={210}
                    height={280}
                    className="absolute top-1/2 left-[calc(50%-85px)] -translate-y-1/2 transform -rotate-6 rounded-2xl shadow-2xl z-10 w-[105px] h-[140px] transition-transform duration-300 ease-in-out hover:scale-110"
                    data-ai-hint="eyewear fashion"
                  />
                  <Image
                    src="https://i.ibb.co/k23QM5vt/pic-1.png"
                    alt="Eyewear 3"
                    width={240}
                    height={320}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl z-20 w-[120px] h-[160px] transition-transform duration-300 ease-in-out hover:scale-110"
                    data-ai-hint="eyewear fashion"
                  />
                   <Image
                    src="https://placehold.co/300x400.png"
                    alt="Eyewear 4"
                    width={210}
                    height={280}
                    className="absolute top-1/2 right-[calc(50%-85px)] -translate-y-1/2 transform rotate-6 rounded-2xl shadow-2xl z-10 w-[105px] h-[140px] transition-transform duration-300 ease-in-out hover:scale-110"
                    data-ai-hint="eyewear fashion"
                  />
                  <Image
                    src="https://placehold.co/300x400.png"
                    alt="Eyewear 5"
                    width={180}
                    height={240}
                    className="absolute top-1/2 right-[calc(50%-140px)] -translate-y-1/2 transform rotate-12 rounded-2xl shadow-lg w-[90px] h-[120px] transition-transform duration-300 ease-in-out hover:scale-110"
                    data-ai-hint="eyewear fashion"
                  />
              </div>
              <div className="text-center z-30">
                <h1 className="text-4xl md:text-6xl font-semibold mb-8">T-Shirts That Stands Out!</h1>
                <Button asChild size="lg" className="bg-white text-black rounded-full hover:bg-gray-200">
                  <Link href="/store">Enter Store <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
          </div>
        </main>
      </div>
    </>
  );
}
