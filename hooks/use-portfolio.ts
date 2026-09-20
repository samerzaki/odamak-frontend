import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPortfolioItem,
  deletePortfolioItem,
  fetchPortfolio,
  fetchPortfolioOptions,
  fetchPortfolioSummary,
  updatePortfolioItem,
} from "@/lib/api-portfolio";
import type { CreatePortfolioItemRequest, UpdatePortfolioItemRequest } from "@/types/portfolio";
import { REFRESH_INTERVAL } from "@/lib/constants";

const portfolioKey = ["asset-portfolio"];

export function usePortfolio() {
  return useQuery({
    queryKey: portfolioKey,
    queryFn: () => fetchPortfolio(),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: 30_000,
  });
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: [...portfolioKey, "summary"],
    queryFn: fetchPortfolioSummary,
    refetchInterval: REFRESH_INTERVAL,
    staleTime: 30_000,
  });
}

export function usePortfolioOptions(enabled = true) {
  return useQuery({
    queryKey: [...portfolioKey, "options"],
    queryFn: fetchPortfolioOptions,
    enabled,
    staleTime: 5 * 60_000,
  });
}

function usePortfolioInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: portfolioKey });
}

export function useCreatePortfolioItem() {
  const invalidate = usePortfolioInvalidation();
  return useMutation({ mutationFn: (data: CreatePortfolioItemRequest) => createPortfolioItem(data), onSuccess: invalidate });
}

export function useUpdatePortfolioItem() {
  const invalidate = usePortfolioInvalidation();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePortfolioItemRequest }) => updatePortfolioItem(id, data),
    onSuccess: invalidate,
  });
}

export function useDeletePortfolioItem() {
  const invalidate = usePortfolioInvalidation();
  return useMutation({ mutationFn: deletePortfolioItem, onSuccess: invalidate });
}
