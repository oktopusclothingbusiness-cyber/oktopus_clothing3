export interface PolicySection {
  id: string;
  title: string;
  content: string[];
  subsections?: {
    subtitle: string;
    points: string[];
  }[];
}

export interface PolicyDocument {
  id: string;
  slug: string;
  title: string;
  badge: string;
  lastUpdated: string;
  shortDescription: string;
  sections: PolicySection[];
}

export const POLICIES_DATA: Record<string, PolicyDocument> = {
  'terms-and-conditions': {
    id: 'terms-and-conditions',
    slug: 'terms-and-conditions',
    title: 'Terms and Conditions',
    badge: 'Website and Mobile App Policy',
    lastUpdated: 'September 2026',
    shortDescription: 'These Terms and Conditions govern your access to and purchases made through the Oktopus Clothing Website and Mobile Application.',
    sections: [
      {
        id: 'general-acceptance',
        title: '1. General and Acceptance of Terms',
        content: [
          'Welcome to Oktopus Clothing. These Terms and Conditions constitute a legally binding agreement between you ("Customer", "User", or "You") and Oktopus Clothing ("Company", "We", "Us", or "Our").',
          'These terms apply to all visitors, registered users, and customers accessing or using the Oktopus Clothing Official Website (www.oktopusclothing.in) and the Oktopus Mobile Application (iOS, Android, and Expo builds).',
          'By accessing our platforms, browsing products, registering an account, or placing an order, you expressly acknowledge that you have read, understood, and agreed to be legally bound by these Terms and Conditions, as well as our Return and Refund Policy, Shipping Policy, and Privacy Policy. Placing an order from our website or mobile application serves as your explicit electronic signature and confirmation that you accept all terms, policies, and conditions outlined herein without reservation.',
          'If you do not agree to these terms, you must discontinue using our website and mobile application immediately.',
        ],
      },
      {
        id: 'eligibility-account',
        title: '2. User Eligibility and Account Security',
        content: [
          'Services and purchases on our website and mobile application are available only to individuals who can form legally binding contracts under the Indian Contract Act, 1872.',
          'When registering an account or placing an order, you agree to provide true, accurate, current, and complete information regarding your name, mobile number, email address, and shipping destination.',
          'You are solely responsible for maintaining the confidentiality of your account credentials, login OTPs, and mobile authentication sessions. Oktopus Clothing will not be held liable for any loss or damage arising from unauthorized access to your account.',
        ],
      },
      {
        id: 'products-customization',
        title: '3. Products, Pricing, and Custom Apparel',
        content: [
          'All product prices, shipping fees, and discounts on our website and mobile application are quoted in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.',
          'We reserve the right to modify prices, discontinue products, or adjust promotional offers at any time without prior notice.',
          'Oktopus Clothing specializes in high-quality graphic apparel, streetwear, and customized made-to-order items. For custom orders, you are solely responsible for providing accurate design specifications, sizing, and personalization inputs.',
          'We are not responsible for sizing errors, spelling mistakes, or low-resolution artwork submitted by the customer. Please review the official size chart prior to confirming your purchase.',
        ],
      },
      {
        id: 'orders-cancellation',
        title: '4. Order Confirmation and Cancellation Policy',
        content: [
          'All orders placed through our website or mobile application are subject to acceptance and fulfillment verification by Oktopus Clothing.',
          'Payment must be successfully completed through our authorized payment gateways (Razorpay, UPI, credit/debit cards) or recorded offline counters before order processing commences.',
          'Order Cancellation is available strictly before the order has been accepted or confirmed by our fulfillment team. Once an order is accepted and moves into production or packaging, cancellation is strictly unavailable through the website or mobile application.',
          'No cancellation requests will be entertained once the order is accepted until and unless Oktopus Clothing management explicitly decides, at its sole discretion, to grant a cancellation under exceptional circumstances.',
        ],
      },
      {
        id: 'intellectual-property',
        title: '5. Intellectual Property and Content Ownership',
        content: [
          'All content published on our website and mobile application, including graphics, banners, apparel artwork, product photographs, videos, software code, UI interfaces, and brand names, is the exclusive intellectual property of Oktopus Clothing and protected under copyright, trademark, and applicable intellectual property laws.',
          'By uploading custom artwork or designs to our platform for printing, you represent and warrant that you hold all necessary ownership rights, licenses, or permissions, and grant Oktopus Clothing a non-exclusive license to reproduce the design solely to fulfill your order.',
        ],
      },
      {
        id: 'liability-governing-law',
        title: '6. Limitation of Liability and Governing Law',
        content: [
          'To the maximum extent permitted by applicable law, Oktopus Clothing and its affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use our website, mobile application, or purchased products.',
          'These Terms and Conditions shall be governed by, construed, and enforced in accordance with the laws of India.',
          'Any dispute, controversy, or claim arising out of or relating to these terms, our website, or mobile application shall be subject to the exclusive jurisdiction of the competent courts located in Kolkata, West Bengal, India.',
        ],
      },
    ],
  },

  'return-policy': {
    id: 'return-policy',
    slug: 'return-policy',
    title: 'Return, Refund and Cancellation Policy',
    badge: 'Website and Mobile App Policy',
    lastUpdated: 'September 2026',
    shortDescription: 'Clear, transparent rules regarding returns, replacements, refunds, and order cancellations for our custom and streetwear collections.',
    sections: [
      {
        id: 'overview',
        title: '1. Policy Overview and Custom Apparel Notice',
        content: [
          'At Oktopus Clothing, every apparel item is crafted, printed, and inspected with meticulous attention to detail. Because the majority of our catalog consists of customized, personalized, and made-to-order garments, we operate under a strict, transparent return and refund framework.',
          'This policy applies uniformly to all orders placed through the Oktopus Clothing Website (www.oktopusclothing.in) and the Oktopus Mobile Application.',
          'By placing an order on our website or mobile application, you explicitly acknowledge and agree to the return, refund, and cancellation terms stated below.',
        ],
      },
      {
        id: 'refund-eligibility',
        title: '2. Refund and Replacement Eligibility',
        content: [
          'A refund or product replacement is eligible strictly and only when it is our fault (such as a verified manufacturing defect or transit damage) or when a completely wrong product was sent. In all valid cases, a free replacement is offered first. If a replacement cannot be produced, a full refund will be granted.',
        ],
        subsections: [
          {
            subtitle: 'A. Company Fault / Manufacturing Defect',
            points: [
              'The product has a verified physical or structural manufacturing defect (such as broken stitching, fabric tears, or severe print misprints) present at the time of delivery.',
              'Normal variations in color tone due to screen monitor calibration do not constitute a defect.',
            ],
          },
          {
            subtitle: 'B. Completely Wrong Product Sent',
            points: [
              'An entirely different product, incorrect design, wrong size, or wrong color was dispatched against what was confirmed on your invoice.',
            ],
          },
          {
            subtitle: 'C. Verified Transit Damage',
            points: [
              'The package arrived severely damaged or crushed in transit, directly affecting the product inside.',
            ],
          },
        ],
      },
      {
        id: 'unboxing-video-requirement',
        title: '3. Mandatory Unboxing Video Requirement',
        content: [
          'To ensure fair evaluation and prevent fraudulent claims, an uncut unboxing video is strictly mandatory for any claim regarding damaged goods, manufacturing defects, or wrong items delivered.',
          'The unboxing video must satisfy the following criteria:',
          '1. The recording must begin before the courier package is opened, clearly displaying the shipping label and tracking number.',
          '2. The video must be continuous and uncut, with no pauses, splices, or edits from the opening of the outer envelope to the full inspection of the garment.',
          '3. The specific defect or discrepancy must be clearly visible on camera.',
          'Claims submitted without a qualifying unboxing video within 24 to 48 hours of delivery cannot be approved under any circumstances.',
        ],
      },
      {
        id: 'cancellation-terms',
        title: '4. Order Cancellation Policy',
        content: [
          'Order cancellation is available strictly and exclusively before the order is accepted or confirmed by our fulfillment team.',
          'Once our team confirms the order and initiates fabric allocation, printing, or packaging, the order cannot be cancelled through the mobile app or website.',
          'No cancellation requests will be accepted after the order has been confirmed, unless Oktopus Clothing management decides at its sole discretion to grant a cancellation under exceptional circumstances.',
          'If an order is cancelled while still in the pending status prior to acceptance, a 100% refund will be issued to the original payment source.',
        ],
      },
      {
        id: 'non-refundable-situations',
        title: '5. Non-Refundable Situations',
        content: [
          'Refunds and replacements will strictly not be granted under the following circumstances:',
          '1. Sizing errors made by the customer (please review our detailed Size Chart before placing your order).',
          '2. Change of mind after the order has been confirmed or delivered.',
          '3. Products that have been worn, washed, perfume-sprayed, altered, or damaged by the customer.',
          '4. Garments returned without original tags, labels, and packaging intact.',
          '5. Orders delivered to an incorrect or incomplete delivery address provided by the customer.',
        ],
      },
      {
        id: 'refund-process-timelines',
        title: '6. Refund Processing and Timelines',
        content: [
          'To file a legitimate claim for a damaged or wrong item, email our support team at oktopusclothing.business@gmail.com or WhatsApp us at +91 62913 37506 within 48 hours of delivery.',
          'Include your Order ID, registered phone number, a detailed description of the issue, and the mandatory uncut unboxing video.',
          'Once verified and approved by our quality control team, refunds are processed back to the original payment method (Bank Account, UPI, or Card) within 5 to 7 business days.',
        ],
      },
    ],
  },

  'shipping-policy': {
    id: 'shipping-policy',
    slug: 'shipping-policy',
    title: 'Shipping and Delivery Policy',
    badge: 'Website and Mobile App Policy',
    lastUpdated: 'September 2026',
    shortDescription: 'Comprehensive details on dispatch schedules, delivery timelines, shipping rates, and live courier tracking across India.',
    sections: [
      {
        id: 'processing-production',
        title: '1. Order Processing and Production Timelines',
        content: [
          'All orders placed through the Oktopus Clothing Website and Mobile App are scheduled for fulfillment upon successful payment verification.',
          'Because our apparel features high-definition custom prints and tailored fits, orders typically undergo a 2 to 4 business day production cycle before dispatch.',
          'Orders placed on Sundays or official national holidays are queued for production on the next working day.',
        ],
      },
      {
        id: 'shipping-timelines',
        title: '2. Shipping and Delivery Timelines',
        content: [
          'Once your order has been crafted, quality-inspected, and handed over to our courier partners, expected transit times are as follows. Delivery timelines are estimates provided by logistics partners; weather disruptions, regional holidays, or transport restrictions may cause minor variations.',
        ],
        subsections: [
          {
            subtitle: 'Metro Cities and Urban Hubs',
            points: [
              'Estimated delivery within 4 to 6 business days from dispatch date.',
            ],
          },
          {
            subtitle: 'Rest of India (Tier 2 and Tier 3 Cities)',
            points: [
              'Estimated delivery within 5 to 8 business days from dispatch date.',
            ],
          },
          {
            subtitle: 'Special and Remote Pin Codes (North East, J&K, Island Territories)',
            points: [
              'Estimated delivery within 8 to 14 business days from dispatch date.',
            ],
          },
        ],
      },
      {
        id: 'shipping-charges',
        title: '3. Shipping Rates and Free Delivery Promotions',
        content: [
          'Shipping charges are calculated dynamically at checkout on our website and mobile application based on the total order weight and destination postal code.',
          'Promotional Free Shipping applies automatically when an order meets or exceeds the active cart threshold announced on our website and app.',
          'All shipping rates are displayed transparently in Indian Rupees (INR) prior to final payment authorization.',
        ],
      },
      {
        id: 'tracking-orders',
        title: '4. Live Order Tracking',
        content: [
          'As soon as your shipment is picked up by our logistics partner, an automated dispatch notification with an active AWB tracking number is sent to your registered mobile number, WhatsApp, and email address.',
          'You can also monitor live courier movement directly through the "My Orders" tab on the Oktopus Mobile App or via the Track Order portal on our website.',
        ],
      },
      {
        id: 'delivery-attempts-address',
        title: '5. Delivery Attempts and Undeliverable Parcels',
        content: [
          'Our courier partners make up to three (3) delivery attempts before marking a shipment as Return to Origin (RTO).',
          'Customers are strictly required to provide an accurate shipping address with complete street details, nearby landmark, and a functioning contact number.',
          'If a package is returned to our facility due to incorrect address information, customer unavailability, or refused delivery, re-dispatch charges will be billed to the customer.',
        ],
      },
    ],
  },

  'privacy-policy': {
    id: 'privacy-policy',
    slug: 'privacy-policy',
    title: 'Privacy and Data Protection Policy',
    badge: 'Website and Mobile App Policy',
    lastUpdated: 'September 2026',
    shortDescription: 'How Oktopus Clothing collects, uses, protects, and handles personal data across our official website and mobile application.',
    sections: [
      {
        id: 'introduction',
        title: '1. Introduction and Scope',
        content: [
          'Oktopus Clothing ("Company", "We", "Us") respects your privacy and is committed to protecting the personal information you share with us.',
          'This Privacy Policy describes the collection, use, disclosure, and safeguarding of information gathered through our website (www.oktopusclothing.in), the Oktopus Mobile Application, and our customer support communication channels.',
          'By accessing our website, installing the mobile application, or purchasing items, you consent to the data practices described in this Privacy Policy.',
        ],
      },
      {
        id: 'information-we-collect',
        title: '2. Information We Collect',
        content: [
          'We collect information necessary to fulfill your orders and enhance your browsing experience across web and mobile platforms:',
        ],
        subsections: [
          {
            subtitle: 'A. Personal and Contact Information',
            points: [
              'Full name, primary mobile number, email address, delivery address, and billing details.',
              'Profile details when signing in via Firebase Phone Authentication.',
            ],
          },
          {
            subtitle: 'B. Order and Customization Data',
            points: [
              'Product orders, selected apparel sizes, transaction histories, and custom artwork or images uploaded for personalized printing.',
            ],
          },
          {
            subtitle: 'C. Mobile Device and Usage Information',
            points: [
              'Device model, operating system version, IP address, and essential session identifiers required for cart persistence and secure checkout.',
              'Push notification device tokens (optional) for sending order status and delivery updates.',
            ],
          },
        ],
      },
      {
        id: 'how-we-use-information',
        title: '3. How We Use Your Information',
        content: [
          'Your information is used strictly for legitimate business operations:',
          '1. To process, produce, package, and deliver your orders.',
          '2. To send order confirmations, dispatch tracking links, and delivery notifications.',
          '3. To manage your Oktocoins rewards balance and redeem discount coupons.',
          '4. To provide responsive customer support and resolve product or logistics queries.',
          '5. To prevent fraudulent transactions and safeguard the security of our platform.',
        ],
      },
      {
        id: 'data-sharing-disclosure',
        title: '4. Information Sharing and Disclosure',
        content: [
          'Oktopus Clothing does not sell, rent, or lease your personal information to third parties.',
          'We share information exclusively with verified service providers necessary to operate our business:',
          '1. Certified Payment Gateways (e.g., Razorpay) to securely process your electronic payments.',
          '2. Reputable Logistics and Courier Partners (e.g., Shiprocket, Delhivery) to deliver packages to your doorstep.',
          '3. Cloud and Authentication Providers (e.g., Firebase, Cloudinary) to host data and manage secure OTP logins.',
          'All third-party partners are bound by strict confidentiality and data protection obligations.',
        ],
      },
      {
        id: 'data-security',
        title: '5. Data Security and Retention',
        content: [
          'We implement industry-standard administrative, technical, and physical safeguards to protect your personal information against unauthorized access, destruction, or alteration.',
          'All web and mobile API communications are secured with high-grade SSL/TLS encryption.',
          'We retain personal data only for as long as necessary to fulfill order requirements, comply with statutory tax and accounting regulations, and resolve legal disputes.',
        ],
      },
      {
        id: 'user-rights',
        title: '6. Your Rights and Contact Information',
        content: [
          'You have the right to access, update, or correct your personal information by viewing your profile on our website or mobile app.',
          'You may request account deletion or data removal by contacting our privacy compliance team.',
          'For any privacy-related inquiries, reach out to us at oktopusclothing.business@gmail.com.',
        ],
      },
    ],
  },
};

export const POLICY_CONTACT_INFO = {
  companyName: 'Oktopus Clothing',
  website: 'https://www.oktopusclothing.in',
  email: 'oktopusclothing.business@gmail.com',
  phone: '+91 62913 37506',
  address: 'Kolkata, West Bengal, India',
  hours: 'Monday to Saturday, 10:00 AM - 7:00 PM IST',
};
