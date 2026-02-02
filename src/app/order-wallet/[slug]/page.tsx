// NO "use client" here - this is a server component
import { Metadata } from 'next';
import data1 from "@/app/components/dummy-data/pre_order_data.json";
import ProductPageClient from '@/app/components/client/order-wallet/product_page';

// Generate metadata based on slug - params is now a Promise!
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  const item = data1.find((item) => item.slug === slug);
  
  if (!item) {
    return { 
      title: 'Product Not Found',
      description: 'The requested wallet product could not be found.'
    };
  }

  const productName = item.product_name;
  const productImages = item.product_images || [];
  const description = item.description || '';

  let title = "Buy Hardware Wallets in Nigeria | Secure Crypto Storage";
  let metaDescription = "Purchase secure hardware wallets in Nigeria. Store your cryptocurrencies safely with top-rated hardware wallets.";
  let keywords = "hardware wallet Nigeria, crypto wallet Nigeria, buy ledger Nigeria, tangem wallet Nigeria, cryptocurrency storage, secure crypto wallet";
  
  // Check product name to customize SEO
  if (productName.toLowerCase().includes("ledger")) {
    title = `Buy Ledger Hardware Wallets in Nigeria | ${productName}`;
    metaDescription = `Purchase ${productName} in Nigeria. Secure your cryptocurrencies with Ledger hardware wallets. Best prices, fast delivery across Nigeria, and 100% authentic products. Buy now for the best crypto security.`;
    keywords = `buy ledger Nigeria, ledger nano s plus Nigeria, ledger hardware wallet Nigeria, ${productName} Nigeria, cryptocurrency wallet Nigeria, crypto security Nigeria`;
  } else if (productName.toLowerCase().includes("tangem")) {
    title = `Buy Tangem hardware Wallets in Nigeria | ${productName}`;
    metaDescription = `Buy ${productName} in Nigeria. Get your Tangem hardware wallet with secure storage for cryptocurrencies. Affordable prices, reliable delivery across Nigeria, and top security features.`;
    keywords = `buy tangem wallet Nigeria, tangem wallet Nigeria, ${productName} Nigeria, hardware crypto wallet Nigeria, secure crypto storage Nigeria`;
  }

  // Structured data for the product
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    description: metaDescription,
    image: productImages[0] || "/default-image.jpg",
    offers: {
      "@type": "Offer",
      price: item.price,
      priceCurrency: "NGN",
      availability: item.outOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      seller: {
        "@type": "Organization",
        name: "Your Company Name",
      },
      areaServed: "NG",
      availableAtOrFrom: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressCountry: "NG",
        },
      },
    },
    brand: {
      "@type": "Brand",
      name: productName.includes("Ledger") ? "Ledger" : productName.includes("Tangem") ? "Tangem" : "Hardware Wallet"
    },
    category: "Electronics > Cryptocurrency Hardware Wallets",
    sku: `WALLET-${item.id}`,
    countryOfAssembly: "Nigeria",
  };

  // Breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Wallets",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: productName,
      },
    ],
  };

  return {
    title,
    description: metaDescription,
    keywords,
    openGraph: {
      title,
      description: metaDescription,
      images: [productImages[0] || '/default-image.jpg'],
      type: 'website',
      locale: 'en_NG',
      url: `/order-wallet/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      images: [productImages[0] || '/default-image.jpg'],
    },
    other: {
      'structured-data-product': JSON.stringify(structuredData),
      'structured-data-breadcrumb': JSON.stringify(breadcrumbData),
    },
  };
}

export default async function Page({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}