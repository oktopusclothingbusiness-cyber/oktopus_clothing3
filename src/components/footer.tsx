
import Link from "next/link";
import { Button } from "./ui/button";
import { Github, Twitter, Instagram } from "lucide-react";
import * as React from 'react';
import Image from "next/image";

export function Footer() {
  const [logoUrl, setLogoUrl] = React.useState('');

  React.useEffect(() => {
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                setLogoUrl(data.logoUrl || '');
            }
        } catch (error) {
            console.error("Failed to fetch settings for footer logo:", error);
        }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            {logoUrl ? (
                <Image src={logoUrl} alt="Site Logo" width={140} height={40} className="object-contain mb-4" />
            ) : (
                <h3 className="font-bold mb-4 h-10"></h3>
            )}
            <p className="text-sm text-muted-foreground">Style meets expression.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-primary">All Products</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">New Arrivals</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
              <li><Link href="/return-policy" className="text-sm text-muted-foreground hover:text-primary">Return Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex items-center gap-2">
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
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
