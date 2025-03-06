
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileIcon, FileText } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface GroupFilesListProps {
  groupId: string;
  searchQuery: string;
}

type GroupFile = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
  postId: string;
  post?: {
    content: string;
  };
};

export function GroupFilesList({ groupId, searchQuery }: GroupFilesListProps) {
  const [files, setFiles] = useState<GroupFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        // Najpierw pobierz wszystkie ID postów dla danej grupy
        const { data: postIds, error: postsError } = await supabase
          .from('group_posts')
          .select('id')
          .eq('group_id', groupId);
          
        if (postsError) {
          console.error('Błąd podczas pobierania postów:', postsError);
          return;
        }
        
        if (!postIds || postIds.length === 0) {
          setFiles([]);
          setLoading(false);
          return;
        }
        
        const postIdArray = postIds.map(post => post.id);
        
        // Następnie pobierz pliki dla tych postów
        const { data: filesData, error } = await supabase
          .from('group_post_files')
          .select(`
            id,
            name,
            url,
            type,
            size,
            created_at,
            post_id,
            post:post_id (
              content
            )
          `)
          .in('post_id', postIdArray)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Błąd podczas pobierania plików:', error);
          return;
        }
        
        const formattedFiles: GroupFile[] = filesData.map(file => ({
          id: file.id,
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size,
          createdAt: new Date(file.created_at).toLocaleDateString(),
          postId: file.post_id,
          post: file.post ? {
            content: file.post.content
          } : undefined
        }));
        
        setFiles(formattedFiles);
      } catch (error) {
        console.error('Nieoczekiwany błąd:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiles();
  }, [groupId]);
  
  // Filtrowanie plików na podstawie nazwy lub zawartości posta
  const filteredFiles = files.filter(file => 
    !searchQuery || 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (file.post?.content && 
      file.post.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Funkcja do określania ikony na podstawie typu pliku
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (type.includes('word') || type.includes('doc')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else if (type.includes('sheet') || type.includes('excel') || type.includes('xls')) {
      return <FileText className="h-6 w-6 text-green-500" />;
    } else if (type.includes('presentation') || type.includes('powerpoint') || type.includes('ppt')) {
      return <FileText className="h-6 w-6 text-orange-500" />;
    } else {
      return <FileIcon className="h-6 w-6 text-gray-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }
  
  if (filteredFiles.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery ? (
          <>
            <h3 className="text-lg font-medium mb-2">Brak wyników dla "{searchQuery}"</h3>
            <p className="text-muted-foreground">Spróbuj innych słów kluczowych</p>
          </>
        ) : (
          <>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-2">Brak plików</h3>
            <p className="text-muted-foreground">W tej grupie nie ma jeszcze plików</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredFiles.map(file => (
        <Card key={file.id} className="group hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(file.type)}
                
                <div>
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{formatBytes(file.size)}</span>
                    <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground"></span>
                    <span>{file.createdAt}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-50 group-hover:opacity-100"
                onClick={() => window.open(file.url, '_blank')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
