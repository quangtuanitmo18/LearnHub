# Base Service Documentation

## Overview

The `BaseService` is an abstract service class that provides common CRUD operations and pagination functionality for all services in the application. It reduces code duplication and ensures consistent behavior across all entity services.

## Location

```
src/shared/services/base.service.ts
```

## Features

- ✅ **Generic CRUD Operations**: Create, Read, Update, Delete
- ✅ **Pagination Support**: Built-in pagination with search and sorting
- ✅ **Flexible Search**: Multi-field search including nested relations
- ✅ **Type Safety**: Full TypeScript support with generics
- ✅ **Relation Handling**: Automatic inclusion of related entities
- ✅ **Validation Helpers**: Uniqueness checking and more
- ✅ **Batch Operations**: Update and delete multiple records

## Basic Usage

### 1. Extend the Base Service

```typescript
import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/shared/services/base.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostService extends BaseService<
  Prisma.PostGetPayload<{}>,
  CreatePostDto,
  UpdatePostDto,
  Prisma.PostWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Post;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['title', 'content', 'author.username'],
      includeRelations: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }
}
```

### 2. Generic Type Parameters

The base service accepts four generic type parameters:

1. **T**: The entity type (Prisma model payload)
2. **CreateDto**: DTO for creating new records (optional, defaults to `any`)
3. **UpdateDto**: DTO for updating records (optional, defaults to `any`)
4. **WhereUniqueInput**: Prisma WhereUniqueInput type (optional, defaults to `any`)

### 3. Configuration Options

Pass options to customize the base service behavior:

```typescript
{
  defaultSortBy: 'createdAt',        // Default field to sort by
  defaultSortOrder: 'desc',           // Default sort direction
  searchFields: ['name', 'email'],    // Fields to search in
  includeRelations: { ... },          // Relations to include by default
  selectFields: { ... },              // Fields to select (alternative to include)
}
```

## Available Methods

### Core CRUD Methods

#### `findAll(paginationQuery?, additionalWhere?)`

Get paginated list of records with search and sorting.

```typescript
async getAllPosts(paginationQuery: PaginationQueryDto) {
  return this.findAll(paginationQuery);
}

// With additional filters
async getPublishedPosts(paginationQuery: PaginationQueryDto) {
  return this.findAll(paginationQuery, { published: true });
}
```

#### `findOne(where, includeRelations?)`

Get a single record by unique identifier. Throws `NotFoundException` if not found.

```typescript
async getPostById(id: string) {
  return this.findOne({ id });
}

// With custom relations
async getPostWithComments(id: string) {
  return this.findOne({ id }, {
    comments: true,
    author: { select: { username: true } }
  });
}
```

#### `findOneOrNull(where, includeRelations?)`

Like `findOne` but returns `null` instead of throwing an exception.

```typescript
async findPostBySlug(slug: string) {
  return this.findOneOrNull({ slug });
}
```

#### `create(data, includeRelations?)`

Create a new record.

```typescript
async createPost(createPostDto: CreatePostDto, authorId: string) {
  return this.create({
    ...createPostDto,
    authorId,
  });
}
```

#### `update(where, data, includeRelations?)`

Update an existing record. Throws `NotFoundException` if not found.

```typescript
async updatePost(id: string, updatePostDto: UpdatePostDto) {
  return this.update({ id }, updatePostDto);
}
```

#### `delete(where)`

Delete a record. Throws `NotFoundException` if not found.

```typescript
async deletePost(id: string) {
  return this.delete({ id });
}
```

### Query Methods

#### `findMany(where?, orderBy?, includeRelations?)`

Find multiple records without pagination.

```typescript
async getUserPosts(userId: string) {
  return this.findMany(
    { authorId: userId },
    { createdAt: 'desc' }
  );
}
```

#### `findFirst(where, orderBy?)`

Find the first matching record.

```typescript
async getLatestPost() {
  return this.findFirst({}, { createdAt: 'desc' });
}
```

#### `exists(where)`

Check if a record exists.

```typescript
async isPostExists(id: string): Promise<boolean> {
  return this.exists({ id });
}
```

#### `count(where?)`

Count records matching the criteria.

```typescript
async getUserPostCount(userId: string): Promise<number> {
  return this.count({ authorId: userId });
}
```

### Batch Operations

#### `updateMany(where, data)`

Update multiple records at once.

```typescript
async publishUserPosts(userId: string) {
  return this.updateMany(
    { authorId: userId },
    { published: true }
  );
}
```

#### `deleteMany(where)`

Delete multiple records at once.

```typescript
async deleteOldPosts(date: Date) {
  return this.deleteMany({
    createdAt: { lt: date }
  });
}
```

### Validation Helper

#### `checkUniqueness(field, value, excludeId?)`

Check if a unique field value already exists. Throws `BadRequestException` if it exists.

```typescript
async createUser(createUserDto: CreateUserDto) {
  await this.checkUniqueness('email', createUserDto.email);
  await this.checkUniqueness('username', createUserDto.username);

  return this.create(createUserDto);
}

async updateUser(id: string, updateUserDto: UpdateUserDto) {
  if (updateUserDto.email) {
    await this.checkUniqueness('email', updateUserDto.email, id);
  }

  return this.update({ id }, updateUserDto);
}
```

## Advanced Examples

### Example 1: User Service

```typescript
@Injectable()
export class UserService extends BaseService<
  Prisma.UserGetPayload<{}>,
  CreateUserDto,
  UpdateUserDto,
  Prisma.UserWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.User;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['username', 'email'],
      selectFields: {
        id: true,
        username: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    await this.checkUniqueness('email', createUserDto.email);
    await this.checkUniqueness('username', createUserDto.username);

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async getUserWithRoles(id: string) {
    return this.findOne(
      { id },
      {
        roles: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
          },
        },
      },
    );
  }
}
```

### Example 2: Post Service with Custom Methods

```typescript
@Injectable()
export class PostService extends BaseService<
  Prisma.PostGetPayload<{}>,
  CreatePostDto,
  UpdatePostDto,
  Prisma.PostWhereUniqueInput
> {
  protected modelName = Prisma.ModelName.Post;

  constructor(prismaService: PrismaService) {
    super(prismaService, {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: ['title', 'content', 'author.username'],
      includeRelations: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async createPost(createPostDto: CreatePostDto, authorId: string) {
    return this.create({
      ...createPostDto,
      authorId,
    });
  }

  async getMyPosts(userId: string, paginationQuery: PaginationQueryDto) {
    return this.findAll(paginationQuery, { authorId: userId });
  }

  async getPublishedPosts(paginationQuery: PaginationQueryDto) {
    return this.findAll(paginationQuery, { published: true });
  }

  async updateMyPost(id: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.findOne({ id });

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return this.update({ id }, updatePostDto);
  }

  async deleteMyPost(id: string, userId: string) {
    const post = await this.findOne({ id });

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.delete({ id });
  }
}
```

### Example 3: Role Service with Validation

```typescript
@Injectable()
export class RoleService extends BaseService<
  Prisma.RoleGetPayload<{}>,
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

  async createRole(createRoleDto: CreateRoleDto) {
    await this.checkUniqueness('name', createRoleDto.name);

    return this.create(createRoleDto);
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    if (updateRoleDto.name) {
      await this.checkUniqueness('name', updateRoleDto.name, id);
    }

    return this.update({ id }, updateRoleDto);
  }

  async getRoleWithUsers(id: string) {
    return this.findOne(
      { id },
      {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    );
  }
}
```

## Search Feature

The base service supports flexible searching across multiple fields, including nested relations.

### Simple Field Search

```typescript
super(prismaService, {
  searchFields: ['title', 'description'],
});
```

### Nested Relation Search

```typescript
super(prismaService, {
  searchFields: ['title', 'content', 'author.username', 'author.email'],
});
```

When a user searches for "john", it will search in all specified fields using case-insensitive matching.

## Controller Integration

Using the base service in controllers:

```typescript
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getAllPosts(@Query() paginationQuery: PaginationQueryDto) {
    return this.postService.findAll(paginationQuery);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postService.findOne({ id });
  }

  @Post()
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.postService.createPost(createPostDto, userId);
  }

  @Patch(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update({ id }, updatePostDto);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.postService.delete({ id });
  }
}
```

## Best Practices

1. **Always specify the model name**: Set `protected modelName` in your service
2. **Configure search fields**: Include relevant fields users might search for
3. **Use type parameters**: Leverage TypeScript generics for type safety
4. **Custom methods for complex logic**: Extend the base service with custom methods
5. **Validate before create/update**: Use `checkUniqueness` for unique fields
6. **Handle permissions**: Add authorization checks in custom methods
7. **Override when needed**: You can override any base method if needed

## Benefits

- 📦 **Code Reusability**: Write common logic once, use everywhere
- 🔒 **Type Safety**: Full TypeScript support with generics
- 🚀 **Faster Development**: Implement new services quickly
- 🎯 **Consistency**: All services behave the same way
- 🧪 **Easier Testing**: Test base functionality once
- 🛠️ **Maintainability**: Update all services by modifying base class
- 📚 **Pagination Built-in**: No need to reimplement pagination logic

## Migration Guide

To migrate existing services to use the base service:

1. Import `BaseService` and extend it
2. Define generic type parameters
3. Set the `modelName` property
4. Configure options in the constructor
5. Remove redundant CRUD methods
6. Keep custom business logic methods
7. Use `checkUniqueness` instead of manual checks

See [role.service.example.ts](../modules/role/role.service.example.ts) for a complete example.
