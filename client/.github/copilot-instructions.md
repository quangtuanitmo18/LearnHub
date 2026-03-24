# Project Rules & Conventions

> **Generated from codebase analysis** - These rules reflect the existing patterns and conventions used throughout the project.

---

## 1. General Principles

### Technology Stack

- **Framework**: Next.js 15.4.4 with App Router
- **React**: 19.1.0
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Data Fetching**: TanStack Query (React Query) v5
- **State Management**: Zustand v5
- **Forms**: React Hook Form + Yup validation
- **Authentication**: NextAuth v4
- **Real-time**: Socket.io Client
- **Rich Text**: TipTap Editor

### Core Principles

1. **Type Safety First**: All code must be fully typed with TypeScript
2. **Client/Server Separation**: Use `"use client"` directive for interactive components
3. **Component-Driven**: Build reusable, composable components
4. **Service Layer Pattern**: All API calls go through service classes
5. **Hook-Based Data Fetching**: Use custom hooks wrapping TanStack Query
6. **Permission-Based Access**: RBAC with resource:action pattern
7. **Error Handling**: Graceful degradation with fallback values
8. **Code Organization**: Feature-based folder structure

---

## 2. Folder & File Structure Rules

### Root Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (protected)/        # Route group for authenticated routes
│   ├── (public)/           # Route group for public routes
│   ├── admin/              # Admin dashboard routes
│   ├── auth/               # Authentication routes
│   └── api/                # API routes (Next.js API)
├── components/             # React components
│   ├── ui/                 # Shadcn UI base components
│   ├── admin/              # Admin-specific components
│   ├── auth/               # Auth-related components
│   ├── table/              # Reusable table components
│   └── [feature]/          # Feature-specific components
├── hooks/                  # Custom React hooks
├── services/               # API service classes
├── stores/                 # Zustand stores
├── types/                  # TypeScript type definitions
├── validators/             # Yup validation schemas
├── lib/                    # Core utilities and configs
├── configs/                # Configuration constants
├── constants/              # Application constants
└── utils/                  # Utility functions
```

### Naming Conventions

#### Files

- **Components**: `kebab-case.tsx` (e.g., `course-card.tsx`, `user-action-dialog.tsx`)
- **Hooks**: `use-kebab-case.ts` (e.g., `use-courses.ts`, `use-auth.ts`)
- **Services**: `kebab-case.ts` (e.g., `courses.ts`, `auth.ts`)
- **Stores**: `kebab-case-store.ts` (e.g., `auth-store.ts`)
- **Types**: `kebab-case.ts` (e.g., `course.ts`, `user.ts`)
- **Validators**: `kebab-case.validator.ts` (e.g., `course.validator.ts`)
- **Constants**: `kebab-case.ts` (e.g., `pagination.ts`, `table.ts`)
- **Configs**: `kebab-case.ts` (e.g., `permission.ts`, `routes.ts`)

#### Components

- **Component Names**: PascalCase (e.g., `CourseCard`, `UserActionDialog`)
- **Props Interfaces**: `ComponentNameProps` (e.g., `CourseCardProps`)
- **Export Pattern**: Named exports preferred (e.g., `export function CourseCard()`)

#### Variables & Functions

- **Variables**: camelCase (e.g., `courseData`, `isLoading`)
- **Functions**: camelCase (e.g., `getCourses`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_PAGE_SIZE`, `API_BASE_URL`)
- **Enums**: PascalCase (e.g., `CourseStatus`, `CourseLevel`)

#### Types & Interfaces

- **Interfaces**: PascalCase with `I` prefix for domain entities (e.g., `ICourse`, `IUser`)
- **Types**: PascalCase (e.g., `CourseSchema`, `CreateCourseRequest`)
- **Enums**: PascalCase (e.g., `CourseStatus`, `CourseLevel`)

### Route Groups

- Use `(protected)` for authenticated user routes
- Use `(public)` for public-facing routes
- Use `(home)` for homepage-specific routes
- Route groups are for organization only, not part of URL

### Page Components

- **Location**: `app/[route]/page.tsx`
- **Pattern**: Default export of page component
- **Naming**: Match route name (e.g., `/courses` → `courses/page.tsx`)

### Page-Specific Components

- **Location**: `app/[route]/components/`
- **Naming**: Feature-specific (e.g., `courses-table.tsx`, `course-action-dialog.tsx`)
- **Scope**: Only used within that page/route

---

## 3. Coding Rules (Do / Don't)

### DO

#### TypeScript

- ✅ Use strict TypeScript with proper types for all functions, props, and variables
- ✅ Prefer `interface` over `type` for object shapes
- ✅ Use `type` for unions, intersections, and computed types
- ✅ Define types in separate files under `src/types/`
- ✅ Use `as const` for constant objects to preserve literal types
- ✅ Use generic types for reusable components (e.g., `DataTable<TData>`)

#### Components

- ✅ Add `"use client"` directive to all interactive components
- ✅ Use functional components with TypeScript interfaces
- ✅ Extract reusable logic into custom hooks
- ✅ Use named exports for components
- ✅ Keep components focused and single-purpose
- ✅ Use composition over inheritance
- ✅ Memoize expensive computations with `useMemo`
- ✅ Use `useCallback` for event handlers passed to children
- ✅ Use dynamic imports for heavy components: `dynamic(() => import(...), { ssr: false })`

#### State Management

- ✅ Use TanStack Query for server state (API data)
- ✅ Use Zustand for client state (UI state, auth state)
- ✅ Create custom hooks wrapping TanStack Query hooks
- ✅ Use query key factories for consistent cache keys
- ✅ Invalidate queries after mutations
- ✅ Use optimistic updates when appropriate

#### Forms

- ✅ Use React Hook Form with Yup validation
- ✅ Define validation schemas in `src/validators/`
- ✅ Use `yupResolver` from `@hookform/resolvers/yup`
- ✅ Use `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage` from Shadcn UI
- ✅ Handle form submission with `handleSubmit` from React Hook Form
- ✅ Show loading states during submission (`isSubmitting`)

#### API & Services

- ✅ Create service classes in `src/services/`
- ✅ Use `ApiService` static methods (get, post, put, patch, delete)
- ✅ Define endpoints as const objects at top of service file
- ✅ Return typed data from service methods
- ✅ Handle errors gracefully with fallback values
- ✅ Use try-catch for optional operations (return empty arrays/objects on error)

#### Error Handling

- ✅ Use try-catch blocks in service methods
- ✅ Return fallback values (empty arrays, default objects) on error
- ✅ Show user-friendly error messages with `toast.error()`
- ✅ Handle 401 errors in API interceptor (auto-logout)
- ✅ Use error boundaries for component-level errors

#### Styling

- ✅ Use Tailwind CSS utility classes
- ✅ Use `cn()` utility from `@/lib/utils` for conditional classes
- ✅ Follow mobile-first responsive design
- ✅ Use Shadcn UI components as base
- ✅ Keep custom CSS in `app/styles/` directory

#### Code Organization

- ✅ Group related imports: React, Next.js, third-party, local
- ✅ Use absolute imports with `@/` alias
- ✅ Create index files for barrel exports
- ✅ Keep files focused and under 300 lines when possible
- ✅ Extract complex logic into separate functions/hooks

### DON'T

#### TypeScript

- ❌ Don't use `any` type (use `unknown` if type is truly unknown)
- ❌ Don't use `@ts-ignore` or `@ts-expect-error` without justification
- ❌ Don't mix `interface` and `type` for the same entity
- ❌ Don't export types from component files (use `src/types/`)

#### Components

- ❌ Don't use class components
- ❌ Don't mix server and client components in same file
- ❌ Don't use `useEffect` for data fetching (use TanStack Query)
- ❌ Don't create components over 500 lines (split into smaller components)
- ❌ Don't use inline styles (use Tailwind classes)
- ❌ Don't forget `"use client"` on interactive components

#### State Management

- ❌ Don't use `useState` for server data (use TanStack Query)
- ❌ Don't store server data in Zustand stores
- ❌ Don't create multiple stores for same domain (consolidate)
- ❌ Don't forget to invalidate queries after mutations

#### API & Services

- ❌ Don't call API directly from components (use service classes)
- ❌ Don't use `fetch` directly (use `ApiService`)
- ❌ Don't hardcode API endpoints (use constants)
- ❌ Don't ignore errors (handle gracefully)

#### Forms

- ❌ Don't use uncontrolled inputs (always use React Hook Form)
- ❌ Don't validate in component logic (use Yup schemas)
- ❌ Don't forget to reset form after successful submission
- ❌ Don't skip loading states during submission

#### Code Organization

- ❌ Don't create deeply nested folder structures (> 3 levels)
- ❌ Don't mix concerns (separate UI, logic, data)
- ❌ Don't duplicate code (extract to shared utilities)
- ❌ Don't use relative imports for local files (use `@/`)

---

## 4. Architecture & Data Flow

### Data Flow Pattern

```
Component
  ↓
Custom Hook (useCourses, useCreateCourse)
  ↓
Service Class (CoursesService)
  ↓
ApiService (Generic HTTP client)
  ↓
API Client (Axios instance with interceptors)
  ↓
Backend API
```

### Component Hierarchy

```
Page Component (app/[route]/page.tsx)
  ↓
Feature Components (app/[route]/components/)
  ↓
Reusable Components (src/components/)
  ↓
UI Components (src/components/ui/)
```

### State Management Strategy

#### Server State (TanStack Query)

- **Purpose**: Data from API
- **Location**: Custom hooks in `src/hooks/`
- **Pattern**:
  ```typescript
  export function useCourses(params) {
    return useQuery({
      queryKey: courseKeys.list(params),
      queryFn: () => CoursesService.getCourses(params),
    });
  }
  ```

#### Client State (Zustand)

- **Purpose**: UI state, auth state, editor state
- **Location**: Stores in `src/stores/`
- **Pattern**:
  ```typescript
  export const useAuthStore = create<AuthState>()(
    devtools((set, get) => ({ ... }))
  );
  ```

#### Local State (useState)

- **Purpose**: Component-specific UI state (dialogs, form inputs)
- **Location**: Within component
- **Pattern**: `const [isOpen, setIsOpen] = useState(false)`

### Query Key Pattern

```typescript
export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (filters) => [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id) => [...courseKeys.details(), id] as const,
};
```

### Mutation Pattern

```typescript
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => CoursesService.createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create course");
    },
  });
}
```

---

## 5. API & Backend Interaction

### Service Class Pattern

```typescript
// 1. Define endpoints
const ENDPOINTS = {
  COURSES: "/courses",
  COURSE: (id: string) => `/courses/${id}`,
} as const;

// 2. Create service class
export class CoursesService {
  static async getCourses(
    params: CoursesListParams
  ): Promise<CoursesListResponse> {
    try {
      return await ApiService.get<CoursesListResponse>(
        ENDPOINTS.COURSES,
        params as Record<string, unknown>
      );
    } catch {
      // Return fallback on error
      return {
        result: [],
        meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 },
      };
    }
  }
}
```

### API Response Structure

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

### Error Handling

- **401 Unauthorized**: Handled in API interceptor (auto-logout)
- **Network Errors**: Return user-friendly message
- **Validation Errors**: Return field-specific errors in `errors` object
- **Service Methods**: Always return fallback values on error

### Authentication

- **Token Storage**: `localStorage` (access_token, refresh_token)
- **Token Injection**: Automatic via Axios interceptor
- **Auth State**: Managed in Zustand store (`auth-store.ts`)
- **Protected Routes**: Use `ProtectedRoute` component with resource/action

---

## 6. Common Anti-Patterns Found

### ❌ Anti-Pattern: Direct API Calls in Components

```typescript
// DON'T
const response = await fetch("/api/courses");
```

```typescript
// DO
const { data } = useCourses(params);
```

### ❌ Anti-Pattern: useState for Server Data

```typescript
// DON'T
const [courses, setCourses] = useState([]);
useEffect(() => {
  fetchCourses().then(setCourses);
}, []);
```

```typescript
// DO
const { data: courses } = useCourses(params);
```

### ❌ Anti-Pattern: Inline Validation

```typescript
// DON'T
if (!title || title.length < 3) {
  setError("Title too short");
}
```

```typescript
// DO
const schema = yup.object({ title: yup.string().min(3).required() });
```

### ❌ Anti-Pattern: Hardcoded Routes

```typescript
// DON'T
router.push("/admin/courses");
```

```typescript
// DO
router.push(ROUTE_CONFIG.ADMIN.COURSES);
```

### ❌ Anti-Pattern: Missing Error Handling

```typescript
// DON'T
const data = await CoursesService.getCourses();
```

```typescript
// DO
try {
  const data = await CoursesService.getCourses();
} catch {
  return { result: [], meta: defaultMeta };
}
```

### ❌ Anti-Pattern: Inconsistent Query Keys

```typescript
// DON'T
useQuery({ queryKey: ["courses"] });
useQuery({ queryKey: ["course-list"] });
```

```typescript
// DO
useQuery({ queryKey: courseKeys.list(params) });
```

---

## 7. Recommendations (Only if Clearly Needed)

### Testing

- **Current State**: No test files found
- **Recommendation**: Consider adding tests for:
  - Critical business logic (services, validators)
  - Complex hooks (data fetching, state management)
  - Reusable components (table, forms)

### Documentation

- **Current State**: Limited inline documentation
- **Recommendation**: Add JSDoc comments for:
  - Public service methods
  - Complex utility functions
  - Custom hooks

### Performance

- **Current State**: Good use of memoization and dynamic imports
- **Recommendation**: Consider:
  - Virtual scrolling for large tables
  - Image optimization (Next.js Image component)
  - Code splitting for route groups

### Error Boundaries

- **Current State**: Basic error handling
- **Recommendation**: Add React Error Boundaries for:
  - Route-level error handling
  - Component tree isolation

---

## Quick Reference

### File Naming Checklist

- [ ] Component files: `kebab-case.tsx`
- [ ] Hook files: `use-kebab-case.ts`
- [ ] Service files: `kebab-case.ts`
- [ ] Type files: `kebab-case.ts`
- [ ] Validator files: `kebab-case.validator.ts`

### Component Checklist

- [ ] `"use client"` directive for interactive components
- [ ] TypeScript interface for props
- [ ] Named export
- [ ] Uses custom hooks for data fetching
- [ ] Error handling implemented
- [ ] Loading states shown

### Service Checklist

- [ ] Endpoints defined as const
- [ ] Static methods
- [ ] Typed return values
- [ ] Error handling with fallbacks
- [ ] Uses `ApiService` methods

### Hook Checklist

- [ ] Query key factory defined
- [ ] Uses TanStack Query hooks
- [ ] Proper error handling
- [ ] Cache invalidation on mutations
- [ ] Toast notifications for errors

---

**Last Updated**: Generated from codebase analysis
**Maintained By**: Development Team
