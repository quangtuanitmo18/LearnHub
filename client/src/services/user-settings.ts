import { ApiService } from '@/lib/api-service';

const ENDPOINTS = {
  MY_SETTINGS: '/users/settings/me',
} as const;

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  darkMode: boolean;
  language: 'vi' | 'en';
}

export interface UpdateUserSettingsRequest {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  darkMode?: boolean;
  language?: 'vi' | 'en';
}

export class UserSettingsService {
  static async getMySettings(): Promise<UserSettings> {
    return ApiService.get<UserSettings>(ENDPOINTS.MY_SETTINGS);
  }

  static async updateMySettings(data: UpdateUserSettingsRequest): Promise<UserSettings> {
    return ApiService.put<UserSettings, UpdateUserSettingsRequest>(ENDPOINTS.MY_SETTINGS, data);
  }
}
