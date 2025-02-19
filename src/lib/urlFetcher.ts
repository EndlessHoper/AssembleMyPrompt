// URL validation regex - more permissive to allow various formats
export const URL_REGEX = /^(?:(?:https?:\/\/)?(?:www\.)?)?[a-zA-Z0-9][-a-zA-Z0-9@:%._+~#=]{0,256}\.[a-z]{2,}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;

// Function to normalize URL (add protocol if missing)
export const normalizeUrl = (url: string): string => {
  url = url.trim().toLowerCase();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  if (!url.startsWith('https://www.') && !url.startsWith('http://www.') && url.match(/^https?:\/\/[^.]+\.[^.]+\./)) {
    url = url.replace(/^(https?:\/\/)/, '$1www.');
  }
  return url;
};

// Function to generate a filename from URL
export const generateFilenameFromUrl = (url: string): string => {
  const normalizedUrl = normalizeUrl(url);
  const urlObj = new URL(normalizedUrl);
  const basename = urlObj.hostname.replace(/^www\./, '') + urlObj.pathname.replace(/\//g, '-');
  return `${basename}.md`.replace(/[^a-z0-9.-]/gi, '-').toLowerCase();
};

// Function to fetch URL content and convert to markdown
export const fetchUrlContent = async (url: string): Promise<string> => {
  const normalizedUrl = normalizeUrl(url);
  try {
    const response = await fetch(`/api/scrape?url=${encodeURIComponent(normalizedUrl)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to fetch URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.markdown;
  } catch (error) {
    console.error('Error fetching URL:', error);
    const urlObj = new URL(normalizedUrl);
    const domain = urlObj.hostname.replace('www.', '');
    
    return `# Content from ${domain}

## Metadata
- Source: ${normalizedUrl}
- Fetched: ${new Date().toISOString()}
- Status: Error (Service unavailable)

## Content
Failed to fetch content. Please check:
1. The Modal API is running and accessible
2. Your environment variables are correctly set
3. The API key is valid

### Raw URL
\`\`\`
${normalizedUrl}
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