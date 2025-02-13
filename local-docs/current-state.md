
--- Repository Documentation ---

# Documentation

## Repository Summary

This repository contains a React application.
It is built with TypeScript and Shadcn UI.
The application includes a PromptAssembler component.
This component helps users create and manage text prompts with file mentions.

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GIT_URL>
   ```
2. **Navigate to the project directory:**
   ```bash
   cd <YOUR_PROJECT_NAME>
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:8080`.

**Using the `PromptAssembler` component:**

Import the `PromptAssembler` component:

```typescript jsx
import { PromptAssembler } from "@/components/PromptAssembler";

function App() {
  return (
    <div>
      <PromptAssembler />
    </div>
  );
}
```

The `PromptAssembler` provides a text editor with file mention functionality.
Users can upload `.txt`, `.md`, and `.json` files.
Files can be mentioned within prompts using `@filename`.

## Configuration

### `components.json`

This file configures the Shadcn UI component library.
It defines:

- `style`: Base style of components.
- `rsc`: Server Components usage.
- `tsx`: Use of `.tsx` for components.
- `tailwind`: Tailwind CSS configuration.
- `aliases`: Import aliases.

### `tailwind.config.ts`

This file configures Tailwind CSS.
It includes:

- `darkMode`: Dark mode configuration.
- `content`: Files using Tailwind CSS.
- `theme`: Extends default Tailwind theme.
- `plugins`: Tailwind CSS plugins.

Customize the application's appearance by modifying these files.

## `PromptAssembler` Component

The `PromptAssembler` component is located at `src/components/PromptAssembler.tsx`.

**Features:**

- **Text Editor:** Rich text editor based on Slate React.
- **File Mentions:** Mention uploaded files inline using `@filename`.
- **File Upload:** Drag and drop or click to upload `.txt`, `.md`, and `.json` files.
- **File Inventory:** List of uploaded files with remove options.
- **Prompt Export:** Copy prompt to clipboard or download as `.md` file.
- **Markdown Support:** Renders Markdown content from `.md` files.

**Usage:**

Import and use the `PromptAssembler` component in React.
Upload files via drag and drop or click the upload area.
Mention files in the editor by typing `@` followed by the filename.

**Example:**

```typescript jsx
import { PromptAssembler } from "@/components/PromptAssembler";

function MyPage() {
  return (
    <div>
      <h1>Prompt Creator</h1>
      <PromptAssembler />
    </div>
  );
}
```

## Dependencies

Key dependencies:

- `react`: Core React library.
- `react-dom`: React DOM bindings.
- `@radix-ui/react-*`: Set of UI primitives.
- `shadcn-ui`: UI component library.
- `tailwind-merge`: Utility for merging Tailwind CSS classes.
- `tailwindcss-animate`: Plugin for Tailwind CSS animations.
- `vite`: Build tool and development server.
- `typescript`: TypeScript support.
- `slate`: Rich text editor framework.
- `slate-react`: React bindings for Slate.
- `slate-history`: History plugin for Slate editors.
- `react-hook-form`: Form management library.
- `zod`: Schema validation library.
- `lucide-react`: React icons library.

Refer to `package.json` for a complete list of dependencies.

## Advanced Usage Examples

- Programmatically set editor content using state management.
- Extend file mention functionality to support different mention types.
- Integrate with backend APIs to send assembled prompts.
- Customize UI elements using Tailwind CSS and component styling.

--- End of Documentation ---
