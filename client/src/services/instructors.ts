import { ApiService } from '@/lib/api-service';
import type {
  InstructorsListResponse,
  InstructorDetailResponse,
  InstructorProfile,
} from '@/types/instructor';

const ENDPOINTS = {
  INSTRUCTORS: '/instructors',
  INSTRUCTOR: (username: string) => `/instructors/${username}`,
  MY_PROFILE: '/instructors/profile/me',
} as const;

export class InstructorsService {
  static async getInstructors(): Promise<InstructorsListResponse> {
    try {
      return await ApiService.get<InstructorsListResponse>(ENDPOINTS.INSTRUCTORS);
    } catch (error) {
      console.error('Failed to get instructors:', error);
      throw error;
    }
  }

  static async getInstructorByUsername(username: string): Promise<InstructorDetailResponse> {
    try {
      return await ApiService.get<InstructorDetailResponse>(ENDPOINTS.INSTRUCTOR(username));
    } catch (error) {
      console.error(`Failed to get instructor ${username}:`, error);
      throw error;
    }
  }

  static async updateMyProfile(data: Partial<InstructorProfile>): Promise<any> {
    try {
      return await ApiService.post(ENDPOINTS.MY_PROFILE, data);
    } catch (error) {
      console.error('Failed to update instructor profile:', error);
      throw error;
    }
  }
}
