import React from 'react';

export interface FileData {
  id: string;
  fileName: string;
  content: string;
}

interface FilesContextType {
  files: FileData[];
}

export const FilesContext = React.createContext<FilesContextType>({ files: [] }); 