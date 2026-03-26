export const ReactionType = {
  LIKE : "LIKE",
  LOVE : "LOVE",
  CARE : "CARE",
  FUN : "FUN",
  WOW : "WOW",
  SAD : "SAD",
  ANGRY : "ANGRY",
} as const;

export type ReactionTypeType = (typeof ReactionType)[keyof typeof ReactionType];

export const CommentStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type CommentStatusType = (typeof CommentStatus)[keyof typeof CommentStatus];
