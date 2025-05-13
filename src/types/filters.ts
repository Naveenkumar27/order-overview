/**
 * Filter and Preset Types
 * Defines the shape of filter state and saved presets for the order dashboard.
 */

import { SortableOrderKeys } from "@/app/page";

// Represents the active filter selections for each column
export interface FilterState {
  OID?: string[];          
  status: string[];         
  type: string[];          
  lock: string[];          
  customer: string[];     
  model: string[];         
  designer: string[];       
  days: string[];          
}

// Represents a saved preset including filters and sorting configuration
export interface Preset {
  name: string;                   
  filters: FilterState;           
  sortKey: SortableOrderKeys;      
  sortDirection: "asc" | "desc";   
}
