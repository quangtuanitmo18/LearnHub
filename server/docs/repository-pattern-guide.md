# Repository Pattern Documentation

## Overview

This project implements the **Repository Pattern** to separate data access logic from business logic. The repository layer sits between the service layer and the database, providing a clean abstraction for data operations.

## Architecture Layers

```
Controller → Service → Repository → BaseService → PrismaService → Database
```

### Layer Responsibilities

1. **Controller**: Handles HTTP requests, validation, and response formatting
2. **Service**: Contains business logic and orchestrates operations
3. **Repository**: Provides data access methods and abstractions
4. **BaseService**: Generic CRUD operations and pagination
5. **PrismaService**: Database client connection

## Structure

```
src/modules/role/
├── role.controller.ts      # HTTP endpoints
├── role.service.ts          # Business logic
├── role.repository.ts       # Role data access
├── user.repository.ts       # User data access (for role assignment)
├── role.module.ts           # Module configuration
└── dto/
    └── role.dto.ts          # Data transfer objects
```

## Implementation Example: Role Module

### 1. Repository Layer

#### role.repository.ts

```typescript
import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleRepository extends BaseService<
  Prisma.RoleGetPayload<{ include: { users: true } }>,
  CreateRoleDto,
  UpdateRoleDto,
  Prisma.RoleWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Role;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'name',
      defaultSortOrder: 'asc',
      searchFields: ['name', 'description'],
    });
  }

  // Custom repository methods
  async findByName(name: string) {
    return this.findOneOrNull({ name });
  }

  async findWithUsers(id: string) {
    return this.findOne(
      { id },
      {
        users: {
          select: { id: true, username: true, email: true },
        },
      },
    );
  }

  async validateUniqueName(name: string, excludeId?: string) {
    return this.checkUniqueness('name', name, excludeId);
  }
}
```

### 2. Service Layer

#### role.service.ts

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { UserRepository } from './user.repository';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createRole(createRoleDto: CreateRoleDto) {
    await this.roleRepository.validateUniqueName(createRoleDto.name);
    return this.roleRepository.create(createRoleDto);
  }

  async getAllRoles(paginationQuery) {
    return this.roleRepository.findAll(paginationQuery);
  }

  async getRoleById(id: string) {
    return this.roleRepository.findWithUsers(id);
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    if (updateRoleDto.name) {
      await this.roleRepository.validateUniqueName(updateRoleDto.name, id);
    }
    return this.roleRepository.update({ id }, updateRoleDto);
  }

  async deleteRole(id: string) {
    const isAssigned = await this.roleRepository.isAssignedToUsers(id);
    if (isAssigned) {
      throw new BadRequestException('Cannot delete role assigned to users');
    }
    await this.roleRepository.delete({ id });
    return { message: 'Role deleted successfully' };
  }

  async assignRoleToUser(userId: string, roleId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.roleRepository.findOne({ id: roleId });

    const hasRole = user.roles.some((r) => r.id === roleId);
    if (hasRole) throw new BadRequestException('User already has this role');

    return this.userRepository.assignRole(userId, roleId);
  }
}
```

### 3. Module Configuration

```typescript
import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';
import { UserRepository } from './user.repository';

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, UserRepository],
  exports: [RoleService, RoleRepository],
})
export class RoleModule {}
```

## Benefits of Repository Pattern

### 1. Separation of Concerns

- **Service**: Business logic only (validation, orchestration)
- **Repository**: Data access only (queries, database operations)

### 2. Testability

```typescript
// Easy to mock repositories in tests
const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
};
```

### 3. Reusability

```typescript
// Repository can be used by multiple services
export class RoleService {
  constructor(private roleRepository: RoleRepository) {}
}

export class AdminService {
  constructor(private roleRepository: RoleRepository) {}
}
```

### 4. Database Abstraction

- Easy to switch database implementations
- Database logic centralized in repositories
- Services don't need to know about Prisma

### 5. Code Organization

```
❌ Before: Service with mixed concerns
✅ After: Clear separation
  - Controller → routing
  - Service → business logic
  - Repository → data access
```

## Repository Methods

### Inherited from BaseService

```typescript
// CRUD Operations
findAll(paginationQuery, additionalWhere);
findOne(where, includeRelations);
findOneOrNull(where, includeRelations);
create(data, includeRelations);
update(where, data, includeRelations);
delete where;

// Query Methods
findMany(where, orderBy, includeRelations);
findFirst(where, orderBy);
exists(where);
count(where);

// Batch Operations
updateMany(where, data);
deleteMany(where);

// Validation
checkUniqueness(field, value, excludeId); // protected
```

### Custom Repository Methods

Add domain-specific methods to repositories:

```typescript
@Injectable()
export class RoleRepository extends BaseService<...> {
  // Custom finder methods
  async findByName(name: string) {
    return this.findOneOrNull({ name });
  }

  async findActiveRoles() {
    return this.findMany({ isActive: true });
  }

  // Custom validation methods
  async validateUniqueName(name: string, excludeId?: string) {
    return this.checkUniqueness('name', name, excludeId);
  }

  // Custom business methods
  async isAssignedToUsers(id: string): Promise<boolean> {
    const role = await this.findOne({ id }, {
      users: { select: { id: true }, take: 1 }
    });
    return role?.users?.length > 0;
  }
}
```

## Best Practices

### 1. Keep Services Thin

```typescript
// ❌ BAD: Service with database logic
async updateRole(id: string, data: UpdateRoleDto) {
  const role = await this.prisma.role.findUnique({ where: { id } });
  if (!role) throw new NotFoundException();
  return this.prisma.role.update({ where: { id }, data });
}

// ✅ GOOD: Service with business logic only
async updateRole(id: string, data: UpdateRoleDto) {
  if (data.name) {
    await this.roleRepository.validateUniqueName(data.name, id);
  }
  return this.roleRepository.update({ id }, data);
}
```

### 2. Repository Returns Data

```typescript
// Repository should return data, not throw business exceptions
async findByEmail(email: string) {
  return this.findOneOrNull({ email }); // Returns null if not found
}

// Service handles business logic and exceptions
async login(email: string, password: string) {
  const user = await this.userRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }
  // ... business logic
}
```

### 3. Use Type Safety

```typescript
export class RoleRepository extends BaseService<
  Prisma.RoleGetPayload<{ include: { users: true } }>, // Entity type
  CreateRoleDto, // Create type
  UpdateRoleDto, // Update type
  Prisma.RoleWhereUniqueInput // Where type
> {
  protected modelName = Prisma.ModelName.Role;
}
```

### 4. Export Repositories

```typescript
// Export repositories for use in other modules
@Module({
  providers: [RoleRepository],
  exports: [RoleRepository], // ✅ Export for reuse
})
export class RoleModule {}

// Use in another module
@Module({
  imports: [RoleModule], // Import RoleModule
  providers: [AdminService],
})
export class AdminModule {}
```

### 5. Domain-Specific Repositories

```typescript
// Create focused repositories for specific domains
export class UserRepository extends BaseService<...> {
  async findByEmail(email: string) { }
  async findWithRoles(id: string) { }
}

export class RoleRepository extends BaseService<...> {
  async findByName(name: string) { }
  async findWithUsers(id: string) { }
}

// Avoid generic "DataRepository" or "DatabaseRepository"
```

## Migration Guide

### Step 1: Create Repository

```typescript
// Create: src/modules/[module]/[module].repository.ts
import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class YourRepository extends BaseService<...> {
  protected modelName = Prisma.ModelName.YourModel;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      searchFields: ['name', 'description'],
    });
  }
}
```

### Step 2: Update Service

```typescript
// Before
constructor(private prismaService: PrismaService) {}

// After
constructor(private yourRepository: YourRepository) {}
```

### Step 3: Replace Direct Prisma Calls

```typescript
// Before
this.prisma.model.findMany({ ... })

// After
this.yourRepository.findAll(paginationQuery)
```

### Step 4: Update Module

```typescript
@Module({
  providers: [YourService, YourRepository],
  exports: [YourService, YourRepository],
})
export class YourModule {}
```

## Testing with Repositories

```typescript
describe('RoleService', () => {
  let service: RoleService;
  let repository: jest.Mocked<RoleRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: RoleRepository,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            validateUniqueName: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RoleService);
    repository = module.get(RoleRepository);
  });

  it('should create a role', async () => {
    const dto = { name: 'Admin', description: 'Admin role' };
    repository.create.mockResolvedValue({ id: '1', ...dto });

    const result = await service.createRole(dto);

    expect(repository.validateUniqueName).toHaveBeenCalledWith('Admin');
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(result.name).toBe('Admin');
  });
});
```

## Summary

The repository pattern provides:

- ✅ Clear separation between business logic and data access
- ✅ Improved testability with easy mocking
- ✅ Better code organization and maintainability
- ✅ Reusable data access methods
- ✅ Type-safe database operations
- ✅ Centralized data access logic
- ✅ Easy to extend with custom methods

Use this pattern consistently across all modules for a clean, maintainable codebase.
