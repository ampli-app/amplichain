
import { GroupFile } from '@/types/group';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, File, FileCode } from 'lucide-react';

interface GroupFilesListProps {
  files: GroupFile[];
  searchQuery: string;
}

export function GroupFilesList({ files, searchQuery }: GroupFilesListProps) {
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
            <h3 className="text-lg font-medium mb-2">Brak plików</h3>
            <p className="text-muted-foreground">W tej grupie nie zostały jeszcze udostępnione żadne pliki.</p>
          </>
        )}
      </div>
    );
  }
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-6 w-6 text-blue-500" />;
    if (fileType.includes('zip') || fileType.includes('archive')) return <File className="h-6 w-6 text-amber-500" />;
    if (fileType.includes('code') || fileType.includes('json') || fileType.includes('xml')) return <FileCode className="h-6 w-6 text-green-500" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const handleDownload = (file: GroupFile) => {
    // In a real app, we would initiate a file download here
    console.log('Downloading file:', file.name);
  };
  
  return (
    <div className="space-y-3">
      {filteredFiles.map((file) => (
        <Card key={file.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(file.type)}
              <div>
                <h4 className="font-medium">{file.name}</h4>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5"
              onClick={() => handleDownload(file)}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Pobierz</span>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
