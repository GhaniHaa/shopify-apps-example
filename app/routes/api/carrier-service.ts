// routes/api/carrier-service.ts

import { LoaderFunction } from "remix";

export const loader: LoaderFunction = async ({ request }) => {
  // Fetch the shipping rates from your database or an external service
  const shippingRates = [
    {
      service_name: "Standard Shipping",
      service_code: "standard_shipping",
      total_price: 599, // Price in cents
      currency: "USD",
      min_delivery_date: new Date().toISOString(),
      max_delivery_date: new Date().toISOString(),
    },
    {
      service_name: "Express Shipping",
      service_code: "express_shipping",
      total_price: 1599,
      currency: "USD",
      min_delivery_date: new Date().toISOString(),
      max_delivery_date: new Date().toISOString(),
    },
  ];

  // Return the shipping rates in the format Shopify expects
  return new Response(JSON.stringify({ rates: shippingRates }), {
    headers: { "Content-Type": "application/json" },
  });
};
