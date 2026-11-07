import type { Metadata } from 'next';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oktopusclothing.in';

  try {
    const client = await clientPromise;
    const db = client.db();

    const query: any = { $or: [{ id: id }, { slug: id }] };
    if (ObjectId.isValid(id)) {
      query.$or.unshift({ _id: new ObjectId(id) });
    }

    const product = await db.collection('products').findOne(query);

    if (!product) {
      return {
        title: 'Product Details',
        description: 'Discover premium oversized streetwear and graphic t-shirts at Oktopus Clothing.',
      };
    }

    const title = `${product.name} | Oversized T-Shirt`;
    const description = product.description
      ? product.description.slice(0, 160)
      : `Buy ${product.name} online at ₹${product.price} from Oktopus Clothing. 100% premium cotton, drop-shoulder oversized fit, breathable graphic apparel with fast delivery across India.`;
    const image = product.images?.[0] || 'https://www.oktopusclothing.in/logo2b.png';
    const productUrl = `${siteUrl}/products/${id}`;

    return {
      title,
      description,
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: productUrl,
        siteName: 'Oktopus Clothing',
        title: `${product.name} | Oktopus Clothing`,
        description,
        images: [
          {
            url: image,
            width: 800,
            height: 800,
            alt: `${product.name} - Oktopus Clothing`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | Oktopus Clothing`,
        description,
        images: [image],
      },
      other: {
        'product:price:amount': String(product.price || 0),
        'product:price:currency': 'INR',
        'product:availability': (product.stock ?? 1) > 0 ? 'in stock' : 'out of stock',
      },
    };
  } catch (error) {
    console.error('Failed to generate product metadata:', error);
    return {
      title: 'Premium Streetwear Product',
      description: 'Discover premium oversized streetwear and graphic t-shirts at Oktopus Clothing.',
    };
  }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.oktopusclothing.in';

  let productSchema: any = null;
  let breadcrumbSchema: any = null;

  try {
    const client = await clientPromise;
    const db = client.db();

    const query: any = { $or: [{ id: id }, { slug: id }] };
    if (ObjectId.isValid(id)) {
      query.$or.unshift({ _id: new ObjectId(id) });
    }

    const product = await db.collection('products').findOne(query);

    if (product) {
      const productUrl = `${siteUrl}/products/${id}`;
      const image = product.images?.[0] || `${siteUrl}/logo2b.png`;

      productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images : [image],
        description:
          product.description ||
          `Premium oversized ${product.name} crafted with 100% combed cotton by Oktopus Clothing.`,
        sku: product._id.toString(),
        brand: {
          '@type': 'Brand',
          name: 'Oktopus Clothing',
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'INR',
          price: product.price || 0,
          availability:
            (product.stock ?? 1) > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'Oktopus Clothing',
          },
        },
      };

      breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Store',
            item: `${siteUrl}/store`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: productUrl,
          },
        ],
      };
    }
  } catch {
    // fail gracefully
  }

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      {children}
    </>
  );
}

