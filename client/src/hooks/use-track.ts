"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import TrackService from "@/services/track";
import type { ITrack, ToggleTrackRequest } from "@/types/track";

// Query keys for track
export const trackKeys = {
	all: ["track"] as const,
	courseTracks: (courseId: string) =>
		[...trackKeys.all, "course", courseId] as const,
} as const;

// Hook to get user's completion tracks for a specific course
export function useUserCourseTracks(courseId: string) {
	return useQuery<ITrack[]>({
		queryKey: trackKeys.courseTracks(courseId),
		queryFn: () => TrackService.getCourseTracksForUser(courseId),
		enabled: !!courseId, // Only run if courseId is provided
	});
}

// Custom hook for track toggling
export function useToggleTrack() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ToggleTrackRequest) => TrackService.toggleTrack(data),
		onSuccess: (data, variables) => {
			// Invalidate the course tracks query to refetch
			queryClient.invalidateQueries({
				queryKey: trackKeys.courseTracks(variables.courseId),
			});

			// Show success toast
			toast.success("Lesson status updated!");
		},
		onError: (error) => {
			console.error("Failed to toggle track:", error);
			toast.error("Unable to change lesson status");
		},
	});
}
