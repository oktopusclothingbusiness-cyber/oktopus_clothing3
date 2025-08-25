
'use client';

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We'd love to hear from you! Whether you have a question about our products, a custom design idea, or anything else, our team is ready to answer all your questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-6 w-6" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your message..." rows={5} />
                  </div>
                  <Button type="submit" className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
            
            <div className="space-y-8">
               <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Mail className="h-6 w-6 text-primary" />
                        <div>
                            <h3 className="font-semibold">Email</h3>
                            <a href="mailto:oktopusclothing.business@gmail.com" className="text-muted-foreground hover:text-primary">
                                oktopusclothing.business@gmail.com
                            </a>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Phone className="h-6 w-6 text-primary" />
                        <div>
                            <h3 className="font-semibold">Phone</h3>
                            <a href="tel:6291337506" className="text-muted-foreground hover:text-primary">
                                +91 62913 37506
                            </a>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <MapPin className="h-6 w-6 text-primary" />
                        <div>
                            <h3 className="font-semibold">Address</h3>
                            <p className="text-muted-foreground">Kolkata, West Bengal, India</p>
                        </div>
                    </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <div className="relative h-64">
                   <Image src="https://picsum.photos/800/400" alt="Map placeholder" layout="fill" objectFit="cover" data-ai-hint="city map" />
                </div>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="Contact Us" />
        <main className="bg-secondary min-h-screen pb-24 p-4 space-y-4">
           <Card className="card-glass">
             <CardHeader>
                <CardTitle>Send a Message</CardTitle>
             </CardHeader>
             <CardContent>
               <form className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="name-mobile">Full Name</Label>
                    <Input id="name-mobile" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email-mobile">Email Address</Label>
                    <Input id="email-mobile" type="email" placeholder="you@example.com" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="message-mobile">Message</Label>
                    <Textarea id="message-mobile" placeholder="Your message..." />
                  </div>
                  <Button type="submit" className="w-full">Send</Button>
                </form>
             </CardContent>
          </Card>
           <Card className="card-glass">
             <CardHeader>
                <CardTitle>Contact Details</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <a href="mailto:oktopusclothing.business@gmail.com" className="text-sm text-muted-foreground">
                        oktopusclothing.business@gmail.com
                    </a>
                </div>
                 <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <a href="tel:6291337506" className="text-sm text-muted-foreground">
                        +91 62913 37506
                    </a>
                </div>
                 <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">Kolkata, West Bengal, India</p>
                </div>
             </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
