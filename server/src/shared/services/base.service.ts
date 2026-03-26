import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '../dto/pagination.dto';
import { Prisma } from 'src/generated/prisma/client';

export interface BaseServiceOptions {
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
  searchFields?: string[];
  includeRelations?: any;
  selectFields?: any;
}

@Injectable()
export abstract class BaseService<
  T,
  CreateDto = any,
  UpdateDto = any,
  WhereUniqueInput = any,
> {
  protected abstract modelName: Prisma.ModelName;
  protected options: BaseServiceOptions;

  constructor(
    protected readonly prismaService: PrismaService,
    options?: BaseServiceOptions,
  ) {
    this.options = {
      defaultSortBy: 'createdAt',
      defaultSortOrder: 'desc',
      searchFields: [],
      includeRelations: undefined,
      selectFields: undefined,
      ...options,
    };
  }

  /**
   * Get the Prisma delegate for the current model
   */
  protected get model(): any {
    return this.prismaService[
      this.modelName.toLowerCase() as keyof PrismaService
    ] as any;
  }

  /**
   * Build search conditions for pagination
   */
  protected buildSearchConditions(search?: string): any {
    if (!search || !this.options.searchFields?.length) {
      return {};
    }

    return {
      OR: this.options.searchFields.map((field) => {
        // Handle nested fields like 'author.username'
        const fieldParts = field.split('.');
        if (fieldParts.length > 1) {
          return this.buildNestedSearchCondition(fieldParts, search);
        }
        return {
          [field]: { contains: search, mode: 'insensitive' as const },
        };
      }),
    };
  }

  /**
   * Build nested search conditions for related models
   */
  private buildNestedSearchCondition(
    fieldParts: string[],
    search: string,
  ): any {
    const [relation, ...rest] = fieldParts;
    if (rest.length === 1) {
      return {
        [relation]: {
          [rest[0]]: { contains: search, mode: 'insensitive' as const },
        },
      };
    }
    return {
      [relation]: this.buildNestedSearchCondition(rest, search),
    };
  }

  /**
   * Get all records with pagination
   */
  async findAll(
    paginationQuery?: PaginationQueryDto,
    additionalWhere?: any,
  ): Promise<PaginatedResponseDto<T>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = this.options.defaultSortBy,
      sortOrder = this.options.defaultSortOrder,
    } = paginationQuery || {};

    const skip = (page - 1) * limit;

    const searchConditions = this.buildSearchConditions(search);
    const where = additionalWhere
      ? { AND: [searchConditions, additionalWhere] }
      : searchConditions;

    const orderBy = { [sortBy as string]: sortOrder };

    const findManyOptions: any = {
      where,
      orderBy,
      skip,
      take: limit,
    };

    if (this.options.includeRelations) {
      findManyOptions.include = this.options.includeRelations;
    }

    if (this.options.selectFields) {
      findManyOptions.select = this.options.selectFields;
    }

    const [records, total] = await Promise.all([
      this.model.findMany(findManyOptions),
      this.model.count({ where }),
    ]);

    return new PaginatedResponseDto(records, total, page, limit);
  }

  /**
   * Get a single record by unique identifier
   */
  async findOne(
    where: WhereUniqueInput,
    includeRelations?: any,
  ): Promise<T | null> {
    const findOptions: any = { where };

    if (includeRelations || this.options.includeRelations) {
      findOptions.include = includeRelations || this.options.includeRelations;
    }

    if (!includeRelations && this.options.selectFields) {
      findOptions.select = this.options.selectFields;
    }

    const record = await this.model.findUnique(findOptions);

    if (!record) {
      throw new NotFoundException(`${this.modelName} not found`);
    }

    return record;
  }

  /**
   * Get a single record by unique identifier or return null
   */
  async findOneOrNull(
    where: WhereUniqueInput,
    includeRelations?: any,
  ): Promise<T | null> {
    const findOptions: any = { where };

    if (includeRelations || this.options.includeRelations) {
      findOptions.include = includeRelations || this.options.includeRelations;
    }

    if (!includeRelations && this.options.selectFields) {
      findOptions.select = this.options.selectFields;
    }

    return await this.model.findUnique(findOptions);
  }

  /**
   * Create a new record
   */
  async create(data: CreateDto, includeRelations?: any): Promise<T> {
    const createOptions: any = { data };

    if (includeRelations || this.options.includeRelations) {
      createOptions.include = includeRelations || this.options.includeRelations;
    }

    return await this.model.create(createOptions);
  }

  /**
   * Update an existing record
   */
  async update(
    where: WhereUniqueInput,
    data: UpdateDto,
    includeRelations?: any,
  ): Promise<T> {
    // First check if the record exists
    await this.findOne(where);

    const updateOptions: any = {
      where,
      data,
    };

    if (includeRelations || this.options.includeRelations) {
      updateOptions.include = includeRelations || this.options.includeRelations;
    }

    return await this.model.update(updateOptions);
  }

  /**
   * Delete a record
   */
  async delete(where: WhereUniqueInput): Promise<T> {
    // First check if the record exists
    await this.findOne(where);

    return await this.model.delete({ where });
  }

  /**
   * Check if a record exists
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Count records
   */
  async count(where?: any): Promise<number> {
    return await this.model.count({ where });
  }

  /**
   * Find many records without pagination
   */
  async findMany(
    where?: any,
    orderBy?: any,
    includeRelations?: any,
  ): Promise<T[]> {
    const findOptions: any = {};

    if (where) {
      findOptions.where = where;
    }

    if (orderBy) {
      findOptions.orderBy = orderBy;
    }

    if (includeRelations || this.options.includeRelations) {
      findOptions.include = includeRelations || this.options.includeRelations;
    }

    if (!includeRelations && this.options.selectFields) {
      findOptions.select = this.options.selectFields;
    }

    return await this.model.findMany(findOptions);
  }

  /**
   * Find first matching record
   */
  async findFirst(where: any, orderBy?: any): Promise<T | null> {
    const findOptions: any = { where };

    if (orderBy) {
      findOptions.orderBy = orderBy;
    }

    if (this.options.includeRelations) {
      findOptions.include = this.options.includeRelations;
    }

    if (this.options.selectFields) {
      findOptions.select = this.options.selectFields;
    }

    return await this.model.findFirst(findOptions);
  }

  /**
   * Update many records at once
   */
  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return await this.model.updateMany({ where, data });
  }

  /**
   * Delete many records at once
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    return await this.model.deleteMany({ where });
  }

  /**
   * Check if a unique field value already exists (useful for validation)
   */
  protected async checkUniqueness(
    field: string,
    value: any,
    excludeId?: string,
  ): Promise<void> {
    const where: any = { [field]: value };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const exists = await this.exists(where);

    if (exists) {
      throw new BadRequestException(
        `${this.modelName} with this ${field} already exists`,
      );
    }
  }
}
