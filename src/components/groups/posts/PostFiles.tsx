
import { FileText } from 'lucide-react';

interface File {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface PostFilesProps {
  files: File[];
}

export function PostFiles({ files }: PostFilesProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {files.map((file, idx) => (
        <div key={idx} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{file.name}</span>
        </div>
      ))}
    </div>
  );
}
