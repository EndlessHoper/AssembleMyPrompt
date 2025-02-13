import React, { useState, useMemo, useCallback } from 'react';
import {
  createEditor,
  Descendant,
  Transforms,
  Editor,
  Range,
  Element as SlateElement,
} from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { marked } from 'marked';
import { useDropzone } from 'react-dropzone';
import { FileMention } from './FileMention';
import { UrlMention } from './UrlMention';
import { FilesContext, FileData } from '../contexts/FilesContext';
import { URL_REGEX, generateFilenameFromUrl, fetchUrlContent, UrlMentionElement } from '../lib/urlFetcher';

// Define custom types for file mentions
type FileMentionElement = {
  type: 'file-mention';
  fileName: string;
  children: [{ text: '' }];
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomElement = FileMentionElement | UrlMentionElement | ParagraphElement;
type CustomText = { text: string };

declare module 'slate' {
  interface CustomTypes {
    Editor: ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Plugin to handle inline mentions
const withMentions = (editor: Editor) => {
  const { isInline, isVoid } = editor;
  editor.isInline = element => 
    (element.type === 'file-mention' || element.type === 'url-mention') ? true : isInline(element);
  editor.isVoid = element => 
    (element.type === 'file-mention' || element.type === 'url-mention') ? true : isVoid(element);
  return editor;
};

// Initial editor state
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Type @ to mention a file or paste a URL...' }],
  },
];

export const PromptAssembler = () => {
  const editor = useMemo(() => withMentions(withReact(createEditor())), []);
  const [editorValue, setEditorValue] = useState<Descendant[]>([{
    type: 'paragraph',
    children: [{ text: '' }],
  }]);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [target, setTarget] = useState<Range | null>(null);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [files, setFiles] = useState<FileData[]>([]);
  const { toast } = useToast();

  // Handle focus
  const handleFocus = useCallback(() => {
    setShowPlaceholder(false);
  }, []);

  // Handle blur
  const handleBlur = useCallback(() => {
    // Only show placeholder if editor is empty
    const isEditorEmpty = editorValue.length === 1 && 
      SlateElement.isElement(editorValue[0]) && 
      editorValue[0].children.length === 1 && 
      editorValue[0].children[0].text === '';
    setShowPlaceholder(isEditorEmpty);
  }, [editorValue]);

  const filteredFiles = files.filter(file =>
    file.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const renderElement = useCallback((props) => {
    const { attributes, children, element } = props;
    if (element.type === 'file-mention') {
      return <FileMention {...props} />;
    }
    if (element.type === 'url-mention') {
      return <UrlMention {...props} />;
    }
    return <p {...attributes}>{children}</p>;
  }, []);

  const onChange = (value: Descendant[]) => {
    setEditorValue(value);
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [start] = Range.edges(selection);
      const wordBefore = Editor.before(editor, start, { unit: 'word' });
      const beforeRange = wordBefore && Editor.range(editor, wordBefore, start);
      const beforeText = beforeRange && Editor.string(editor, beforeRange);
      const mentionMatch = beforeText && beforeText.match(/(?:^|\s)@(\w*)$/);

      if (mentionMatch) {
        const matchStart = wordBefore && Editor.before(editor, start, { distance: mentionMatch[0].length - mentionMatch[1].length });
        const matchRange = matchStart && Editor.range(editor, matchStart, start);
        setTarget(matchRange);
        setSearch(mentionMatch[1]);
        setSelectedIndex(0);
        return;
      }
    }
    setTarget(null);
  };

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (target) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredFiles.length);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredFiles.length) % filteredFiles.length);
        } else if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault();
          if (filteredFiles.length > 0) {
            insertFileMention(filteredFiles[selectedIndex]);
          }
        } else if (event.key === 'Escape') {
          event.preventDefault();
          setTarget(null);
        }
      }
    },
    [selectedIndex, filteredFiles, target]
  );

  const insertFileMention = (file: FileData) => {
    if (target) {
      Transforms.select(editor, target);
      Transforms.delete(editor);
      const mentionNode: FileMentionElement = {
        type: 'file-mention',
        fileName: file.fileName,
        children: [{ text: '' }],
      };
      Transforms.insertNodes(editor, mentionNode);
      Transforms.move(editor);
      setTarget(null);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const newFiles = await Promise.all(
      acceptedFiles.map(async (file) => ({
        id: Math.random().toString(),
        fileName: file.name,
        content: await readFile(file)
      }))
    );

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    toast({ 
      title: 'Files uploaded!', 
      description: `Successfully uploaded ${acceptedFiles.length} file${acceptedFiles.length === 1 ? '' : 's'}`
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json']
    }
  });

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (file.name.toLowerCase().endsWith('.md')) {
          marked.setOptions({ gfm: true });
          resolve(marked.parse(content));
        } else {
          resolve(content);
        }
      };
      reader.readAsText(file);
    });
  };

  const serialize = (nodes: Descendant[]): string =>
    nodes
      .map(n => {
        if (SlateElement.isElement(n)) {
          if (n.type === 'file-mention') {
            const file = files.find(f => f.fileName === n.fileName);
            return file ? file.content : '';
          }
          if (n.type === 'url-mention') {
            const file = files.find(f => f.fileName === n.fileName);
            return file ? file.content : '';
          }
          return serialize(n.children);
        }
        return n.text;
      })
      .join('');

  const exportPrompt = () => {
    const finalPrompt = serialize(editorValue);
    console.log('Exporting prompt with content:', finalPrompt);
    console.log('Current files:', files);
    navigator.clipboard.writeText(finalPrompt);
    toast({ title: 'Prompt copied!', description: 'Copied to clipboard' });
  };

  const downloadPrompt = () => {
    const finalPrompt = serialize(editorValue);
    console.log('Downloading prompt with content:', finalPrompt);
    console.log('Current files:', files);
    const blob = new Blob([finalPrompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompt.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Prompt downloaded!', description: 'Saved as prompt.md' });
  };

  // Process pasted text for URLs
  const handlePaste = useCallback(
    async (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const pastedText = event.clipboardData.getData('text');
      
      // Check if the pasted text contains a URL
      const urlMatch = pastedText.match(URL_REGEX);
      if (urlMatch) {
        const url = urlMatch[0];
        const fileName = generateFilenameFromUrl(url);
        
        // Create URL mention node
        const urlNode: UrlMentionElement = {
          type: 'url-mention',
          url,
          fileName,
          children: [{ text: '' }],
        };
        
        // Insert the URL mention
        Transforms.insertNodes(editor, urlNode);
        
        // Fetch and process the URL content
        toast({ title: 'Fetching URL...', description: url });
        try {
          const content = await fetchUrlContent(url);
          
          // Add the fetched content as a new file
          const newFile = {
            id: Math.random().toString(),
            fileName,
            content,
          };
          
          setFiles(prevFiles => [...prevFiles, newFile]);
          toast({ title: 'URL fetched!', description: `Saved as ${fileName}` });
        } catch (error) {
          console.error('Error processing URL:', error);
          toast({ 
            title: 'Error fetching URL', 
            description: 'Failed to fetch content. Please try again.',
            variant: 'destructive'
          });
        }
      } else {
        // Handle regular paste
        const fragment = event.clipboardData.getData('text/plain');
        const nodes: ParagraphElement[] = fragment.split('\n').map(line => ({
          type: 'paragraph' as const,
          children: [{ text: line }],
        }));
        Transforms.insertNodes(editor, nodes);
      }
    },
    [editor, toast]
  );

  return (
    <FilesContext.Provider value={{ files }}>
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-4">
          <div className="mb-4 space-y-4">
            <div {...getRootProps()} className={`
              p-6 border-2 border-dashed rounded-lg cursor-pointer
              transition-colors duration-200 ease-in-out
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
              }
            `}>
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center text-sm text-gray-600">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                {isDragActive ? (
                  <p>Drop the files here...</p>
                ) : (
                  <>
                    <p className="mb-1">Drag and drop files here, or click to select files</p>
                    <p className="text-xs text-gray-500">Supports .txt, .md, and .json files</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-900 mb-2">File Inventory</h3>
              {files.length > 0 ? (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{file.fileName}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setFiles(files.filter(f => f.id !== file.id));
                          const newValue = JSON.parse(JSON.stringify(editorValue));
                          setEditorValue(newValue);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No files uploaded yet. Upload files to include them in your prompt.</p>
              )}
            </div>
          </div>

          <Slate editor={editor} initialValue={editorValue} onChange={onChange}>
            <div className="relative">
              <Editable 
                renderElement={renderElement} 
                onKeyDown={onKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onPaste={handlePaste}
                className="min-h-[200px] p-4 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500" 
              />
              {showPlaceholder && (
                <div className="absolute inset-0 pointer-events-none p-4 text-gray-400">
                  Type @ to mention a file or paste a URL...
                </div>
              )}
              {target && filteredFiles.length > 0 && (
                <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[200px] overflow-y-auto">
                  {filteredFiles.map((file, i) => (
                    <div
                      key={file.id}
                      className={`p-2 flex items-center cursor-pointer hover:bg-gray-50 ${
                        i === selectedIndex ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                      }`}
                      onMouseDown={() => insertFileMention(file)}
                    >
                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      {file.fileName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Slate>

          <div className="flex gap-2 mt-4">
            <Button onClick={exportPrompt}>
              Copy to Clipboard
            </Button>
            <Button onClick={downloadPrompt} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Download as MD
            </Button>
          </div>
        </Card>
      </div>
    </FilesContext.Provider>
  );
};
