import axiosInstance from "./api";
import {
  CreatePriceRevealAdminDto,
  CreatePriceRevealQaDto,
  RevisePriceDto,
  SellerRejectedDto,
} from "../types/priceReveal";

export const createPriceRevealAdmin = async (body: CreatePriceRevealAdminDto) => {
  const res = await axiosInstance.post("/1.0/price-reveal/admin/create", body);
  return res.data;
};

export const createPriceRevealQa = async (body: CreatePriceRevealQaDto) => {
  const res = await axiosInstance.post("/1.0/price-reveal/qa/create", body);
  return res.data;
};

export const findAllPriceReveals = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  carId?: string;
}) => {
  const res = await axiosInstance.get("/1.0/price-reveal/find-all", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      ...(params.status ? { status: params.status } : {}),
      ...(params.carId ? { carId: params.carId } : {}),
    },
  });
  return res.data;
};

export const findPriceReveal = async (id: string) => {
  const res = await axiosInstance.get("/1.0/price-reveal/find/" + id);
  return res.data;
};

export const revisePriceReveal = async (id: string, body: RevisePriceDto) => {
  const res = await axiosInstance.patch("/1.0/price-reveal/revise/" + id, body);
  return res.data;
};

export const markFinalOffer = async (id: string) => {
  const res = await axiosInstance.patch("/1.0/price-reveal/mark-final/" + id);
  return res.data;
};

export const findMyOffers = async (status?: string) => {
  const res = await axiosInstance.get("/1.0/price-reveal/inspector/my-offers", {
    params: status ? { status } : undefined,
  });
  return res.data;
};

export const sellerAcceptedOffer = async (id: string) => {
  const res = await axiosInstance.patch(
    "/1.0/price-reveal/inspector/seller-accepted/" + id
  );
  return res.data;
};

export const sellerRejectedOffer = async (id: string, body?: SellerRejectedDto) => {
  const res = await axiosInstance.patch(
    "/1.0/price-reveal/inspector/seller-rejected/" + id,
    body || {}
  );
  return res.data;
};

export const discardOffer = async (id: string) => {
  const res = await axiosInstance.patch("/1.0/price-reveal/discard-offer/" + id);
  return res.data;
};
