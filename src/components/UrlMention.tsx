import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { FilesContext } from '../contexts/FilesContext';

interface UrlMentionProps {
  element: {
    url: string;
    fileName: string;
  };
  attributes: any;
  children: React.ReactNode;
}

export const UrlMention: React.FC<UrlMentionProps> = ({ 
  attributes, 
  children, 
  element 
}) => {
  const { files } = React.useContext(FilesContext);
  const fileExists = files.some(f => f.fileName === element.fileName);
  
  return (
    <span {...attributes} contentEditable={false} className={`inline-flex items-center px-1.5 py-0.5 rounded-md border transition-colors ${
      fileExists 
        ? 'bg-green-50 text-green-900 border-green-100 hover:bg-green-100'
        : 'bg-yellow-50 text-yellow-900 border-yellow-100 hover:bg-yellow-100'
    }`}>
      <LinkIcon className={`inline-block h-3.5 w-3.5 mr-1 ${fileExists ? 'text-green-500' : 'text-yellow-500'}`} />
      {element.url}
      {!fileExists && <span className="text-xs ml-1 text-yellow-600">(fetching)</span>}
      {children}
    </span>
  );
}; 