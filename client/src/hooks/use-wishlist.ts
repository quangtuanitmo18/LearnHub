import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import UsersService from '@/services/users';
import { toast } from 'sonner';

export const WISHLIST_QUERY_KEYS = {
  all: ['wishlist'] as const,
  lists: () => [...WISHLIST_QUERY_KEYS.all, 'list'] as const,
  list: (params: any) => [...WISHLIST_QUERY_KEYS.lists(), params] as const,
};

export const useMyWishlist = (params: any = { page: 1, limit: 10 }) => {
  return useQuery({
    queryKey: WISHLIST_QUERY_KEYS.list(params),
    queryFn: () => UsersService.getMyWishlist(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useToggleWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => UsersService.toggleWishlist(courseId),
    onSuccess: (data) => {
      // Invalidate the wishlist queries so the list gets updated
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEYS.lists() });
      if (data.isWishlisted) {
        toast.success(data.message || 'Added to wishlist');
      } else {
        toast.info(data.message || 'Removed from wishlist');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update wishlist');
    },
  });
};
