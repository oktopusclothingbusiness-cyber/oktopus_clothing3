import Link from 'next/link';
import Image from 'next/image';
import { generateNotFoundImage } from '@/ai/flows/not-found-image-flow';

const NotFoundPage = async () => {
  const { url: imageUrl } = await generateNotFoundImage();

  const EarthIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54" />
      <path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h3.17" />
      <path d="M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#EAE3D9] p-4 font-body">
      <div className="w-full max-w-5xl bg-black rounded-xl shadow-2xl overflow-hidden aspect-[4/3] relative text-white/90 flex flex-col">
        <Image
          src={imageUrl || 'https://placehold.co/1200x900.png'}
          alt="A person at a computer in a vast landscape, signifying a page not found."
          layout="fill"
          objectFit="cover"
          className="opacity-50"
          data-ai-hint="futuristic landscape"
        />

        <div className="relative flex flex-col h-full p-8">
          {/* Header */}
          <header className="flex justify-between items-center w-full">
            <EarthIcon className="w-8 h-8 text-white/70" />
            <div className="font-headline text-8xl md:text-9xl font-bold text-white/20 tracking-widest">
              404
            </div>
          </header>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* Footer */}
          <footer className="w-full space-y-4">
            <p className="text-lg md:text-xl text-white/80 max-w-lg">
              We&apos;re sorry. We can&apos;t connect to the outer reaches of the
              web right now.
            </p>
            <div className="flex justify-between items-center text-sm text-white/60">
              <span className="font-mono text-xs">sukoya.design</span>
              <div className="flex gap-4 items-center">
                <Link href="/" className="hover:text-white transition-colors">
                  Head home
                </Link>
                <span>or</span>
                <span className="cursor-default">enjoy the view?</span>
              </div>
              <span className="hidden md:block">web • product • brand</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
