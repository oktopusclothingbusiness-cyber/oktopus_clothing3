import { NextResponse } from 'next/server';

export async function GET() {
  const aboutData = {
    brandName: "OKTOPUS CLOTHING",
    tagline: "Style meets expression.",
    subTitle: "WEAR WHAT YOU STAND FOR.",
    parentVenture: "BASKEY Studio",
    msmeDetails: "Government of India — Registered MSME",
    
    hero: {
      headline: "WEAR WHAT YOU STAND FOR.",
      subheadline: "OKTOPUS CLOTHING is an Indian fashion brand built around one simple idea: Clothing should feel like an extension of who you are.",
      intro: "We create clothing for people who don't want to disappear into the crowd. From everyday essentials to expressive designs and personalized pieces, OKTOPUS is about individuality, creativity, and the freedom to wear something that feels distinctly yours."
    },

    story: {
      title: "MORE THAN A CLOTHING BRAND.",
      content: [
        "OKTOPUS started with a belief that fashion should be personal.",
        "Not everyone sees the world the same way. Not everyone has the same taste, the same story, or the same way of expressing themselves.",
        "So why should everyone dress the same?",
        "We built OKTOPUS to create clothing that gives people another way to express their identity — through graphics, ideas, details, silhouettes, and customization.",
        "Every piece is designed with the intention of being more than something you wear. It should say something about you."
      ]
    },

    nameOrigin: {
      title: "THE STORY BEHIND THE NAME",
      metaphor: "The octopus is one of nature's most adaptable and intelligent creatures.",
      explanation: "It can change, respond, explore and evolve — using each of its arms independently while remaining part of one coordinated whole. That idea became the foundation of OKTOPUS.",
      pillars: ["Adaptability", "Creativity", "Individuality"],
      summary: "Different ideas can exist together. Different styles can coexist. And there is no single definition of what personal style should look like. OKTOPUS represents that freedom.",
      motto: "One identity. Many expressions."
    },

    baskeyStudio: {
      title: "BORN FROM BASKEY STUDIO",
      subtitle: "OKTOPUS CLOTHING is a unit of BASKEY Studio.",
      description: "OKTOPUS is part of BASKEY Studio, an Indian creative venture built around ideas, design, technology and entrepreneurship. The brand was created as a way to bring that creative mindset into fashion — turning concepts and visual ideas into products that people can actually wear.",
      mindset: "This means OKTOPUS is not built simply around selling apparel. It is built around creating, experimenting and developing a distinct identity through design.",
      ecosystem: {
        name: "BASKEY Studio",
        domain: ["Creative", "Digital", "Design", "Entrepreneurship"],
        isMSMERegistered: true,
        msmeStatus: "Government of India Registered MSME"
      },
      vision: "Independent in spirit. Indian at heart. Built for the long term."
    },

    beliefs: [
      {
        id: "individuality",
        title: "INDIVIDUALITY OVER CONFORMITY",
        description: "Your clothes are part of your identity. We create pieces that give you room to express it."
      },
      {
        id: "creativity",
        title: "CREATIVITY WITHOUT LIMITS",
        description: "Ideas don't have to fit into a predefined category. We experiment with graphics, concepts, styles and custom designs."
      },
      {
        id: "quality",
        title: "QUALITY THAT EARNS ITS PLACE",
        description: "Good design means little if the product doesn't feel good to wear. We focus on materials, construction, comfort and finishing."
      },
      {
        id: "personalization",
        title: "PERSONALIZATION MATTERS",
        description: "A piece becomes more meaningful when it feels like it belongs to you. That's why customization is an important part of the OKTOPUS experience."
      },
      {
        id: "evolution",
        title: "ALWAYS EVOLVING",
        description: "Fashion changes. People change. Ideas change. OKTOPUS is designed to evolve with them."
      }
    ],

    journey: {
      title: "FROM AN IDEA TO SOMETHING YOU CAN WEAR",
      description: "Every OKTOPUS piece begins with an idea. That idea goes through design, refinement and production before it becomes something physical.",
      steps: [
        { step: 1, name: "IDEA", label: "Concept & Inspiration" },
        { step: 2, name: "DESIGN", label: "Visual Art & Details" },
        { step: 3, name: "CREATE", label: "Precision Craftsmanship" },
        { step: 4, name: "WEAR", label: "Your Unique Identity" }
      ],
      footnote: "We care about the entire journey — not just the final product. Because the difference between an ordinary piece of clothing and something you actually connect with is often in the thought behind it."
    },

    mission: {
      title: "OUR MISSION",
      content: "To build a fashion brand that gives people the freedom to express themselves through clothing — combining design, individuality, comfort and quality in everything we create. We want OKTOPUS to become a space where different ideas, styles and identities can exist together."
    },

    future: {
      title: "WHERE WE ARE GOING",
      content: "OKTOPUS is still at the beginning of its journey. Our ambition is bigger than building an online clothing store. We want to build a recognizable Indian fashion brand with its own visual language, community and culture. A brand that can evolve from apparel into a broader creative platform — while staying rooted in the principle that started everything: Your identity is yours. Your style should be too."
    },

    closing: {
      motto: "THIS IS OKTOPUS.",
      tagline: "Not made for everyone. Made for people who want to express something.",
      manifesto: ["Wear your ideas.", "Wear your identity.", "Wear what feels like you."],
      signature: "OKTOPUS CLOTHING — Style meets expression.",
      unitCredit: "A Unit of BASKEY Studio (Government of India — Registered MSME)"
    }
  };

  return NextResponse.json(aboutData, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
