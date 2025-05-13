/**
 * Order Types and Statuses
 * Defines the structure of an order and valid status/type options.
 */

// List of predefined statuses for the left/right columns in the table
export type OrderStatus =
  | "Ready for Packaging"
  | "Drying"
  | "QC"
  | "Delivered"
  | "Printing"
  | "Open Order"
  | (string & {}); // fallback: allows handling unknown/custom statuses

// Enum-like values for the classification of orders
export type OrderType = "Sample" | "Order" | "Seeding" | "B2C";

// The core data model representing each order row
export interface Order {
  oid: number; 
  statusLeft: OrderStatus; 
  statusRight: OrderStatus; 
  type: OrderType; 
  lock: string; 
  customer: string; 
  daysSinceOrder: number; 
  model: string; 
  designer: string;
}
