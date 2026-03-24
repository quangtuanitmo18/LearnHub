// Membership plan enum
export enum MembershipPlan {
  COPPER = "COPPER",
  SILVER = "SILVER",
  GOLD = "GOLD",
  DIAMOND = "DIAMOND",
}

// Membership status enum
export enum MembershipStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

// User membership interface - represents the user's current membership
export interface UserMembership {
  id: string;
  plan: MembershipPlan;
  status: MembershipStatus;
  startDate: string;
  endDate: string;
  // Optional: List of course IDs the membership grants access to
  // If undefined or empty, the membership grants access to all courses
  courseIds?: string[];
}

// Helper function to check if membership is active
export function isMembershipActive(
  membership?: UserMembership | null
): boolean {
  if (!membership) return false;
  if (membership.status !== MembershipStatus.ACTIVE) return false;

  const now = new Date();
  const endDate = new Date(membership.endDate);
  return endDate > now;
}

// Helper function to check if membership grants access to a specific course
export function membershipGrantsAccessToCourse(
  membership: UserMembership | null | undefined,
  courseId: string
): boolean {
  if (!membership || !isMembershipActive(membership)) return false;

  // If courseIds is not defined or empty, membership grants access to all courses
  if (!membership.courseIds || membership.courseIds.length === 0) {
    return true;
  }

  // Check if the specific course is in the membership's course list
  return membership.courseIds.includes(courseId);
}
