import { Link } from 'react-router-dom';
import { Post } from '@/types/social';
import { PostMedia } from '@/components/groups/posts/PostMedia'; 

interface PostContentProps {
  post: Post;
}

export function PostContent({ post }: PostContentProps) {
  const formatContent = (content: string) => {
    // Zamień hashtagi na linki
    return content.replace(/#(\w+)/g, '<a href="/hashtag/$1" class="text-primary hover:underline">#$1</a>');
  };

  return (
    <>
      <div 
        className="mt-2 mb-4 text-rhythm-700 break-words"
        dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
      />
      
      {/* Obsługa mediów - korzystamy z komponentu PostMedia */}
      {post.media && post.media.length > 0 && (
        <PostMedia media={post.media} />
      )}
      
      {/* Obsługa plików */}
      {post.files && post.files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.files.map((file, idx) => (
            <a 
              key={idx} 
              href={file.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md flex items-center gap-2"
            >
              <span className="text-sm">{file.name}</span>
            </a>
          ))}
        </div>
      )}
      
      {/* Obsługa ankiet */}
      {post.isPoll && post.pollOptions && (
        <div className="mt-4 space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-md mb-4">
          {post.pollOptions.map((option) => {
            const totalVotes = post.pollOptions?.reduce((sum, opt) => sum + opt.votes, 0) || 0;
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            const isVoted = post.userVoted === option.id;
            
            return (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{option.text}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isVoted ? 'bg-primary' : 'bg-slate-400 dark:bg-slate-500'} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {option.votes} {option.votes === 1 ? 'głos' : 
                    option.votes % 10 >= 2 && option.votes % 10 <= 4 && 
                    (option.votes % 100 < 10 || option.votes % 100 > 20) ? 
                    'głosy' : 'głosów'}
                </div>
              </div>
            );
          })}
          <div className="text-sm text-muted-foreground mt-2">
            Łącznie: {post.pollOptions.reduce((sum, option) => sum + option.votes, 0)} głosów
          </div>
        </div>
      )}
      
      {/* Wyświetl hashtagi, jeśli są dostępne */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.hashtags.map((tag) => (
            <Link 
              key={tag} 
              to={`/hashtag/${tag}`}
              className="text-sm text-primary hover:underline"
              onClick={(e) => e.stopPropagation()} // Zapobiegaj propagacji zdarzenia
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
