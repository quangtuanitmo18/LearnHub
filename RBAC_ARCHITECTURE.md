# Role-Based Access Control (RBAC) Architecture

## Overview
LearnHub uses a robust Role-Based Access Control (RBAC) system combined with context-bound ownership checks to secure its APIs and data. The system enforces access policies by granting users specific `Permissions` bundled into `Roles`. Certain actions depend on cross-checking the user's explicit roles against the requested endpoints (`PermissionGuard`), while others evaluate ownership implicitly via JWT user context directly locally within the controllers.

## Database Design

The authorization boundaries are explicitly modeled directly in the Prisma database schema.

### Core Models

#### `Role` Model
A `Role` translates business functions (e.g., "Instructor", "Super Admin", "Content Manager") into technical rules. It holds an array of permission strings representing specific access abilities.
```prisma
model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String
  permissions String[]   // e.g., ["COURSE_CREATE", "BLOG_DELETE"]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now())
  users       User[]
}
```

#### `User` Model
Users can have multiple roles allowing hierarchical and mixed access provisioning.
```prisma
model User {
  id       String @id @default(uuid())
  // ... other fields
  roles    Role[]
}
```

## Backend Implementation (NestJS)

The backend controls access using Custom Global Guards, Decorators, and explicit hardcoded Permission lists to catch semantic discrepancies at compile time.

### 1. Permissions Constant (`PERMISSIONS`)
All distinct permissions are defined centrally in `server/src/shared/configs/permission.ts` to provide strict type safety and auto-completion when assigning decorators to controllers.

### 2. Guards & Decorators
Two custom decorators primarily control routing behaviors:
- `@RequirePermissions(...permissions)`: Specifies which permissions a user must possess to execute the route.
- `@Public()`: Used to completely bypass the default strict restrictions for guest-facing data (e.g., published courses, landing page data, webhooks).

#### `PermissionGuard` Logic Flow
1. **Public Check**: The Guard uses NestJS `Reflector` to check if `@Public()` is present on the route or class. If true, access is instantly granted.
2. **Permission Check**: It looks up the endpoint's requested permissions using the `PERMISSION_KEY`. If the route doesn't require permissions (and isn't explicitly `@Public`), it allows access assuming it's a default authenticated route.
3. **Database Evaluation**: Retrieves the user by `sub` (JWT subject extracted within `request.user`) and fetches nested `roles`.
4. **Super Admin Bypass**: A user with the exact role name `"Super Admin"` automatically bypasses all strict permission-level checks.
5. **Cross-Check**: Matches the string list of `RequirePermissions` against the aggregated array of the `User.roles.permissions`. The request proceeds only if the user possesses at least one matching valid permission.

### 3. Controller-Level Application
The typical architectural flow secures an entire controller module by applying the `PermissionGuard` at the class scope, then specifically overriding the internal methods with requirements or exemptions.

```typescript
@Controller('courses')
@UseGuards(PermissionGuard)
export class CourseController {

  @Get('slug/:slug')
  @Public() // Exempt: Guest view allowed
  async getCourseBySlug(@Param('slug') slug: string) { ... }

  @Post()
  @RequirePermissions(PERMISSIONS.COURSE_CREATE) // Secured: Requires instructor/admin access
  async createCourse(...) { ... }
}
```

### 4. Ownership-bound Contexts (Data Isolation)
Some API actions (like `UserLessonProgress`, `Chat`, or `QuizAttempt`) don't rely entirely on global abstract permissions. They are strictly bound to the user's literal identity.
For these models, `PermissionGuard` acts simply as an authentication shield, and the service layer restricts SQL queries or data modifications by filtering dynamically using `userId` obtained directly from `@CurrentUser('sub')`. This prevents User A from tampering with User B's attempts without needing complex row-level role definitions.

## Frontend Implementation

The frontend (Next.js Client) aligns its navigation visibility and service calls dynamically based on JWT claims and internal state contexts fetching from the Backend.

1. **Routing Strategy**: Client-service methods use correctly mapped URL endpoints that directly align with backend roles (e.g., separating `/api/v1/blogs` for admin arrays and `/api/v1/blogs/published` for guest views).
2. **Context Checks**: Component interactions (e.g., Edit Buttons, Analytics Dashboard links) conditionally render only if the fetched internal user context confirms they possess the administrative rights natively.
3. **Graceful Error Handling**: `401 Unauthenticated` or `403 Forbidden` responses from the backend interceptors trigger redirect hooks or toast messages notifying users cleanly of restricted actions or expiring tokens.

## Developer Guide

### Best Practices for Adding a New Secure Endpoint

1. **Identify Scenario Needs:** Is the endpoint modifying global/admin state, or is it specific solely to the executing user?
2. **Global/Admin Action**: 
   - Define a permission inside the `PERMISSIONS` object (`src/shared/configs/permission.ts`) if it represents a brand new modular action.
   - Attach `@RequirePermissions(PERMISSIONS.NEW_ACTION)` sequentially beneath the verb (`@Get`, `@Post`).
3. **User-scoped Action**:
   - Require the user to be passed via the `@CurrentUser('sub') userId: string` decorator. No explicit permission role definition is needed; build the security constraints directly into the Prisma `where: { id, userId }` service queries.
4. **Guest Read Access**: 
   - Protect the whole Controller with the Guard setup.
   - Opt-out on the specific public endpoint by stacking `@Public()`.
   - **Tip**: Always define explicit static paths (`slug/:slug`, `/stats`) physically **above** dynamically resolved param paths (`:id`) in the controller definition to prevent parameter mapping collisions or route shadowing.
