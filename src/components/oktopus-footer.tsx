import Link from "next/link";
import { Button } from "./ui/button";
import { Github, Twitter, Instagram } from "lucide-react";
import { Input } from "./ui/input";

export function OktopusFooter() {
  return (
    <footer className="border-t bg-white text-stone-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4 font-serif">OKTOPUS CLOTHING</h3>
            <p className="text-sm text-muted-foreground">Dive into a world of endless fashion possibilities.</p>
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
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent">About</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent">Careers</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent">Affiliates</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 font-serif">SHOP</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-accent">New Arrivals</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent">Accessories</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent">Men</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent">Women</Link></li>
            </ul>
          </div>
           <div>
            <h3 className="font-semibold mb-4 font-serif">JOIN OUR NEWSLETTER</h3>
            <p className="text-sm text-muted-foreground mb-4">Get E-mail updates about our latest shop and special offers.</p>
            <form className="flex gap-2">
                <Input type="email" placeholder="Enter your email" className="bg-gray-100 border-none rounded-full" />
                <Button type="submit" className="bg-accent text-white hover:bg-accent/90 rounded-full">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>Copyright © 2025 Oktopus Clothing. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
