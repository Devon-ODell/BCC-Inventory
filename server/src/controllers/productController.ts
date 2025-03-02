import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { squareClient } from "../config/squareClient";

const prisma = new PrismaClient();

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const products = await prisma.products.findMany({
      where: {
        name: {
          contains: search,
        },
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products" });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, name, price, rating, stockQuantity } = req.body;
    
    // First, create the product in our database
    const product = await prisma.products.create({
      data: {
        productId,
        name,
        price,
        rating,
        stockQuantity,
      },
    });
    
    // Then, try to sync with Square (but don't fail the whole request if Square sync fails)
    try {
      const priceInCents = Math.round(price * 100);
      
      await squareClient.catalogApi.upsertCatalogObject({
        idempotencyKey: `product-create-${productId}-${Date.now()}`,
        object: {
          type: 'ITEM',
          id: `#${productId}`,
          itemData: {
            name: name,
            variations: [
              {
                type: 'ITEM_VARIATION',
                id: `#${productId}-variation`,
                itemVariationData: {
                  name: 'Regular',
                  pricingType: 'FIXED_PRICING',
                  priceMoney: {
                    amount: BigInt(priceInCents),
                    currency: 'USD'
                  }
                }
              }
            ]
          }
        }
      });
    } catch (squareError) {
      console.error("Failed to sync product to Square:", squareError);
      // Continue with the response, just log the error
    }
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error creating product" });
  }
};