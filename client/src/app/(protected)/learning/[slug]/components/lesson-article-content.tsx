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
    <div className="w-full bg-white">
      {/* Main Content */}
      <div className="mx-auto flex max-w-4xl flex-col">
        {/* Article Header */}
        <div className="shrink-0 px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-6 md:pt-12 md:pb-8">
          <h1 className="mb-2 text-xl leading-tight font-bold text-gray-900 sm:mb-3 sm:text-2xl md:mb-4 md:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="text-sm text-gray-500 sm:text-base">{getCurrentDate()}</p>
        </div>

        {/* Article Content */}
        <div className="px-4 pb-6 sm:px-6 sm:pb-8 md:pb-12">
          <div
            className="tiptap ProseMirror max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonArticleContent;
