export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED',
} as const;

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];

export const UserType = {
  FACEBOOK: 'FACEBOOK',
  GOOGLE: 'GOOGLE',
  DEFAULT: 'DEFAULT',
} as const;

export type UserTypeValue = (typeof UserType)[keyof typeof UserType];

export const MembershipPlan = {
  NONE: 'NONE',
  COPPER: 'COPPER',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
  DIAMOND: 'DIAMOND',
} as const;

export type MembershipPlanType =
  (typeof MembershipPlan)[keyof typeof MembershipPlan];

// Membership plan durations in months
export const MembershipDuration: Record<MembershipPlanType, number> = {
  [MembershipPlan.NONE]: 0,
  [MembershipPlan.COPPER]: 1, // 1 month
  [MembershipPlan.SILVER]: 3, // 3 months
  [MembershipPlan.GOLD]: 6, // 6 months
  [MembershipPlan.DIAMOND]: 12, // 1 year
};

// Membership plan prices (in your currency unit)
export const MembershipPrice: Record<MembershipPlanType, number> = {
  [MembershipPlan.NONE]: 0,
  [MembershipPlan.COPPER]: 99000, // 1 month price
  [MembershipPlan.SILVER]: 249000, // 3 months price (save ~16%)
  [MembershipPlan.GOLD]: 449000, // 6 months price (save ~25%)
  [MembershipPlan.DIAMOND]: 799000, // 1 year price (save ~33%)
};
