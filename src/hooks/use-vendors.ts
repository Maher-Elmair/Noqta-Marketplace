import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorsApi } from '@/services/api/vendors';
import { PAGINATION } from '@/lib/constants';
import type { Seller } from '@/types';

export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (page: number, pageSize: number) => [...vendorKeys.lists(), page, pageSize] as const,
  featured: () => [...vendorKeys.all, 'featured'] as const,
  bestSelling: () => [...vendorKeys.all, 'bestSelling'] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (slug: string) => [...vendorKeys.details(), slug] as const,
};

export function useVendors(page = 1, pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE) {
  return useQuery({
    queryKey: vendorKeys.list(page, pageSize),
    queryFn: () => vendorsApi.getVendors(page, pageSize),
  });
}

export function useFeaturedVendors(limit = 4) {
  return useQuery({
    queryKey: vendorKeys.featured(),
    queryFn: () => vendorsApi.getFeaturedVendors(limit),
  });
}

export function useBestSellingVendors(limit = 4) {
  return useQuery({
    queryKey: vendorKeys.bestSelling(),
    queryFn: () => vendorsApi.getBestSellingVendors(limit),
  });
}

export function useVendorByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: [...vendorKeys.all, 'user', userId],
    queryFn: () => userId ? vendorsApi.getVendorByUserId(userId) : Promise.reject('No user ID'),
    enabled: !!userId,
    retry: false
  });
}

export function useVendorBySlug(slug: string) {
  return useQuery({
    queryKey: vendorKeys.detail(slug),
    queryFn: () => vendorsApi.getVendorBySlug(slug),
    enabled: !!slug,
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Seller> }) =>
      vendorsApi.updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
}
