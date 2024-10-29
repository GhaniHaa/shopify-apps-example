import { ActionFunction } from 'remix';
import prisma from '../db.server';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Parse the JSON body
  const body = await request.json();

  // Origin is for store location
  // destination is for buyer location or indentification when selected courrier in admin
  const { origin, destination} = body.rate
  const { country } = destination;

  const shippingRates = await prisma.shippingRate.findMany({
    where: {
      ...(country ? { country } : {}),
    }
  });
  console.log('origin', origin)
  console.log('destination', destination)
  let priceCustom = 0;

  const shopifyResponse = {
    rates: shippingRates.map((rate: any) => ({
      service_name: rate.serviceName,
      description: rate.description,
      service_code: rate.serviceCode,
      total_price: origin.postal_code === destination.postal_code ? priceCustom : rate.price,
      currency: rate.currency,
      min_delivery_date: new Date().toISOString(),
      max_delivery_date: new Date().toISOString(),
    })),
  };

  return new Response(JSON.stringify(shopifyResponse), {
    headers: { 'Content-Type': 'application/json' },
  });
};
