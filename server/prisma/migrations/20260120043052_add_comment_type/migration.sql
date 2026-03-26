/*
  Warnings:

  - The values [HAHA] on the enum `ReactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReactionType_new" AS ENUM ('LIKE', 'LOVE', 'CARE', 'FUN', 'WOW', 'SAD', 'ANGRY');
ALTER TABLE "CommentReaction" ALTER COLUMN "type" TYPE "ReactionType_new" USING ("type"::text::"ReactionType_new");
ALTER TYPE "ReactionType" RENAME TO "ReactionType_old";
ALTER TYPE "ReactionType_new" RENAME TO "ReactionType";
DROP TYPE "public"."ReactionType_old";
COMMIT;
