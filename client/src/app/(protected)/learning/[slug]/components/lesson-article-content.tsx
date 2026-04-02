'use client';

interface LessonArticleContentProps {
  title: string;
  content: string;
}

// Lesson article content component - Arrow function
const LessonArticleContent = ({ title, content }: LessonArticleContentProps) => {
  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
    };
    return `Updated ${now.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className="h-full w-full bg-white">
      {/* Main Content */}
      <div className="mx-auto flex h-full max-w-4xl flex-col">
        {/* Article Header */}
        <div className="shrink-0 px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-6 md:pt-12 md:pb-8">
          <h1 className="mb-2 text-xl leading-tight font-bold text-gray-900 sm:mb-3 sm:text-2xl md:mb-4 md:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="text-sm text-gray-500 sm:text-base">{getCurrentDate()}</p>
        </div>

        {/* Article Content */}
        <div className="flex-1 overflow-hidden">
          <div
            className="h-full overflow-y-auto px-4 pb-6 sm:px-6 sm:pb-8 md:pb-12"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#CBD5E0 #F7FAFC',
            }}
          >
            <div
              className="tiptap ProseMirror max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonArticleContent;
