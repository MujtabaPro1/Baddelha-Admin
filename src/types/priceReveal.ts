export const PRICE_REVEAL_STATUS = {
  Pending: 'Pending',
  RejectedBySeller: 'RejectedBySeller',
  Accepted: 'Accepted',
  Discarded: 'Discarded',
} as const;

export type PriceRevealStatus = typeof PRICE_REVEAL_STATUS[keyof typeof PRICE_REVEAL_STATUS];

export interface PriceReveal {
  id: string | number;
  carId: string;
  inspectionId: string;
  inspectorUserId: number;
  qaUserId?: number | null;
  price: number | string;
  note?: string | null;
  status: PriceRevealStatus;
  isFinalOffer: boolean;
  createdAt: string;
  updatedAt: string;
  Car?: any;
  car?: any;
  Inspection?: any;
  inspection?: any;
  Inspector?: any;
  carFrontImage?: string | null;
  customerName?: string;
  bookingSerialNo?: number;
  [key: string]: any;
}

export interface CreatePriceRevealAdminDto {
  carId: string;
  inspectionId: string;
  inspectorUserId: number;
  price: number;
  note?: string;
}

export interface CreatePriceRevealQaDto {
  carId: string;
  price: number;
  note?: string;
}

export interface RevisePriceDto {
  price: number;
}

export interface SellerRejectedDto {
  note?: string;
}

export interface PriceRevealListResponse {
  data: PriceReveal[];
  total: number;
  page: number;
  limit: number;
}
