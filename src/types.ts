export interface Invoice {
  requestDate: string;
  completionDate: string;
  customer: string;
  item: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  discount: number;
  serviceFee: number;
  finalTotal: number;
  hasPriceInconsistency?: boolean;
  hasSignificantPriceInconsistency?: boolean;
}

export interface ValidationError {
  row: number;
  message: string;
  // Optional fields for structured price inconsistency errors
  isPriceInconsistency?: boolean;
  itemName?: string;
  prices?: number[];
  isSignificant?: boolean;
}
