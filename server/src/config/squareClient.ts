import { Client } from 'square';
import dotenv from 'dotenv';

dotenv.config();

export const squareClient = new Client({
  environment: 'sandbox',
  accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN,
  userAgentDetail: 'inventory-management-app'
});