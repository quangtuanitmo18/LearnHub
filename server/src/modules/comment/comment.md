Thiết kế cập nhật cho **Lesson** thay Post, dùng **enum ReactionType** với 6 types Facebook-style (LIKE|LOVE|HAHA|WOW|SAD|ANGRY). [^1]

Schema/API hoàn chỉnh dưới đây, chỉ thay post → lesson.

## Prisma Schema Đầy Đủ (Lesson-based)

```prisma
enum ReactionType {
  LIKE
  LOVE
  HAHA
  WOW
  SAD
  ANGRY
}


model Comment {
  id          String         @id @default(uuid())
  lessonId    String
  lesson      Lesson         @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  userId      String
  user        User           @relation(fields: [userId], references: [id])
  parentId    String?
  parent      Comment?       @relation("Children", fields: [parentId], references: [id], onDelete: Cascade)
  children    Comment[]      @relation("Children")
  content     String
  level       Int            @default(0)
  reactions   CommentReaction[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([lessonId])
  @@index([parentId])
  @@index([userId])
}

model CommentReaction {
  id           String       @id @default(cuid())
  commentId    String
  comment      Comment      @relation(fields: [commentId], references: [id], onDelete: Cascade)
  userId       String
  user         User         @relation(fields: [userId], references: [id])
  type         ReactionType

  @@unique([commentId, userId])
}
```

## Sample Data (Lesson Context)

| Table           | id  | content                  | lessonId | parentId | level | userId | type (reaction) |
| :-------------- | :-- | :----------------------- | :------- | :------- | :---- | :----- | :-------------- |
| Lesson          | l1  | "Lesson 1: React Basics" | -        | -        | -     | -      | -               |
| Comment         | c1  | "Great lesson!"          | l1       | null     | 0     | u1     | -               |
| Comment         | c2  | "Need more examples"     | l1       | c1       | 1     | u2     | -               |
| CommentReaction | cr1 | -                        | -        | c1       | -     | u2     | LIKE            |
| CommentReaction | cr2 | -                        | -        | c1       | -     | u3     | LOVE [^1]       |

## Workflow FE -> BE (Lesson)

1. Load 10 root comments của lesson.
2. Bấm "Xem replies" → get all direct children of the comment.
3. Create reply với lessonId + parentId.
4. React: Toggle type enum (unique user/comment).

## API Endpoints \& Payloads Full

### 1. GET /api/lessons/:lessonId/comments?take=10\&skip=0

**Res:**

```json
{
  "comments": [
    {
      "id": "c1",
      "content": "Great lesson!",
      "level": 0,
      "replyCount": 1,
      "reactions": { "LIKE": 5, "LOVE": 2, "HAHA": 1 },
      "myReaction": "LIKE",
      "user": { "id": "u1", "name": "Teacher" }
    }
  ]
}
```

### 2. GET /api/comments/:id/replies

**Res:** Direct all children of the comment.

### 3. POST /api/lessons/:lessonId/comments

**Req (Root):** `{"content": "New comment"}`
**Req (Reply):** `{"content": "Reply", "parentId": "c1"}`
**Res:** `{"id": "c3", "level": 1, "reactions": {}, "myReaction": null}`

### 4. POST /api/comments/:id/react

**Req:** `{"type": "LOVE"}`
**Res:** `{"reactions": {"LIKE": 5, "LOVE": 3}, "myReaction": "LOVE"}`

### 5. PUT/DELETE /api/comments/:id

Tương tự trước, cascade reactions/children.[^2]
