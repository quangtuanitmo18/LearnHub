import {
  UserSettingsService,
  type UpdateUserSettingsRequest,
  type UserSettings,
} from '@/services/user-settings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const SETTINGS_QUERY_KEY = ['user-settings'];

export function useUserSettings() {
  return useQuery<UserSettings>({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: UserSettingsService.getMySettings,
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation<UserSettings, Error, UpdateUserSettingsRequest>({
    mutationFn: UserSettingsService.updateMySettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, updatedSettings);
    },
  });
}
