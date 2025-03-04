
import { Link } from 'react-router-dom';
import { Post } from '@/types/social';

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
      
      {post.mediaUrl && (
        <div className="mb-4 rounded-md overflow-hidden">
          {post.mediaType === 'video' ? (
            <video 
              src={post.mediaUrl}
              controls
              className="w-full h-auto max-h-96 object-cover"
            />
          ) : (
            <img 
              src={post.mediaUrl} 
              alt="Post media" 
              className="w-full h-auto max-h-96 object-cover" 
            />
          )}
        </div>
      )}
      
      {/* Obsługa wielu plików multimedialnych */}
      {post.mediaFiles && post.mediaFiles.length > 0 && !post.mediaUrl && (
        <div className={`grid ${post.mediaFiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-4`}>
          {post.mediaFiles.map((file, idx) => (
            <div key={idx} className="relative rounded-md overflow-hidden">
              {file.type === 'video' ? (
                <video 
                  src={file.url}
                  controls
                  className="w-full h-auto max-h-80 object-cover"
                />
              ) : (
                <img 
                  src={file.url} 
                  alt={`Media ${idx + 1}`} 
                  className="w-full h-auto max-h-80 object-cover" 
                />
              )}
            </div>
          ))}
        </div>
      )}
      
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
