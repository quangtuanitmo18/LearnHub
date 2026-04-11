'use client';

import Editor from '@/components/tiptap/editor';
import Toolbar from '@/components/tiptap/toolbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DEFAULT_AVATAR } from '@/constants';
import { useUser } from '@/stores/auth-store';
import { Editor as TipTapEditor } from '@tiptap/react';
import { Loader2 } from 'lucide-react';

interface CommentEditorProps {
  isComposing: boolean;
  content: string;
  isPending: boolean;
  onComposingChange: (composing: boolean) => void;
  onContentChange: (content: string) => void;
  onEditorReady: (editor: TipTapEditor) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

// Comment editor component - Arrow function
const CommentEditor = ({
  isComposing,
  content,
  isPending,
  onComposingChange,
  onContentChange,
  onEditorReady,
  onSubmit,
  onCancel,
}: CommentEditorProps) => {
  const currentUser = useUser();
  const hasContent = content.replace(/<[^>]*>/g, '').trim().length > 0;

  if (!isComposing) {
    return (
      <div
        className="flex cursor-pointer items-center space-x-2 sm:space-x-3"
        onClick={() => onComposingChange(true)}
      >
        <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
          <AvatarImage
            src={currentUser?.avatar || DEFAULT_AVATAR}
            alt={currentUser?.username || 'User'}
          />
          <AvatarFallback className="bg-gray-300 text-xs text-gray-600 sm:text-sm">
            {currentUser?.username?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-500 sm:px-4 sm:py-3 sm:text-sm">
          Write your comment
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-2 sm:space-x-3">
      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
        <AvatarImage
          src={currentUser?.avatar || DEFAULT_AVATAR}
          alt={currentUser?.username || 'User'}
        />
        <AvatarFallback className="bg-gray-300 text-xs text-gray-600 sm:text-sm">
          {currentUser?.username?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="bg-gray-50">
          <Toolbar />
        </div>

        <Editor
          content={content}
          onChange={onContentChange}
          onReady={onEditorReady}
          autoFocus="end"
        />

        <div className="flex justify-end gap-1.5 p-2 sm:gap-2 sm:p-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-8 border-gray-300 text-xs text-gray-600 hover:bg-gray-100 sm:h-9 sm:text-sm"
          >
            CANCEL
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!hasContent || isPending}
            size="sm"
            className="h-8 bg-blue-600 text-xs text-white hover:bg-blue-700 sm:h-9 sm:text-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin sm:mr-2" />
                <span className="hidden sm:inline">SENDING...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              'COMMENT'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentEditor;
