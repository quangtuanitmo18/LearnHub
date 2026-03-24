import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import PostsService from "@/services/posts";
import { toast } from "sonner";
import {
  CreatePostRequest,
  UpdatePostRequest,
  PostsFilterParams,
} from "@/types/post";

// Query keys for posts
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: PostsFilterParams) => [...postKeys.lists(), filters] as const,
  published: (params: Omit<PostsFilterParams, "status">) =>
    [...postKeys.all, "published", params] as const,
  allPosts: () => [...postKeys.all, "all"] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
};

// Hooks for posts
export function usePosts(params?: PostsFilterParams) {
  return useQuery({
    queryKey: postKeys.list(params || {}),
    queryFn: () => PostsService.getPosts(params),
    placeholderData: keepPreviousData,
  });
}

// Hook for getting published posts
export function usePublishedPosts(params?: Omit<PostsFilterParams, "status">) {
  return useQuery({
    queryKey: postKeys.published(params || {}),
    queryFn: () => PostsService.getPublishedPosts(params),
    placeholderData: keepPreviousData,
  });
}

// Hook for getting all posts (for dropdowns)
export function useAllPosts() {
  return useQuery({
    queryKey: postKeys.allPosts(),
    queryFn: () => PostsService.getAllPosts(),
  });
}

// Hook for getting single post
export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => PostsService.getPost(id),
    enabled: !!id,
  });
}

// Hook for getting post by slug
export function usePostBySlug(slug: string) {
  return useQuery({
    queryKey: [...postKeys.all, "slug", slug] as const,
    queryFn: () => PostsService.getPostBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData: CreatePostRequest) =>
      PostsService.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create post");
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData: UpdatePostRequest) =>
      PostsService.updatePost(postData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(data.id) });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update post");
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PostsService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete post");
    },
  });
}

export function useBulkDeletePosts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postIds: string[]) => PostsService.bulkDeletePosts(postIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete posts");
    },
  });
}
