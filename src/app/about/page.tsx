
'use client';

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileHeader } from "@/components/mobile-header";
import { MobileFooter } from "@/components/mobile-footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Quote } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to OKTOPUS CLOTHING</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Where creativity meets individuality.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-muted-foreground mb-4">We believe fashion is more than just clothing—it’s an expression of who you are. That’s why we specialize in customized apparel, giving you the freedom to bring your vision to life. Every design we create is unique, just like the people who wear them.</p>
                <p className="text-muted-foreground">At OKTOPUS CLOTHING, we don’t believe in “one-size-fits-all.” Instead, we craft each piece with attention to detail, premium quality fabrics, and a deep passion for originality. From concept to creation, our goal is to deliver clothing that feels personal, authentic, and unforgettable.</p>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden">
                 <Image src="https://picsum.photos/600/800" alt="Fashion workshop" layout="fill" objectFit="cover" data-ai-hint="fashion workshop" />
            </div>
          </div>
          
          <Card className="bg-secondary border-none mb-16">
            <CardContent className="p-10 flex flex-col items-center text-center">
                <Quote className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold">Our Mission</h3>
                <p className="text-muted-foreground mt-2 max-w-2xl">To empower individuals to express themselves through personalized fashion, blending creativity, comfort, and quality in every product we make.</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-8 text-center mb-16">
              <div>
                  <h4 className="text-xl font-bold mb-2">Customization First</h4>
                  <p className="text-muted-foreground">Your design, your style, your way.</p>
              </div>
               <div>
                  <h4 className="text-xl font-bold mb-2">Quality Materials</h4>
                  <p className="text-muted-foreground">We prioritize durability and comfort in every stitch.</p>
              </div>
               <div>
                  <h4 className="text-xl font-bold mb-2">Made for You</h4>
                  <p className="text-muted-foreground">Each product is crafted with care, ensuring a truly unique piece.</p>
              </div>
          </div>
          
          <div className="bg-primary text-primary-foreground rounded-lg p-10 flex flex-col items-center text-center">
             <h2 className="text-3xl font-bold mb-4">The Story Behind OKTOPUS</h2>
             <p className="max-w-3xl mb-4">Like the octopus—known for its adaptability and creativity—we embrace versatility and innovation in fashion. Just as each arm of an octopus works independently yet harmoniously, we blend art, style, and individuality to create something truly special for our customers.</p>
             <p className="max-w-3xl font-semibold">At OKTOPUS CLOTHING, we’re not just selling clothes—we’re building a movement of self-expression, creativity, and identity. Your style tells your story. Let’s make it unforgettable.</p>
          </div>

        </main>
        <Footer />
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileHeader title="About Us" />
        <main className="bg-secondary min-h-screen pb-24 p-4">
          <Card className="card-glass mb-4">
             <CardContent className="p-6">
                <h1 className="text-2xl font-bold text-center mb-4">Welcome to OKTOPUS CLOTHING</h1>
                <p className="text-sm text-center text-muted-foreground">We believe fashion is more than just clothing—it’s an expression of who you are. That’s why we specialize in customized apparel, giving you the freedom to bring your vision to life.</p>
             </CardContent>
          </Card>
           <Card className="card-glass mb-4">
             <CardHeader>
                <CardTitle className="text-xl">Our Mission</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">To empower individuals to express themselves through personalized fashion, blending creativity, comfort, and quality in every product we make.</p>
             </CardContent>
          </Card>
           <Card className="card-glass mb-4">
             <CardHeader>
                <CardTitle className="text-xl">Why Choose Us?</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div>
                  <h4 className="font-bold">Customization First</h4>
                  <p className="text-sm text-muted-foreground">Your design, your style, your way.</p>
                </div>
                 <div>
                  <h4 className="font-bold">Quality Materials</h4>
                  <p className="text-sm text-muted-foreground">We prioritize durability and comfort in every stitch.</p>
                </div>
                 <div>
                  <h4 className="font-bold">Made for You</h4>
                  <p className="text-sm text-muted-foreground">Each product is crafted with care, ensuring a truly unique piece.</p>
                </div>
             </CardContent>
          </Card>
          <Card className="card-glass">
             <CardHeader>
                <CardTitle className="text-xl">The Story Behind OKTOPUS</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Like the octopus—known for its adaptability and creativity—we embrace versatility and innovation in fashion. Just as each arm of an octopus works independently yet harmoniously, we blend art, style, and individuality to create something truly special for our customers.</p>
                <p className="text-sm text-muted-foreground font-semibold">Your style tells your story. Let’s make it unforgettable.</p>
             </CardContent>
          </Card>
        </main>
        <MobileFooter />
      </div>
    </>
  );
}
