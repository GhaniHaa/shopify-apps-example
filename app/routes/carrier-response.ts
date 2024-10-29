import { LoaderFunction } from 'remix';
import prisma from '../db.server';

export const loader: LoaderFunction = async () => {

  const shippingRates = await prisma.shippingRate.findMany();
  const shopifyResponse = {
    rates: shippingRates.map((rate: any) => ({
      service_name: rate.serviceName,
      description: rate.description,
      service_code: rate.serviceCode,
      total_price: rate.price, // Already in cents
      currency: rate.currency,
      min_delivery_date: new Date().toISOString(),
      max_delivery_date: new Date().toISOString(),
    })),
  };
  return new Response(JSON.stringify(shopifyResponse), {
    headers: { 'Content-Type': 'application/json' },
  });
};
