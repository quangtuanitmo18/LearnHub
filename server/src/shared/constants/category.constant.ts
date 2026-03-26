export const CategoryStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type CategoryStatusType = (typeof CategoryStatus)[keyof typeof CategoryStatus];
