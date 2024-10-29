import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.shippingRate.createMany({
    data: [
      // US Shipping Rates
      {
        serviceName: "Standard Shipping",
        serviceCode: "standard",
        description: "Delivered in 5-7 business days",
        price: 500, // $5.00
        currency: "USD",
        country: "US"
      },
      {
        serviceName: "Express Shipping",
        serviceCode: "express",
        description: "Delivered in 2-3 business days",
        price: 1000, // $10.00
        currency: "USD",
        country: "US"
      },
      {
        serviceName: "Overnight Shipping",
        serviceCode: "overnight",
        description: "Delivered the next business day",
        price: 2000, // $20.00
        currency: "USD",
        country: "US"
      },
      // Indonesia Shipping Rates
      {
        serviceName: "Burok Shipping",
        serviceCode: "standard",
        description: "Delivered in 5-7 business days",
        price: 70000, // 70,000 IDR
        currency: "IDR",
        country: "ID"
      },
      {
        serviceName: "JNT Shipping",
        serviceCode: "express",
        description: "Delivered in 2-3 business days",
        price: 120000, // 120,000 IDR
        currency: "IDR",
        country: "ID"
      },
      {
        serviceName: "Leumpang Nepi Pengkor",
        serviceCode: "overnight",
        description: "Delivered the next business day",
        price: 200000, // 200,000 IDR
        currency: "IDR",
        country: "ID"
      }
    ]
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })