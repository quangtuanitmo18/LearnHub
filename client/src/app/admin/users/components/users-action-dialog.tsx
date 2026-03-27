'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRoles } from '@/hooks/use-roles';
import { useUpdateUserAdmin } from '@/hooks/use-users';
import { IRole } from '@/types/role';
import { IUser, UpdateUserRequest, UserStatus } from '@/types/user';
import { yupResolver } from '@hookform/resolvers/yup';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { MdEdit } from 'react-icons/md';
import { toast } from 'sonner';
import * as yup from 'yup';

// Simplified validation schema for status and roles only
const userValidationSchema = yup.object().shape({
  status: yup
    .string()
    .oneOf(
      [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BANNED],
      'Please select a valid status',
    )
    .required('Status is required'),
  roles: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one role is required')
    .required('Roles are required'),
});

type UserFormData = yup.InferType<typeof userValidationSchema>;

interface UserActionDialogProps {
  user: IUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UsersActionDialog = ({ user, open, onOpenChange }: UserActionDialogProps) => {
  // API hooks
  const updateUserMutation = useUpdateUserAdmin();
  const { data: rolesResponse } = useRoles();
  const roles = rolesResponse?.result || [];
  const isLoading = updateUserMutation.isPending;

  // Initialize form
  const form = useForm<UserFormData>({
    resolver: yupResolver(userValidationSchema),
    mode: 'onChange',
    defaultValues: {
      status: user?.status || UserStatus.INACTIVE,
      roles: user?.roles?.map((role) => role.id) || [],
    } as UserFormData,
  });

  // Reset form when dialog opens/closes or user changes
  React.useEffect(() => {
    if (open && user) {
      form.reset({
        status: user.status,
        roles: user.roles?.map((role) => role.id) || [],
      });
    }
  }, [open, user, form]);

  const onSubmit = async (data: UserFormData) => {
    const updateData: UpdateUserRequest = {
      id: user.id,
      status: data.status as UserStatus,
      roleIds: data.roles || [],
    };

    updateUserMutation.mutate(updateData, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  const title = 'Update User Status';
  const description = "Update the user's status and role assignments.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MdEdit className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* User Information Display */}
            <div className="bg-muted/50 space-y-2 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Username:</span> {user.username}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {user.email}
                </div>
                <div>
                  <span className="font-medium">User Type:</span> {user.userType}
                </div>
                <div>
                  <span className="font-medium">Current Status:</span>{' '}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      user.status === UserStatus.ACTIVE
                        ? 'bg-green-100 text-green-800'
                        : user.status === UserStatus.INACTIVE
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Update Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full" disabled={isLoading}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                      <SelectItem value={UserStatus.BANNED}>Banned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <FormLabel>Update Roles</FormLabel>
                  <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto">
                    {roles.map((role: IRole) => (
                      <FormField
                        key={role.id}
                        control={form.control}
                        name="roles"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={role.id}
                              className="flex flex-row items-start space-y-0 space-x-3"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes(role.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, role.id])
                                      : field.onChange(
                                          field.value.filter((value) => value !== role.id),
                                        );
                                  }}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">{role.name}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isLoading ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UsersActionDialog;
