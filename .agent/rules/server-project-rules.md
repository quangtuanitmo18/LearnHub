---
alwaysApply: true
---

# Project Rules - NestJS Tutorial Hell

## 1. General Principles

### Architecture

- **Layered Architecture**: Follow strict separation: Controller → Service → Repository → BaseService → PrismaService → Database
- **Module-Based**: Each feature must be a self-contained module with its own controller, service, repository, DTOs, and module file
- **Repository Pattern**: All data access MUST go through repository classes extending `BaseService`
- **Dependency Injection**: Use NestJS DI - inject dependencies via constructor, never instantiate classes directly
- **Single Responsibility**: Each class/function should have one clear purpose

### Code Organization

- **File Naming**: Use kebab-case for files: `category.controller.ts`, `user.service.ts`, `auth.guard.ts`
- **Class Naming**: Use PascalCase for classes: `CategoryController`, `UserService`, `AuthGuard`
- **Module Structure**: Each module must follow: `[module].controller.ts`, `[module].service.ts`, `[module].repository.ts`, `[module].module.ts`, `dto/[module].dto.ts`
- **Shared Code**: Place reusable code in `src/shared/` directory
- **Constants**: Store enum-like constants in `src/shared/constants/[resource].constant.ts`

### TypeScript Standards

- **Strict Types**: Use TypeScript generics for type safety, especially with BaseService
- **Prisma Types**: Always use generated Prisma types: `Prisma.ModelName`, `Prisma.[Model]WhereUniqueInput`, `Prisma.[Model]GetPayload`
- **No `any` Types**: Avoid `any` except where absolutely necessary (e.g., Prisma model access)
- **Interfaces**: Use interfaces for DTOs and type definitions
- **Type Exports**: Export types alongside constants when needed

## 2. Do / Don't Rules

### DO

#### Module Structure

- ✅ DO create a repository class extending `BaseService` for every module
- ✅ DO place DTOs in a `dto/` subdirectory within each module
- ✅ DO export both Service and Repository from module for potential reuse
- ✅ DO use `@Global()` decorator only for `SharedModule`
- ✅ DO register all providers (Service, Repository) in module's `providers` array

#### Controllers

- ✅ DO use `@UseGuards(PermissionGuard)` at controller level (or method level)
- ✅ DO use `@RequirePermissions(PERMISSIONS.[RESOURCE]_[ACTION])` for protected routes
- ✅ DO use `@Public()` decorator for routes that don't require authentication
- ✅ DO use `@ResponseMessage('Success message')` decorator on every endpoint
- ✅ DO use `@CurrentUser()` decorator to get authenticated user data
- ✅ DO use `@Query()` with `PaginationQueryDto` for list endpoints
- ✅ DO use proper HTTP decorators: `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`
- ✅ DO keep controllers thin - delegate all business logic to services

#### Services

- ✅ DO inject Repository in service constructor, never PrismaService directly
- ✅ DO perform business logic validation in services (e.g., uniqueness checks)
- ✅ DO throw appropriate NestJS exceptions: `NotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`
- ✅ DO check for entity existence before update/delete operations
- ✅ DO use `findOneOrNull()` when checking existence, then throw exception in service if needed
- ✅ DO use `findOne()` when you expect the entity to exist (it throws NotFoundException automatically)

#### Repositories

- ✅ DO extend `BaseService` with proper generic type parameters
- ✅ DO set `protected modelName = Prisma.ModelName.[Model]` in repository
- ✅ DO configure BaseService options in constructor: `defaultSortBy`, `defaultSortOrder`, `searchFields`, `selectFields` or `includeRelations`
- ✅ DO add custom repository methods for domain-specific queries (e.g., `findByName()`, `isSlugExists()`)
- ✅ DO use `checkUniqueness()` protected method for validation helpers
- ✅ DO return `null` from repository methods when entity not found (let service handle exceptions)

#### DTOs

- ✅ DO use `class-validator` decorators: `@IsString()`, `@IsOptional()`, `@IsEnum()`, `@IsArray()`, `@IsUUID()`
- ✅ DO use `@Type(() => Number)` for numeric query parameters
- ✅ DO create separate DTOs: `Create[Resource]Dto`, `Update[Resource]Dto`, `BulkDelete[Resource]Dto`
- ✅ DO make all UpdateDto fields optional with `@IsOptional()`
- ✅ DO use constants for enum values from `src/shared/constants/[resource].constant.ts`
- ✅ DO validate array inputs with `@ArrayNotEmpty()` and `{ each: true }` for nested validation

#### Error Handling

- ✅ DO let GlobalExceptionFilter handle all exceptions
- ✅ DO use specific exception types with descriptive messages
- ✅ DO validate input data - let ValidationPipe handle DTO validation automatically
- ✅ DO check business rules in services and throw appropriate exceptions

#### Authentication & Authorization

- ✅ DO use `@Public()` decorator for public endpoints (login, register, etc.)
- ✅ DO use `@RequirePermissions()` decorator for permission-based access control
- ✅ DO use `@CurrentUser()` decorator to access authenticated user in controllers
- ✅ DO check user permissions in PermissionGuard (handled automatically)
- ✅ DO access `request.user` set by AuthGuard (contains JWT payload)

#### Response Format

- ✅ DO let ResponseInterceptor format all responses automatically
- ✅ DO use `@ResponseMessage()` decorator for custom success messages
- ✅ DO return data directly from service - interceptor wraps it in standard format
- ✅ DO return `PaginatedResponseDto` from BaseService for paginated results

#### Constants & Configuration

- ✅ DO define constants as `const` objects with `as const` assertion
- ✅ DO export TypeScript types for constant values
- ✅ DO store constants in `src/shared/constants/[resource].constant.ts`
- ✅ DO use environment-specific config files in `src/shared/configs/env/`

### DON'T

#### Module Structure

- ❌ DON'T access PrismaService directly in services - use Repository instead
- ❌ DON'T put business logic in controllers
- ❌ DON'T put business logic in repositories - only data access
- ❌ DON'T create circular dependencies between modules
- ❌ DON'T skip the repository layer - always use repositories

#### Controllers

- ❌ DON'T perform database queries in controllers
- ❌ DON'T skip `@ResponseMessage()` decorator
- ❌ DON'T manually format responses - let ResponseInterceptor handle it
- ❌ DON'T access request object directly for user data - use `@CurrentUser()` decorator
- ❌ DON'T forget to add `@UseGuards(PermissionGuard)` for protected routes

#### Services

- ❌ DON'T inject PrismaService directly - inject Repository instead
- ❌ DON'T perform database queries directly - use repository methods
- ❌ DON'T throw generic Error - use NestJS exceptions
- ❌ DON'T return error objects - throw exceptions instead
- ❌ DON'T skip existence checks before update/delete

#### Repositories

- ❌ DON'T throw business exceptions from repositories (except NotFoundException from `findOne()`)
- ❌ DON'T access Prisma models directly - use `this.model` getter from BaseService
- ❌ DON'T skip setting `modelName` property
- ❌ DON'T forget to call `super()` with PrismaService and options
- ❌ DON'T implement CRUD methods manually - use BaseService methods

#### DTOs

- ❌ DON'T use `any` type in DTOs
- ❌ DON'T skip validation decorators
- ❌ DON'T mix Create and Update DTOs
- ❌ DON'T forget `@IsOptional()` on UpdateDto fields
- ❌ DON'T hardcode enum values - use constants

#### Error Handling

- ❌ DON'T catch exceptions unnecessarily - let GlobalExceptionFilter handle them
- ❌ DON'T return error responses manually - throw exceptions
- ❌ DON'T use try-catch in controllers unless absolutely necessary
- ❌ DON'T create custom error response formats

#### Authentication & Authorization

- ❌ DON'T skip `@Public()` decorator on public routes
- ❌ DON'T manually check JWT tokens - use AuthGuard
- ❌ DON'T manually check permissions - use PermissionGuard with `@RequirePermissions()`
- ❌ DON'T access user data from request object directly - use `@CurrentUser()` decorator

#### Response Format

- ❌ DON'T manually wrap responses in success objects
- ❌ DON'T return `{ success: true, data: ... }` - return data directly
- ❌ DON'T skip `@ResponseMessage()` decorator

## 3. Architecture & Data Flow Rules

### Request Flow

```
HTTP Request
  → Controller (routing, validation, guards)
  → Service (business logic, validation)
  → Repository (data access)
  → BaseService (generic CRUD)
  → PrismaService (database client)
  → Database
```

### Response Flow

```
Service returns data
  → ResponseInterceptor (wraps in standard format)
  → GlobalExceptionFilter (catches any exceptions)
  → HTTP Response
```

### Module Dependencies

- **SharedModule**: Global module providing PrismaService, JwtService, S3Service
- **Feature Modules**: Import SharedModule implicitly (global), can import other feature modules if needed
- **AppModule**: Imports all feature modules and configures global providers (filters, interceptors, guards)

### Data Access Pattern

1. **Repository extends BaseService**: Provides generic CRUD operations
2. **Service injects Repository**: Uses repository for all data access
3. **Controller injects Service**: Uses service for business operations
4. **BaseService handles**: Pagination, search, sorting, relations, validation helpers

### Permission System

- **Permissions**: Defined in `src/shared/configs/permission.ts` as `RESOURCE:ACTION` format (e.g., `category:create`)
- **PermissionGuard**: Automatically checks user permissions from JWT payload
- **Super Admin**: Users with "Super Admin" role bypass permission checks
- **Public Routes**: Use `@Public()` decorator to skip authentication
- **Permission Decorator**: Use `@RequirePermissions(PERMISSIONS.XXX)` on routes

### Validation Flow

1. **DTO Validation**: Automatic via `ValidationPipe` (global, configured in main.ts)
2. **Business Validation**: Manual checks in services (uniqueness, existence, business rules)
3. **Exception Handling**: GlobalExceptionFilter formats validation errors consistently

### Pagination Pattern

- **Query DTO**: Use `PaginationQueryDto` with `@Query()` decorator
- **Repository**: Use `findAll(paginationQuery, additionalWhere?)` from BaseService
- **Response**: Returns `PaginatedResponseDto` with `result` array and `meta` object
- **Default Values**: page=1, limit=10, sortOrder='desc'

## 4. Forbidden Practices

### Architecture Violations

- ❌ **FORBIDDEN**: Accessing PrismaService directly in services (must use Repository)
- ❌ **FORBIDDEN**: Putting database queries in controllers
- ❌ **FORBIDDEN**: Putting business logic in repositories
- ❌ **FORBIDDEN**: Skipping the repository layer
- ❌ **FORBIDDEN**: Creating circular module dependencies
- ❌ **FORBIDDEN**: Using `@Global()` on feature modules (only SharedModule)

### Code Quality Violations

- ❌ **FORBIDDEN**: Using `any` type without justification
- ❌ **FORBIDDEN**: Skipping TypeScript generics in BaseService extensions
- ❌ **FORBIDDEN**: Hardcoding values that should be constants
- ❌ **FORBIDDEN**: Duplicating code instead of using BaseService
- ❌ **FORBIDDEN**: Manual pagination implementation (use BaseService.findAll)

### Security Violations

- ❌ **FORBIDDEN**: Skipping authentication on protected routes
- ❌ **FORBIDDEN**: Skipping permission checks on admin routes
- ❌ **FORBIDDEN**: Exposing sensitive data in responses (use selectFields)
- ❌ **FORBIDDEN**: Bypassing validation with `@UsePipes()` to skip ValidationPipe
- ❌ **FORBIDDEN**: Manual JWT verification (use AuthGuard)

### Error Handling Violations

- ❌ **FORBIDDEN**: Catching exceptions just to return error objects
- ❌ **FORBIDDEN**: Creating custom error response formats
- ❌ **FORBIDDEN**: Returning null/undefined for errors instead of throwing exceptions
- ❌ **FORBIDDEN**: Using generic Error instead of NestJS exceptions

### Response Format Violations

- ❌ **FORBIDDEN**: Manually wrapping responses in success objects
- ❌ **FORBIDDEN**: Skipping `@ResponseMessage()` decorator
- ❌ **FORBIDDEN**: Returning different response formats per endpoint
- ❌ **FORBIDDEN**: Including message in service return data when using `@ResponseMessage()`

### Validation Violations

- ❌ **FORBIDDEN**: Skipping DTO validation decorators
- ❌ **FORBIDDEN**: Performing validation in controllers instead of DTOs/services
- ❌ **FORBIDDEN**: Using manual validation instead of class-validator
- ❌ **FORBIDDEN**: Skipping business rule validation in services

### Database Access Violations

- ❌ **FORBIDDEN**: Using raw SQL queries (use Prisma)
- ❌ **FORBIDDEN**: Accessing `prismaService.[model]` directly in services
- ❌ **FORBIDDEN**: Implementing CRUD methods manually instead of using BaseService
- ❌ **FORBIDDEN**: Skipping existence checks before update/delete operations

## 5. File Structure Standards

### Module Structure

```
src/modules/[module-name]/
├── [module-name].controller.ts    # HTTP endpoints
├── [module-name].service.ts        # Business logic
├── [module-name].repository.ts     # Data access (extends BaseService)
├── [module-name].module.ts         # Module configuration
└── dto/
    └── [module-name].dto.ts        # Data transfer objects
```

### Shared Structure

```
src/shared/
├── configs/                        # Configuration files
│   ├── configuration.ts
│   ├── validation.ts
│   ├── permission.ts
│   └── env/                        # Environment-specific configs
├── constants/                      # Constant definitions
│   └── [resource].constant.ts
├── decorators/                     # Custom decorators
│   ├── current-user.decorator.ts
│   ├── permission.decorator.ts
│   ├── public.decorator.ts
│   └── response-message.decorator.ts
├── dto/                           # Shared DTOs
│   └── pagination.dto.ts
├── filters/                        # Exception filters
│   └── global-exception.filter.ts
├── guards/                        # Auth guards
│   └── permission.guard.ts
├── interceptors/                  # Response interceptors
│   └── response.interceptor.ts
├── pipes/                         # Custom pipes
├── services/                      # Shared services
│   ├── base.service.ts
│   ├── prisma.service.ts
│   └── s3.service.ts
└── shared.module.ts               # Global shared module
```

## 6. Naming Conventions

### Files

- **Controllers**: `[resource].controller.ts` (e.g., `category.controller.ts`)
- **Services**: `[resource].service.ts` (e.g., `category.service.ts`)
- **Repositories**: `[resource].repository.ts` (e.g., `category.repository.ts`)
- **Modules**: `[resource].module.ts` (e.g., `category.module.ts`)
- **DTOs**: `[resource].dto.ts` (e.g., `category.dto.ts`)
- **Constants**: `[resource].constant.ts` (e.g., `category.constant.ts`)
- **Guards**: `[name].guard.ts` (e.g., `auth.guard.ts`)
- **Filters**: `[name].filter.ts` (e.g., `global-exception.filter.ts`)
- **Interceptors**: `[name].interceptor.ts` (e.g., `response.interceptor.ts`)
- **Decorators**: `[name].decorator.ts` (e.g., `permission.decorator.ts`)

### Classes

- **Controllers**: `[Resource]Controller` (e.g., `CategoryController`)
- **Services**: `[Resource]Service` (e.g., `CategoryService`)
- **Repositories**: `[Resource]Repository` (e.g., `CategoryRepository`)
- **Modules**: `[Resource]Module` (e.g., `CategoryModule`)
- **DTOs**: `[Action][Resource]Dto` (e.g., `CreateCategoryDto`, `UpdateCategoryDto`)
- **Guards**: `[Name]Guard` (e.g., `AuthGuard`, `PermissionGuard`)
- **Filters**: `[Name]Filter` (e.g., `GlobalExceptionFilter`)
- **Interceptors**: `[Name]Interceptor` (e.g., `ResponseInterceptor`)

### Variables & Methods

- **Variables**: `camelCase` (e.g., `categoryService`, `paginationQuery`)
- **Methods**: `camelCase` (e.g., `getAllCategories()`, `createCategory()`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `PERMISSIONS`, `CATEGORY_CREATE`)
- **Private Methods**: `camelCase` with underscore prefix not required (TypeScript handles visibility)

### Routes

- **Base Route**: Plural, lowercase (e.g., `/api/v1/categories`)
- **Nested Routes**: Use forward slashes (e.g., `/api/v1/users/avatar/presigned`)
- **Route Parameters**: Use `:id` format (e.g., `/api/v1/categories/:id`)

## 7. API Standards

### Endpoint Patterns

- **List**: `GET /api/v1/[resources]` with pagination query
- **Get One**: `GET /api/v1/[resources]/:id`
- **Create**: `POST /api/v1/[resources]` with CreateDto
- **Update**: `PUT /api/v1/[resources]/:id` with UpdateDto
- **Delete**: `DELETE /api/v1/[resources]/:id`
- **Bulk Delete**: `DELETE /api/v1/[resources]/bulk-delete` with BulkDeleteDto

### Response Format

```typescript
{
  success: boolean;
  statusCode: number;
  message: string;
  data: T; // or PaginatedResponseDto for lists
}
```

### Paginated Response Format

```typescript
{
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    result: T[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}
```

### Error Response Format

```typescript
{
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>; // For validation errors
  timestamp: string;
  path: string;
}
```

## 8. Configuration Standards

### Environment Variables

- Store in `src/shared/configs/env/[NODE_ENV].env`
- Use `ConfigModule` with validation schema
- Access via `ConfigService.get('key')`

### Global Configuration

- **API Prefix**: `/api` (set in main.ts)
- **Versioning**: URI-based, default version `v1`
- **CORS**: Enabled for all origins (`*`)
- **Validation**: Global ValidationPipe with `transform: true`, `whitelist: true`
- **Raw Body**: Enabled for Stripe webhook signature verification

### Global Providers (AppModule)

- `ResponseInterceptor`: Wraps all responses
- `GlobalExceptionFilter`: Handles all exceptions
- `AuthGuard`: Validates JWT tokens (can be bypassed with `@Public()`)
- `PermissionGuard`: Checks user permissions (can be bypassed with `@Public()`)

## 9. Testing Standards

### Test Files

- **Unit Tests**: `[file].spec.ts` in same directory
- **E2E Tests**: `test/[name].e2e-spec.ts`
- **Test Pattern**: Use Jest with `@nestjs/testing`

### Mocking

- Mock repositories in service tests
- Mock services in controller tests
- Use `Test.createTestingModule()` for integration tests

## 10. Documentation Standards

### Code Comments

- Use JSDoc comments for public methods
- Document complex business logic
- Explain "why" not "what" in comments

### Module Documentation

- Document complex modules in `docs/` directory
- Include architecture diagrams if needed
- Provide usage examples

---

**Remember**: These rules are derived from the existing codebase. Follow them strictly to maintain consistency and code quality.
