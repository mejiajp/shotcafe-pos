import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Load product data from the external JSON file
const productsFilePath = path.join(__dirname, "seeds/products.json");
const products = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));

async function main() {
  // Delete existing products
  console.log("Deleting existing products...");
  await prisma.product.deleteMany();
  console.log("All existing products have been deleted.");

  const createdProducts = [];

  for (const product of products) {
    // Set the image path dynamically based on product name
    const filePath = `../assets/menu/${product.name.replace(/\s+/g, "")}.jpg`;
    // Create the product in the database
    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        price: parseFloat(product.price), // Convert price to a number
        category: product.category,
        image: filePath, // Path to the product image
      },
    });

    createdProducts.push(createdProduct);
    console.log(`Product created: ${createdProduct.name}`);
  }

  // Export the created products data to a JSON file
  const outputFilePath = path.join(
    __dirname,
    "..npx/seeded_file/products_seeded.json"
  );
  fs.writeFileSync(
    outputFilePath,
    JSON.stringify(createdProducts, null, 2),
    "utf-8"
  );
  console.log("All products have been written to", outputFilePath);
}

main()
  .catch((e: Error) => {
    console.error(e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
