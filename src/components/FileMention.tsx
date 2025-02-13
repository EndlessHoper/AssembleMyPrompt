import React from 'react';
import { FileText } from 'lucide-react';
import { FilesContext } from '../contexts/FilesContext';

interface FileMentionProps {
  element: {
    fileName: string;
  };
  attributes: any;
  children: React.ReactNode;
}

export const FileMention: React.FC<FileMentionProps> = ({ 
  attributes, 
  children, 
  element 
}) => {
  const { files } = React.useContext(FilesContext);
  const fileExists = files.some(f => f.fileName === element.fileName);
  
  return (
    <span {...attributes} contentEditable={false} className={`inline-flex items-center px-1.5 py-0.5 rounded-md border transition-colors ${
      fileExists 
        ? 'bg-blue-50 text-blue-900 border-blue-100 hover:bg-blue-100'
        : 'bg-red-50 text-red-900 border-red-100 hover:bg-red-100'
    }`}>
      <FileText className={`inline-block h-3.5 w-3.5 mr-1 ${fileExists ? 'text-blue-500' : 'text-red-500'}`} />
      {element.fileName}
      {!fileExists && <span className="text-xs ml-1 text-red-600">(missing)</span>}
      {children}
    </span>
  );
}; 