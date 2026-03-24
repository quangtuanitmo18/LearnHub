"use client";

import { DataTableColumnHeader } from "@/components/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CourseLevel, CourseStatus, ICourse } from "@/types/course";
import { formatPrice } from "@/utils/format";
import { getStatusConfig } from "@/utils/common";
import { DEFAULT_AVATAR } from "@/constants";
import { ColumnDef } from "@tanstack/react-table";
import { CourseImageCell } from "./course-image-cell";
import DataTableRowActions from "./data-table-row-actions";

export const columns: ColumnDef<ICourse>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" />
    ),
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex items-center space-x-3">
          <CourseImageCell course={course} />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-foreground">{course.title}</div>
            <div className="text-sm text-muted-foreground">/{course.slug}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as CourseStatus;
      const config = getStatusConfig(status);

      return (
        <Badge
          className={`rounded-full capitalize border ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.ringColor} focus-visible:outline-none`}
        >
          <span
            className={`size-1.5 rounded-full ${config.dotColor}`}
            aria-hidden="true"
          />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isFree",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const course = row.original;
      const isActuallyFree = course.isFree || course.price === 0;

      const typeConfig = isActuallyFree
        ? {
            label: "Free",
            bgColor: "bg-green-50 dark:bg-green-950/30",
            textColor: "text-green-700 dark:text-green-300",
            borderColor: "border-green-200 dark:border-green-800",
            ringColor: "ring-green-600/20",
            dotColor: "bg-green-500",
          }
        : {
            label: "Paid",
            bgColor: "bg-blue-50 dark:bg-blue-950/30",
            textColor: "text-blue-700 dark:text-blue-300",
            borderColor: "border-blue-200 dark:border-blue-800",
            ringColor: "ring-blue-600/20",
            dotColor: "bg-blue-500",
          };

      return (
        <Badge
          className={`rounded-full capitalize border ${typeConfig.bgColor} ${typeConfig.textColor} ${typeConfig.borderColor} ${typeConfig.ringColor} focus-visible:outline-none`}
        >
          <span
            className={`size-1.5 rounded-full ${typeConfig.dotColor}`}
            aria-hidden="true"
          />
          {typeConfig.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "author",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Author" />
    ),
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={course.author?.avatar || DEFAULT_AVATAR}
              alt={course.author?.username}
            />
            <AvatarFallback className="bg-muted">
              {course.author?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium text-sm">{course.author?.username}</div>
            <div className="text-xs text-muted-foreground truncate">
              {course.author?.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const course = row.original;
      return (
        <Badge variant="outline">
          {course.category?.name || "No Category"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Level" />
    ),
    cell: ({ row }) => {
      const level = row.getValue("level") as CourseLevel;

      const levelConfig =
        level === CourseLevel.BEGINNER
          ? {
              label: "Beginner",
              bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
              textColor: "text-emerald-700 dark:text-emerald-300",
              borderColor: "border-emerald-200 dark:border-emerald-800",
              ringColor: "ring-emerald-600/20",
              dotColor: "bg-emerald-500",
            }
          : level === CourseLevel.INTERMEDIATE
            ? {
                label: "Intermediate",
                bgColor: "bg-amber-50 dark:bg-amber-950/30",
                textColor: "text-amber-700 dark:text-amber-300",
                borderColor: "border-amber-200 dark:border-amber-800",
                ringColor: "ring-amber-600/20",
                dotColor: "bg-amber-500",
              }
            : {
                label: "Advanced",
                bgColor: "bg-purple-50 dark:bg-purple-950/30",
                textColor: "text-purple-700 dark:text-purple-300",
                borderColor: "border-purple-200 dark:border-purple-800",
                ringColor: "ring-purple-600/20",
                dotColor: "bg-purple-500",
              };

      return (
        <Badge
          className={`rounded-full capitalize border ${levelConfig.bgColor} ${levelConfig.textColor} ${levelConfig.borderColor} ${levelConfig.ringColor} focus-visible:outline-none`}
        >
          <span
            className={`size-1.5 rounded-full ${levelConfig.dotColor}`}
            aria-hidden="true"
          />
          {levelConfig.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div>
          <div className="font-medium">{formatPrice(course.price)}</div>
          {course.oldPrice && course.oldPrice > course.price && (
            <div className="text-xs text-muted-foreground line-through">
              {formatPrice(course.oldPrice)}
            </div>
          )}
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
