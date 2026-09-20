import { apiFetch, getAuthHeaders, ApiError } from "./auth-utils";
import { API_BASE_URL } from "./constants";
import type {
  CreatePortfolioItemRequest,
  PortfolioIndexResponse,
  PortfolioItemResponse,
  PortfolioOptionsResponse,
  PortfolioSummaryResponse,
  UpdatePortfolioItemRequest,
} from "@/types/portfolio";

export async function fetchPortfolio(type?: string): Promise<PortfolioIndexResponse> {
  const query = type && type !== "all" ? `?type=${encodeURIComponent(type)}` : "";
  return apiFetch<PortfolioIndexResponse>(`/asset-portfolio${query}`);
}

export async function fetchPortfolioSummary(): Promise<PortfolioSummaryResponse> {
  return apiFetch<PortfolioSummaryResponse>("/asset-portfolio/summary");
}

export async function fetchPortfolioOptions(): Promise<PortfolioOptionsResponse> {
  return apiFetch<PortfolioOptionsResponse>("/asset-portfolio/options");
}

export async function createPortfolioItem(data: CreatePortfolioItemRequest): Promise<PortfolioItemResponse> {
  return apiFetch<PortfolioItemResponse>("/asset-portfolio", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePortfolioItem(
  id: number,
  data: UpdatePortfolioItemRequest
): Promise<PortfolioItemResponse> {
  return apiFetch<PortfolioItemResponse>(`/asset-portfolio/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePortfolioItem(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/asset-portfolio/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(false),
  });

  if (!response.ok && response.status !== 204) {
    let message = "Unable to delete this asset.";
    try {
      const data = await response.json();
      message = data.meta?.message ?? data.error?.message ?? data.message ?? message;
    } catch {
      // The API may return an empty error response.
    }
    throw new ApiError(message, response.status);
  }
}
