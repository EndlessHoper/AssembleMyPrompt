import React, { useState, useMemo, useCallback, ChangeEvent } from "react";
import {
  createEditor,
  Descendant,
  Transforms,
  Editor,
  Range,
  Element as SlateElement,
  BaseRange,
} from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { FileText, Upload, Link as LinkIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { marked } from "marked";
import { useDropzone } from "react-dropzone";
import { FileMention } from "./FileMention";
import { UrlMention } from "./UrlMention";
import { FilesContext, FileData } from "../contexts/FilesContext";
import {
  URL_REGEX,
  generateFilenameFromUrl,
  fetchUrlContent,
  UrlMentionElement,
  normalizeUrl,
} from "../lib/urlFetcher";
import { Input } from "../components/ui/input";

// Define custom types for file mentions
type FileMentionElement = {
  type: "file-mention";
  fileName: string;
  children: [{ text: "" }];
};

type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

type CustomElement = FileMentionElement | UrlMentionElement | ParagraphElement;
type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Plugin to handle inline mentions
const withMentions = (editor: Editor) => {
  const { isInline, isVoid } = editor;
  editor.isInline = (element) =>
    element.type === "file-mention" || element.type === "url-mention"
      ? true
      : isInline(element);
  editor.isVoid = (element) =>
    element.type === "file-mention" || element.type === "url-mention"
      ? true
      : isVoid(element);
  return editor;
};

// Initial editor state
const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

interface EditorProps {
  attributes: React.HTMLAttributes<HTMLDivElement>;
  children: React.ReactNode;
  element: any;
}

export const PromptAssembler = () => {
  const editor = useMemo(() => withMentions(withReact(createEditor())), []);
  const [editorValue, setEditorValue] = useState<Descendant[]>(initialValue);
  const [target, setTarget] = useState<Range | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [files, setFiles] = useState<FileData[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const { toast } = useToast();

  // Handle focus
  const handleFocus = useCallback(() => {
    // No need to manage placeholder state as it's handled by Slate
  }, []); // Handle blur
  const handleBlur = useCallback(() => {
    // No need to manage placeholder state as it's handled by Slate
  }, []);
  const filteredFiles = files.filter((file) =>
    file.fileName.toLowerCase().includes(search.toLowerCase()),
  );

  const renderElement = useCallback((props: EditorProps) => {
    const { attributes, children, element } = props;
    if (element.type === "file-mention") {
      return <FileMention {...props} data-oid="5yvk-sq" />;
    }
    if (element.type === "url-mention") {
      return <UrlMention {...props} data-oid="n0ajcmj" />;
    }
    return (
      <p {...attributes} data-oid="m4zrwcf">
        {children}
      </p>
    );
  }, []);

  const onChange = (value: Descendant[]) => {
    setEditorValue(value);
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [start] = Range.edges(selection);
      const wordBefore = Editor.before(editor, start, { unit: "word" });
      const beforeRange = wordBefore && Editor.range(editor, wordBefore, start);
      const beforeText = beforeRange && Editor.string(editor, beforeRange);
      const mentionMatch = beforeText && beforeText.match(/(?:^|\s)@(\w*)$/);

      if (mentionMatch) {
        const matchStart =
          wordBefore &&
          Editor.before(editor, start, {
            distance: mentionMatch[0].length - mentionMatch[1].length,
          });
        const matchRange =
          matchStart && Editor.range(editor, matchStart, start);
        setTarget(matchRange || null);
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
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredFiles.length);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex(
            (prev) => (prev - 1 + filteredFiles.length) % filteredFiles.length,
          );
        } else if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          if (filteredFiles.length > 0) {
            insertFileMention(filteredFiles[selectedIndex]);
          }
        } else if (event.key === "Escape") {
          event.preventDefault();
          setTarget(null);
        }
      }
    },
    [selectedIndex, filteredFiles, target],
  );

  const insertFileMention = (file: FileData) => {
    if (target) {
      Transforms.select(editor, target);
      Transforms.delete(editor);
      const mentionNode: FileMentionElement = {
        type: "file-mention",
        fileName: file.fileName,
        children: [{ text: "" }],
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
        content: await readFile(file),
      })),
    );

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    toast({
      title: "Files uploaded!",
      description: `Successfully uploaded ${acceptedFiles.length} file${acceptedFiles.length === 1 ? "" : "s"}`,
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "application/json": [".json"],
    },
  });

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (file.name.toLowerCase().endsWith(".md")) {
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
      .map((n) => {
        if (SlateElement.isElement(n)) {
          if (n.type === "file-mention") {
            const file = files.find((f) => f.fileName === n.fileName);
            return file ? file.content : "";
          }
          if (n.type === "url-mention") {
            const file = files.find((f) => f.fileName === n.fileName);
            return file ? file.content : "";
          }
          return serialize(n.children);
        }
        return n.text;
      })
      .join("");

  const exportPrompt = () => {
    const finalPrompt = serialize(editorValue);
    console.log("Exporting prompt with content:", finalPrompt);
    console.log("Current files:", files);
    navigator.clipboard.writeText(finalPrompt);
    toast({ title: "Prompt copied!", description: "Copied to clipboard" });
  };

  const downloadPrompt = () => {
    const finalPrompt = serialize(editorValue);
    console.log("Downloading prompt with content:", finalPrompt);
    console.log("Current files:", files);
    const blob = new Blob([finalPrompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Prompt downloaded!", description: "Saved as prompt.md" });
  };

  // Process pasted text
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const fragment = event.clipboardData.getData("text/plain");
      const nodes: ParagraphElement[] = fragment.split("\n").map((line) => ({
        type: "paragraph" as const,
        children: [{ text: line }],
      }));
      Transforms.insertNodes(editor, nodes);
    },
    [editor],
  );

  // Handle URL fetch
  const handleUrlFetch = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive",
      });
      return;
    }

    if (!URL_REGEX.test(urlInput.trim())) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    const normalizedUrl = normalizeUrl(urlInput.trim());
    const fileName = generateFilenameFromUrl(normalizedUrl);

    // Check if file with same name already exists
    if (files.some((f) => f.fileName === fileName)) {
      toast({
        title: "Error",
        description: "A file with this name already exists",
        variant: "destructive",
      });
      return;
    }

    // Fetch and process the URL content
    toast({ title: "Fetching URL...", description: normalizedUrl });
    try {
      const content = await fetchUrlContent(normalizedUrl);

      // Add the fetched content as a new file
      const newFile = {
        id: Math.random().toString(),
        fileName,
        content,
      };

      setFiles((prevFiles) => [...prevFiles, newFile]);
      toast({ title: "URL fetched!", description: `Saved as ${fileName}` });
      setUrlInput(""); // Clear the input after successful fetch
    } catch (error) {
      console.error("Error processing URL:", error);
      toast({
        title: "Error fetching URL",
        description: "Failed to fetch content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUrlInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  return (
    <FilesContext.Provider value={{ files }} data-oid="d7_xx77">
      <div className="p-6 max-w-4xl mx-auto" data-oid="zcnib:v">
        <Card className="p-4" data-oid="s71fs21">
          <div className="mb-6" data-oid="lhsde0c">
            <h2
              className="text-xl font-semibold text-gray-900 mb-2"
              data-oid="h740fa4"
            >
              Prompt Assembler
            </h2>
            <p className="text-gray-600" data-oid="zod50qf">
              Build your prompt by uploading files and mentioning them using @
              symbol. You can combine multiple files and add your own text. You
              can also use the box below with a given URL and it will add a
              markdown version of it to your files.
            </p>
          </div>

          <div className="mb-4 space-y-4" data-oid="it8h2.e">
            <div className="flex gap-2" data-oid="czxxc-:">
              <Input
                type="url"
                placeholder="Enter URL to fetch content..."
                value={urlInput}
                onChange={handleUrlInputChange}
                className="flex-1"
                data-oid=".e3i:h-"
              />

              <Button
                onClick={handleUrlFetch}
                disabled={!urlInput.trim()}
                data-oid="4dpu2o8"
              >
                <LinkIcon className="mr-2 h-4 w-4" data-oid="wh0nt-_" />
                Fetch URL
              </Button>
            </div>

            <div
              {...getRootProps()}
              className={`
              p-6 border-2 border-dashed rounded-lg cursor-pointer
              transition-colors duration-200 ease-in-out
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }
            `}
              data-oid="cj:jfud"
            >
              <input {...getInputProps()} data-oid="_sqmrfx" />
              <div
                className="flex flex-col items-center justify-center text-sm text-gray-600"
                data-oid="8uj-ypi"
              >
                <Upload
                  className="w-8 h-8 mb-2 text-gray-400"
                  data-oid="ia3tiz_"
                />

                {isDragActive ? (
                  <p data-oid="mh6t.._">Drop the files here...</p>
                ) : (
                  <>
                    <p className="mb-1" data-oid="jlvm4ol">
                      Drag and drop files here, or click to select files
                    </p>
                    <p className="text-xs text-gray-500" data-oid="kz4jpbu">
                      Supports .txt, .md, and .json files
                    </p>
                  </>
                )}
              </div>
            </div>

            {files.length > 0 ? (
              <div
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                data-oid="cg_tfj."
              >
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="relative group bg-white p-4 rounded-lg border hover:border-blue-500 transition-colors"
                    data-oid="zrj:3a9"
                  >
                    <div
                      className="flex flex-col items-center text-center space-y-2"
                      data-oid="dgln1b0"
                    >
                      <div
                        className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors"
                        data-oid="dvfv1.x"
                      >
                        <FileText
                          className="h-6 w-6 text-blue-600"
                          data-oid="0nrussf"
                        />
                      </div>
                      <span
                        className="font-medium text-gray-900 text-sm break-all"
                        data-oid="0ujsjem"
                      >
                        {file.fileName}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setFiles(files.filter((f) => f.id !== file.id));
                          const newValue = JSON.parse(
                            JSON.stringify(editorValue),
                          );
                          setEditorValue(newValue);
                        }}
                        data-oid="bzw4ssa"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          data-oid="kwrlzer"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                            data-oid="dcm_xf4"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-6 bg-gray-50 rounded-lg border"
                data-oid="q7_kxn3"
              >
                <FileText
                  className="h-8 w-8 mx-auto text-gray-400 mb-2"
                  data-oid="n.pm2ze"
                />

                <p className="text-sm text-gray-500" data-oid="x:z914e">
                  No files uploaded yet. Upload files to include them in your
                  prompt.
                </p>
              </div>
            )}
          </div>

          <Slate
            editor={editor}
            initialValue={editorValue}
            onChange={onChange}
            data-oid="06f3b41"
          >
            <div className="relative" data-oid="ilgnaxn">
              <Editable
                renderElement={renderElement}
                onKeyDown={onKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onPaste={handlePaste}
                className="min-h-[200px] p-4 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                placeholder="Start typing your prompt... (Use @ to mention files)"
                autoFocus
                data-oid="a-jed-d"
              />

              {target && filteredFiles.length > 0 && (
                <div
                  className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[200px] overflow-y-auto"
                  data-oid="rxqbmru"
                >
                  {filteredFiles.map((file, i) => (
                    <div
                      key={file.id}
                      className={`p-2 flex items-center cursor-pointer hover:bg-gray-50 ${
                        i === selectedIndex
                          ? "bg-blue-50 text-blue-900"
                          : "text-gray-900"
                      }`}
                      onMouseDown={() => insertFileMention(file)}
                      data-oid="tp7pgof"
                    >
                      <FileText
                        className="h-4 w-4 mr-2 text-gray-400"
                        data-oid="jj-1mfd"
                      />

                      {file.fileName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Slate>

          <div className="flex gap-2 mt-4" data-oid="es6w.39">
            <Button onClick={exportPrompt} data-oid="tcfbdzd">
              Copy to Clipboard
            </Button>
            <Button
              onClick={downloadPrompt}
              variant="outline"
              data-oid="p3i653x"
            >
              <FileText className="mr-2 h-4 w-4" data-oid="08op2xl" />
              Download as MD
            </Button>
          </div>

          <div
            className="mt-8 pt-4 border-t text-center text-sm text-gray-500"
            data-oid="khp6rsw"
          >
            Built by{" "}
            <a
              href="https://github.com/EndlessHoper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              data-oid="7w9_51i"
            >
              @EndlessHoper
            </a>
          </div>
        </Card>
      </div>
    </FilesContext.Provider>
  );
};
