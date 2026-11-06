import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const dataFilePath = path.join(__dirname, "seeds/order_summary.json");
const data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));

// Configure the date range for generated transactions
const END_DATE = new Date();
const START_DATE = new Date(END_DATE);

// This is the span from my Original Seeded Data (for replication)
START_DATE.setDate(START_DATE.getDate() - 165);

// Generate a random date and time within the configured range
function generateRandomDate(): Date {
  const start = START_DATE.getTime();
  const end = END_DATE.getTime();

  return new Date(start + Math.random() * (end - start));
}

async function main() {
  console.log("Deleting existing orders...");

  await prisma.order.deleteMany();
  await prisma.ordersSummary.deleteMany();

  console.log("All existing orders have been deleted.");

  // Define size-based price adjustments
  const sizePriceAdjustment: { [key: string]: number } = {
    S: 0,
    M: 20,
    L: 40,
  };

  // Collect all unique product names across all order summaries
  const productNames = Array.from(
    new Set<string>(
      data.flatMap((input: any) =>
        input.orders.map((order: any) => order.productName as string)
      )
    )
  );

  // Fetch all required products in a single query
  const products = await prisma.product.findMany({
    where: {
      name: {
        in: productNames,
      },
    },
  });

  // Map product names to their complete records
  const productMap = new Map(
    products.map((product) => [product.name, product])
  );

  console.log(`Fetched ${products.length} unique products.`);

  // Validate that all referenced products exist
  for (const name of productNames) {
    if (!productMap.has(name)) {
      throw new Error(`Product not found: ${name}`);
    }
  }

  // Array to store all created order summaries
  const orderSummaries: any[] = [];

  for (const input of data) {
    console.log(`Processing order for user: ${input.user}`);

    // Fetch the user
    const user = await prisma.user.findFirst({
      where: {
        username: input.user,
      },
    });

    if (!user) {
      console.error(`User not found: ${input.user}`);
      continue;
    }

    // Prepare orders with adjusted prices
    const orders = input.orders.map((order: any) => {
      const product = productMap.get(order.productName);

      if (!product) {
        throw new Error(`Product not found: ${order.productName}`);
      }

      const basePrice = Number(product.price);
      const sizeAdjustment = sizePriceAdjustment[order.size] || 0;

      const moddedPrice = basePrice + sizeAdjustment;

      return {
        product: {
          connect: {
            name: product.name,
          },
        },
        size: order.size,
        temperature: order.temperature,
        moddedPrice,
      };
    });

    // Generate a random transaction date
    const createdAt = generateRandomDate();

    // Create OrdersSummary
    const orderSummary = await prisma.ordersSummary.create({
      data: {
        paymentMethod: input.paymentMethod,
        user: {
          connect: {
            id: user.id,
          },
        },
        orders: {
          create: orders,
        },
        totalPrice: orders.reduce(
          (sum: number, order: any) => sum + order.moddedPrice,
          0
        ),
        createdAt,
      },
      include: {
        orders: true,
      },
    });

    // Add the created order summary to the array
    orderSummaries.push(orderSummary);

    console.log(
      `Order Summary created: ${orderSummary.id} | ${createdAt.toISOString()}`
    );
  }

  // Export the created order summaries
  const exportFilePath = path.join(
    __dirname,
    "../seeded_file/orders_summary_seeded.json"
  );

  fs.writeFileSync(
    exportFilePath,
    JSON.stringify(orderSummaries, null, 2),
    "utf-8"
  );

  console.log(`Order summaries exported to ${exportFilePath}`);
}

main()
  .catch((e: Error) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
