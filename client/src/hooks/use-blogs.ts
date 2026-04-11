import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import BlogsService from '@/services/blogs';
import { toast } from 'sonner';
import {
  CreateBlogRequest,
  CreateCommunityPostRequest,
  UpdateBlogRequest,
  UpdateCommunityPostRequest,
  BlogsFilterParams,
} from '@/types/blog';
import { BaseFilterParams } from '@/types/common';
import { useAuthStore } from '@/stores/auth-store';

// Query keys for blogs
export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (filters: BlogsFilterParams) => [...blogKeys.lists(), filters] as const,
  published: (params: Omit<BlogsFilterParams, 'status'>) =>
    [...blogKeys.all, 'published', params] as const,
  allBlogs: () => [...blogKeys.all, 'all'] as const,
  detail: (id: string) => [...blogKeys.all, 'detail', id] as const,
  myPosts: (params?: BaseFilterParams) => [...blogKeys.all, 'my-posts', params] as const,
  byCourse: (courseId: string, params?: BaseFilterParams) =>
    [...blogKeys.all, 'course', courseId, params] as const,
};

// ==========================================
// EXISTING ADMIN HOOKS
// ==========================================

export function useBlogs(params?: BlogsFilterParams) {
  return useQuery({
    queryKey: blogKeys.list(params || {}),
    queryFn: () => BlogsService.getBlogs(params),
    placeholderData: keepPreviousData,
  });
}

export function usePublishedBlogs(params?: Omit<BlogsFilterParams, 'status'>) {
  return useQuery({
    queryKey: blogKeys.published(params || {}),
    queryFn: () => BlogsService.getPublishedBlogs(params),
    placeholderData: keepPreviousData,
  });
}

export function useAllBlogs() {
  return useQuery({
    queryKey: blogKeys.allBlogs(),
    queryFn: () => BlogsService.getAllBlogs(),
  });
}

export function useBlog(id: string) {
  return useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: () => BlogsService.getBlog(id),
    enabled: !!id,
  });
}

export function useBlogBySlug(slug: string) {
  return useQuery({
    queryKey: [...blogKeys.all, 'slug', slug] as const,
    queryFn: () => BlogsService.getBlogBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogData: CreateBlogRequest) => BlogsService.createBlog(blogData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create blog');
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogData: UpdateBlogRequest) => BlogsService.updateBlog(blogData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(data.id) });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update blog');
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => BlogsService.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete blog');
    },
  });
}

export function useBulkDeleteBlogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogIds: string[]) => BlogsService.bulkDeleteBlogs(blogIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete blogs');
    },
  });
}

// ==========================================
// COMMUNITY HOOKS
// ==========================================

export function useMyPosts(params?: BaseFilterParams) {
  return useQuery({
    queryKey: blogKeys.myPosts(params),
    queryFn: () => BlogsService.getMyPosts(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommunityPostRequest) => BlogsService.createCommunityPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.myPosts() });
      toast.success('Post created successfully!');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create post');
    },
  });
}

export function useUpdateCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommunityPostRequest }) =>
      BlogsService.updateCommunityPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.myPosts() });
      toast.success('Post updated successfully!');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update post');
    },
  });
}

export function useDeleteCommunityPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => BlogsService.deleteCommunityPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.myPosts() });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete post');
    },
  });
}

export function useToggleUpvote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogId: string) => BlogsService.toggleUpvote(blogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update vote');
    },
  });
}

export function useUpdateBlogStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' }) =>
      BlogsService.updateBlogStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(data.id) });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update status');
    },
  });
}

export function useBlogUpvoteStatus(blogId: string) {
  const isAuth = useAuthStore((s) => !!s.user);

  return useQuery({
    queryKey: [...blogKeys.all, 'upvote-status', blogId],
    queryFn: () => BlogsService.getUpvoteStatus(blogId),
    enabled: !!blogId && isAuth,
    retry: false, // Don't retry if it fails
  });
}

export function useCommunityBlogsByCourse(courseId: string, params?: BaseFilterParams) {
  return useQuery({
    queryKey: blogKeys.byCourse(courseId, params),
    queryFn: () => BlogsService.getCommunityBlogsByCourse(courseId, params),
    enabled: !!courseId,
    placeholderData: keepPreviousData,
  });
}
