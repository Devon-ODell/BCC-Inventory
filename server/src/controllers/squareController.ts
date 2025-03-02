import { Request, Response } from "express";
import { squareClient } from "../config/squareClient";

// Get catalog items from Square
export const getSquareCatalog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { result } = await squareClient.catalogApi.listCatalog(undefined, "ITEM");
    res.json(result);
  } catch (error) {
    console.error("Error fetching Square catalog:", error);
    res.status(500).json({ message: "Error retrieving Square catalog items" });
  }
};

// Sync a product to Square
export const syncProductToSquare = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, name, price } = req.body;
    
    const priceInCents = Math.round(parseFloat(price) * 100);
    
    const { result } = await squareClient.catalogApi.upsertCatalogObject({
      idempotencyKey: `product-sync-${productId}-${Date.now()}`,
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
    
    res.status(201).json(result);
  } catch (error) {
    console.error("Error syncing product to Square:", error);
    res.status(500).json({ message: "Error syncing product to Square" });
  }
};