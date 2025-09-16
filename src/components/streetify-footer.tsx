
import Link from "next/link";
import { Button } from "./ui/button";
import { Github, Twitter, Instagram } from "lucide-react";
import { Input } from "./ui/input";

export function StreetifyFooter() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4 font-serif">STREEILFY</h3>
            <p className="text-sm text-neutral-400">Dive into a world of endless fashion possibilities.</p>
            <div className="flex items-center gap-2 mt-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="#" target="_blank" aria-label="GitHub">
                        <Github className="h-5 w-5" />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                    <Link href="#" target="_blank" aria-label="Twitter">
                        <Twitter className="h-5 w-5" />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                    <Link href="#" target="_blank" aria-label="Instagram">
                        <Instagram className="h-5 w-5" />
                    </Link>
                </Button>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 font-serif">COMPANY</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-neutral-400 hover:text-primary">About</Link></li>
              <li><Link href="/contact" className="text-sm text-neutral-400 hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 font-serif">SHOP</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-sm text-neutral-400 hover:text-primary">New Arrivals</Link></li>
              <li><Link href="/products" className="text-sm text-neutral-400 hover:text-primary">Men</Link></li>
              <li><Link href="/products" className="text-sm text-neutral-400 hover:text-primary">Women</Link></li>
            </ul>
          </div>
           <div>
            <h3 className="font-semibold mb-4 font-serif">JOIN OUR NEWSLETTER</h3>
            <p className="text-sm text-neutral-400 mb-4">Get E-mail updates about our latest shop and special offers.</p>
            <form className="flex gap-2">
                <Input type="email" placeholder="Enter your email" className="bg-neutral-900 border-neutral-700 rounded-full" />
                <Button type="submit" className="bg-primary text-black hover:bg-primary/90 rounded-full">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
          <p>Copyright © 2025 Streeilfy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
