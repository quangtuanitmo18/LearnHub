"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MdEdit, MdAdd } from "react-icons/md";
import { toast } from "sonner";
import { Permission, PERMISSION_GROUPS } from "@/configs/permission";
import { roleSchema, RoleSchema } from "@/validators/role.validator";

import { useCreateRole, useUpdateRole } from "@/hooks/use-roles";
import { IRole } from "@/types/role";

interface RoleActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  role: IRole | null;
}

const RoleActionDialog = ({
  open,
  onOpenChange,
  mode = "create",
  role,
}: RoleActionDialogProps) => {
  // API hooks
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  // Helper function to get form values from role
  const getFormValues = React.useCallback(
    (role: IRole | null) => ({
      name: role?.name || "",
      description: role?.description || "",
      permissions: role?.permissions || [],
    }),
    []
  );

  const isLoading =
    createRoleMutation.isPending || updateRoleMutation.isPending;

  // Initialize form with default values
  const form = useForm<RoleSchema>({
    resolver: yupResolver(roleSchema),
    defaultValues: getFormValues(role),
  });

  // Reset form when dialog opens/closes or role changes
  React.useEffect(() => {
    if (open && role) {
      form.reset(getFormValues(role));
    }
  }, [open, role, form, getFormValues]);

  const onSubmit = async (data: RoleSchema) => {
    const formData = {
      name: data.name,
      description: data.description,
      permissions: (data.permissions || []) as Permission[],
    };

    if (mode === "create") {
      createRoleMutation.mutate(
        {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        },
        {
          onSuccess: () => {
            toast.success("Role created successfully!");
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else if (role) {
      updateRoleMutation.mutate(
        {
          id: role.id,
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions as Permission[],
        },
        {
          onSuccess: () => {
            toast.success("Role updated successfully!");
            onOpenChange(false);
            form.reset();
          },
        }
      );
    }
  };

  const title = mode === "create" ? "Create Role" : "Edit Role";
  const description =
    mode === "create"
      ? "Create a new role with specific permissions."
      : "Update the role information and permissions.";

  const watchedPermissions = form.watch("permissions");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "create" ? (
              <MdAdd className="h-5 w-5" />
            ) : (
              <MdEdit className="h-5 w-5" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="max-h-[60vh] overflow-auto pr-4">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Basic Information</h3>

                  {/* Role Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter role name"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter role description"
                            rows={3}
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      Permissions (optional)
                    </h3>
                    <Badge variant="default">
                      {(watchedPermissions || []).length} selected
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select specific permissions for this role.
                  </p>

                  <FormField
                    control={form.control}
                    name="permissions"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-4">
                          {Object.entries(PERMISSION_GROUPS).map(
                            ([resource, group]) => (
                              <div key={resource} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-muted-foreground">
                                    {group.label}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const currentPermissions =
                                          field.value || [];
                                        const allResourcePermissions =
                                          group.permissions;

                                        // Check if all permissions for this resource are selected
                                        const hasAll =
                                          allResourcePermissions.every(
                                            (p: string) =>
                                              currentPermissions.includes(p)
                                          );

                                        if (hasAll) {
                                          // Remove all permissions for this resource
                                          field.onChange(
                                            currentPermissions.filter(
                                              (p) =>
                                                !allResourcePermissions.includes(
                                                  p as Permission
                                                )
                                            )
                                          );
                                        } else {
                                          // Add all permissions for this resource
                                          const newPermissions = Array.from(
                                            new Set([
                                              ...currentPermissions,
                                              ...allResourcePermissions,
                                            ])
                                          );
                                          field.onChange(newPermissions);
                                        }
                                      }}
                                      disabled={isLoading}
                                    >
                                      {group.permissions.every((p: string) =>
                                        field.value?.includes(p)
                                      )
                                        ? "Deselect All"
                                        : "Select All"}
                                    </Button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {group.permissions.map(
                                    (permission: string) => {
                                      const isChecked =
                                        field.value?.includes(permission) ||
                                        false;

                                      return (
                                        <div
                                          key={permission}
                                          className="flex items-center space-x-2"
                                        >
                                          <Checkbox
                                            id={permission}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                field.onChange([
                                                  ...(field.value || []),
                                                  permission,
                                                ]);
                                              } else {
                                                field.onChange(
                                                  field.value?.filter(
                                                    (p) => p !== permission
                                                  ) || []
                                                );
                                              }
                                            }}
                                            disabled={isLoading}
                                          />
                                          <label
                                            htmlFor={permission}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                          >
                                            {permission.split(":")[1]}
                                          </label>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Role"
                  : "Update Role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleActionDialog;
