/\*\*

- Get presigned URL for avatar upload
  \*/
  @Post('avatar/presigned')
  @ResponseMessage('Presigned URL generated successfully')
  async getAvatarPresignedUrl(
  @CurrentUser('sub') userId: string,
  @Body() dto: AvatarPresignedRequestDto,
  ) {
  return this.userService.getAvatarPresignedUrl(userId, dto);
  }

/\*\*

- Mark avatar upload as complete and update user profile
  \*/
  @Post('avatar/upload-complete')
  @ResponseMessage('Avatar uploaded successfully')
  async completeAvatarUpload(
  @CurrentUser('sub') userId: string,
  @Body() dto: AvatarUploadCompleteDto,
  ) {
  return this.userService.completeAvatarUpload(userId, dto.key);
  }

/\*\*

- Delete current user's avatar
  \*/
  @Delete('avatar')
  @ResponseMessage('Avatar deleted successfully')
  async deleteAvatar(@CurrentUser('sub') userId: string) {
  return this.userService.deleteAvatar(userId);
  }

export class AvatarPresignedRequestDto {
@IsString()
filename: string;

@IsString()
mimetype: string;

@IsNumber()
@Min(1)
size: number;
}

export class AvatarPresignedResponseDto {
uploadUrl: string;
key: string;
expiresIn: number;
}

export class AvatarUploadCompleteDto {
@IsString()
key: string;
}

// ==================== AVATAR UPLOAD METHODS ====================

/\*\*

- Generate presigned URL for avatar upload
  \*/
  async getAvatarPresignedUrl(
  userId: string,
  dto: AvatarPresignedRequestDto,
  ): Promise<AvatarPresignedResponseDto> {
  // Validate mimetype
  if (!ALLOWED_AVATAR_MIMETYPES.includes(dto.mimetype)) {
  throw new BadRequestException(
  `Invalid file type. Allowed types: ${ALLOWED_AVATAR_MIMETYPES.join(', ')}`,
  );
  }

  // Validate file size
  if (dto.size > MAX_AVATAR_SIZE) {
  throw new BadRequestException(
  `File too large. Maximum size: ${MAX_AVATAR_SIZE / (1024 * 1024)}MB`,
  );
  }

  // Generate unique key for avatar
  const ext = dto.filename.split('.').pop() || 'jpg';
  const key = `avatars/${userId}/${uuidv4()}-${Date.now()}.${ext}`;

  // Generate presigned URL (10 minutes expiry)
  const presignedData = await this.s3Service.getPresignedUploadUrl(
  key,
  dto.mimetype,
  600,
  );

  return presignedData;

}

/\*\*

- Mark avatar upload as complete and update user's avatar
  \*/
  async completeAvatarUpload(
  userId: string,
  key: string,
  ): Promise<{ avatar: string }> {
  // Verify file exists in S3
  const exists = await this.s3Service.fileExists(key);
  if (!exists) {
  throw new BadRequestException(
  'Upload not completed - file not found in S3',
  );
  }

  // Construct the avatar URL
  const avatarUrl = this.cdnBaseUrl ? `${this.cdnBaseUrl}/${key}` : key;

  // Get current user to check for old avatar
  const user = await this.userRepository.findOne({ id: userId });
  const oldAvatarKey = user?.avatar;

  // Update user's avatar
  await this.userRepository.update({ id: userId }, { avatar: avatarUrl });

  // Delete old avatar from S3 if it exists and is different
  if (oldAvatarKey && oldAvatarKey !== avatarUrl) {
  try {
  // Extract key from URL if it's a full URL
  const keyToDelete = oldAvatarKey.includes('/')
  ? oldAvatarKey.replace(`${this.cdnBaseUrl}/`, '')
  : oldAvatarKey;

        if (keyToDelete.startsWith('avatars/')) {
          await this.s3Service.deleteFile(keyToDelete);
        }
      } catch (error) {
        // Log but don't fail if old avatar deletion fails
        console.error('Failed to delete old avatar:', error);
      }

  }

  return { avatar: avatarUrl };

}

/\*\*

- Delete user's avatar
  \*/
  async deleteAvatar(userId: string): Promise<{ message: string }> {
  const user = await this.userRepository.findOne({ id: userId });

  if (!user?.avatar) {
  throw new BadRequestException('User has no avatar to delete');
  }

  // Extract key from URL
  const keyToDelete = user.avatar.includes('/')
  ? user.avatar.replace(`${this.cdnBaseUrl}/`, '')
  : user.avatar;

  // Delete from S3 if it's an avatar we manage
  if (keyToDelete.startsWith('avatars/')) {
  try {
  await this.s3Service.deleteFile(keyToDelete);
  } catch (error) {
  console.error('Failed to delete avatar from S3:', error);
  }
  }

  // Remove avatar from user
  await this.userRepository.update({ id: userId }, { avatar: undefined });

  return { message: 'Avatar deleted successfully' };

}
