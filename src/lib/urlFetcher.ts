// URL validation regex
export const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

// Function to generate a filename from URL
export const generateFilenameFromUrl = (url: string): string => {
  const urlObj = new URL(url);
  const basename = urlObj.hostname.replace(/^www\./, '') + urlObj.pathname.replace(/\//g, '-');
  return `${basename}.md`.replace(/[^a-z0-9.-]/gi, '-').toLowerCase();
};

// Function to fetch URL content and convert to markdown
export const fetchUrlContent = async (url: string): Promise<string> => {
  try {
    const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to fetch URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.markdown;
  } catch (error) {
    console.error('Error fetching URL:', error);
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    return `# Content from ${domain}

## Metadata
- Source: ${url}
- Fetched: ${new Date().toISOString()}
- Status: Error (Service unavailable)

## Content
Failed to fetch content. Please check:
1. The Modal API is running and accessible
2. Your environment variables are correctly set
3. The API key is valid

### Raw URL
\`\`\`
${url}
\`\`\`
`;
  }
};

// Types for URL mentions
export type UrlMentionElement = {
  type: 'url-mention';
  url: string;
  fileName: string;
  children: [{ text: '' }];
}; 