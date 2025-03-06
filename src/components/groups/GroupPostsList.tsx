
import { GroupPost } from '@/types/group';
import { PostItem } from './posts/PostItem';

interface GroupPostsListProps {
  posts: GroupPost[];
  searchQuery: string;
}

export function GroupPostsList({ posts, searchQuery }: GroupPostsListProps) {
  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery ? (
          <>
            <h3 className="text-lg font-medium mb-2">Brak wyników dla "{searchQuery}"</h3>
            <p className="text-muted-foreground">Spróbuj innych słów kluczowych</p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-2">Brak postów</h3>
            <p className="text-muted-foreground">Bądź pierwszy i napisz coś w tej grupie!</p>
          </>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {filteredPosts.map((post, index) => (
        <PostItem key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
