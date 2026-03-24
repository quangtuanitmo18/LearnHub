import { ApiService } from "@/lib/api-service";
import type { ITrack, ToggleTrackRequest } from "@/types/track";

const ENDPOINTS = {
	TOGGLE_LESSON_PROGRESS: (lessonId: string) => `/lessons/${lessonId}/progress/toggle`,
	COURSE_LESSONS_PROGRESS: (courseId: string) => `/courses/${courseId}/lessons/progress`,
} as const;

export class TrackService {
	// Toggle track (create if not completed, delete if completed)
	static async toggleTrack(data: ToggleTrackRequest): Promise<ITrack | void> {
		// Use new endpoint: POST /lessons/{lessonId}/progress/toggle
		return ApiService.post<ITrack, void>(
			ENDPOINTS.TOGGLE_LESSON_PROGRESS(data.lessonId),
			undefined
		);
	}

	// Get course tracks for user
	static async getCourseTracksForUser(
		courseId: string
	): Promise<ITrack[]> {
		try {
			// Use new endpoint: GET /courses/{courseId}/lessons/progress
			return await ApiService.get<ITrack[]>(
				ENDPOINTS.COURSE_LESSONS_PROGRESS(courseId)
			);
		} catch {
			return [];
		}
	}
}

export default TrackService;
