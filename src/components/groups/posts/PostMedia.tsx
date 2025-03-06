
interface Media {
  url: string;
  type: 'image' | 'video';
}

interface PostMediaProps {
  media: Media[];
}

export function PostMedia({ media }: PostMediaProps) {
  return (
    <div className={`grid ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-4`}>
      {media.map((file, idx) => (
        <div key={idx} className="relative rounded-md overflow-hidden">
          {file.type === 'video' ? (
            <video 
              src={file.url}
              controls
              className="w-full h-auto max-h-96 object-cover rounded-md"
            />
          ) : (
            <img 
              src={file.url} 
              alt={`Media ${idx + 1}`} 
              className="w-full h-auto max-h-96 object-cover rounded-md" 
            />
          )}
        </div>
      ))}
    </div>
  );
}
