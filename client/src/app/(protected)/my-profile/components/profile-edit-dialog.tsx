"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import {
  AuthService,
  CurrentUser,
  UpdateProfileRequest,
} from "@/services/auth";
import { UsersService } from "@/services/users";
import { Loader2, XCircle } from "lucide-react";
import { MdDelete } from "react-icons/md";
import { DEFAULT_AVATAR } from "@/constants";

// Validation schema for profile edit
const profileSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .trim(),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address")
    .trim(),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

// Avatar upload constants
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_AVATAR_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Avatar upload status (only used during actual upload)
type AvatarUploadStatus = "idle" | "uploading" | "completed" | "error";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: CurrentUser;
}

// Profile edit dialog component - Arrow function
const ProfileEditDialog = ({
  open,
  onOpenChange,
  user,
}: ProfileEditDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<AvatarUploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string>("");
  const [shouldDeleteAvatar, setShouldDeleteAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getCurrentUser } = useAuthStore();

  const form = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      username: user.username || "",
      email: user.email || "",
    },
  });

  // Handle file input change - only store file and show preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error(
        `Invalid file type. Allowed types: ${ALLOWED_AVATAR_TYPES.join(", ")}`
      );
      return;
    }

    // Validate file size
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error(
        `File too large. Maximum size: ${MAX_AVATAR_SIZE / (1024 * 1024)}MB`
      );
      return;
    }

    // Store the selected file
    setSelectedAvatarFile(file);
    setShouldDeleteAvatar(false);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(previewUrl);

    // Clean up previous preview URL if exists
    if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
  };

  // Handle avatar click to trigger file input
  const handleAvatarClick = () => {
    if (isLoading || fileInputRef.current === null) {
      return;
    }
    fileInputRef.current.click();
  };

  // Handle removing selected file (before upload)
  const handleRemoveSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAvatarFile(null);
    if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl("");
  };

  const handleAvatarDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering avatar click

    // Mark avatar for deletion (will be deleted on form submit)
    setShouldDeleteAvatar(true);
    setSelectedAvatarFile(null);

    // Clear preview if exists
    if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl("");
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setUploadStatus("idle");
    setUploadProgress(0);
    setUploadError("");

    try {
      // Step 1: Handle avatar upload/delete if needed
      if (shouldDeleteAvatar) {
        // Delete avatar
        setUploadStatus("uploading");
        setUploadProgress(20);
        await UsersService.deleteAvatar();
        setUploadProgress(40);
      } else if (selectedAvatarFile) {
        // Upload new avatar
        setUploadStatus("uploading");
        setUploadProgress(10);

        // Step 1: Get presigned URL
        const presignedData = await UsersService.getAvatarPresignedUrl({
          filename: selectedAvatarFile.name,
          mimetype: selectedAvatarFile.type,
          size: selectedAvatarFile.size,
        });

        setUploadProgress(30);

        // Step 2: Upload file to S3 using presigned URL
        const uploadResponse = await fetch(presignedData.uploadUrl, {
          method: "PUT",
          body: selectedAvatarFile,
          headers: {
            "Content-Type": selectedAvatarFile.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file to storage");
        }

        setUploadProgress(60);

        // Step 3: Complete the upload
        await UsersService.completeAvatarUpload({
          key: presignedData.key,
        });

        setUploadProgress(80);
      }

      // Step 2: Update profile
      const updateData: UpdateProfileRequest = {
        username: data.username,
        email: data.email,
      };

      setUploadProgress(90);
      await AuthService.updateProfile(updateData);
      setUploadProgress(100);
      setUploadStatus("completed");

      toast.success("Profile updated successfully!");

      // Refresh user data to get updated information
      await getCurrentUser();

      // Clean up preview URL
      if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      // Reset all states
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl("");
      setShouldDeleteAvatar(false);
      setUploadStatus("idle");
      setUploadProgress(0);
      setUploadError("");

      onOpenChange(false);
    } catch (error) {
      console.error("Profile update error:", error);
      setUploadStatus("error");
      setUploadError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset upload state when dialog closes
  const handleDialogClose = (open: boolean) => {
    if (!open && !isLoading) {
      // Clean up preview URL
      if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      // Reset all states
      setSelectedAvatarFile(null);
      setAvatarPreviewUrl("");
      setShouldDeleteAvatar(false);
      setUploadStatus("idle");
      setUploadProgress(0);
      setUploadError("");
    }
    onOpenChange(open);
  };

  // Handle avatar URL - either from user's existing avatar, preview, or default
  const currentAvatarUrl = user.avatar || DEFAULT_AVATAR;
  const displayAvatarUrl = avatarPreviewUrl || currentAvatarUrl;
  const userInitials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Edit Profile</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Update your personal information and profile picture.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-6"
          >
            {/* Avatar Section */}
            <Card>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />

                  {/* Clickable Avatar */}
                  <div className="relative group">
                    <div
                      onClick={handleAvatarClick}
                      className={`
                        cursor-pointer transition-opacity
                        ${
                          isLoading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:opacity-80"
                        }
                      `}
                    >
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                        <AvatarImage
                          src={displayAvatarUrl}
                          alt={user.username || "User"}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg sm:text-xl">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Delete icon overlay - show when there's a custom avatar or selected file */}
                    {(currentAvatarUrl !== DEFAULT_AVATAR ||
                      selectedAvatarFile) &&
                      !isLoading && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={
                            selectedAvatarFile
                              ? handleRemoveSelectedFile
                              : handleAvatarDelete
                          }
                          disabled={isLoading}
                          className="absolute top-0 right-0 h-5 w-5 sm:h-6 sm:w-6 rounded-full p-0 hover:scale-110 transition-all duration-200 disabled:hover:scale-100 opacity-0 group-hover:opacity-100"
                        >
                          <MdDelete className="h-3 w-3" />
                        </Button>
                      )}

                    {/* Upload overlay indicator */}
                    {isLoading && uploadStatus === "uploading" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  {/* Selected file indicator */}
                  {selectedAvatarFile && !isLoading && (
                    <div className="w-full space-y-2">
                      <p className="text-xs text-center text-muted-foreground">
                        New avatar selected: {selectedAvatarFile.name}
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        Click &quot;Update Profile&quot; to upload
                      </p>
                    </div>
                  )}

                  {/* Delete indicator */}
                  {shouldDeleteAvatar && !isLoading && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <XCircle className="h-4 w-4" />
                      <span>Avatar will be removed on update</span>
                    </div>
                  )}

                  {/* Upload Status - only show during actual upload */}
                  {isLoading && uploadStatus === "uploading" && (
                    <div className="w-full space-y-2">
                      <Progress value={uploadProgress} className="w-full h-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {uploadStatus === "error" && (
                    <div className="flex flex-col items-center gap-1 text-sm text-destructive">
                      <XCircle className="h-4 w-4" />
                      <span>Upload Failed</span>
                      {uploadError && (
                        <p className="text-xs text-muted-foreground text-center">
                          {uploadError}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Helper text */}
                  {!selectedAvatarFile && !shouldDeleteAvatar && !isLoading && (
                    <p className="text-xs text-center text-muted-foreground">
                      Click avatar to select new image (JPG, PNG, GIF, WebP -
                      max 5MB)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Form Fields */}
            <div className="space-y-3 sm:space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        className="h-10 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        disabled={isLoading}
                        className="h-10 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="w-full sm:w-auto h-9 sm:h-10 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto h-9 sm:h-10 text-sm"
              >
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
