## Documentation

### Repository Summary

This repository is a React application built with TypeScript and Shadcn UI.
It includes a set of reusable UI components and a `PromptAssembler` component.
The `PromptAssembler` component allows users to create and manage text prompts, including file mentions.

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_GIT_URL>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd <YOUR_PROJECT_NAME>
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:8080`.

**Using the `PromptAssembler` component:**

Import the `PromptAssembler` component in your React application:

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

The `PromptAssembler` component provides a text editor with file mention functionality.
Users can upload `.txt`, `.md`, and `.json` files and mention them within the prompt using `@filename`.

**Using Shadcn UI components:**

This project utilizes Shadcn UI for its UI components.
Refer to the [Shadcn UI documentation](https://ui.shadcn.com/docs) for detailed information on available components and their usage.

Example using a Shadcn UI Button:

```typescript jsx
import { Button } from "@/components/ui/button";

function MyComponent() {
  return <Button>Click me</Button>;
}
```

### Configuration

**`components.json`:**

This file configures Shadcn UI component library.
It defines:

-   `style`: Base style of components (default).
-   `rsc`:  Server Components usage (false).
-   `tsx`:  Use of `.tsx` for components (true).
-   `tailwind`: Tailwind CSS configuration including config file, CSS file, base color, CSS variables, and prefix.
-   `aliases`:  Import aliases for components, utils, UI components, and hooks.

**`tailwind.config.ts`:**

This file configures Tailwind CSS.
It includes:

-   `darkMode`: Dark mode configuration (class-based).
-   `content`: Paths to files that use Tailwind CSS.
-   `theme`:  Extends default Tailwind theme, defining colors, border radius, keyframes and animations.
-   `plugins`: Includes `tailwindcss-animate` plugin for animations.

You can customize the look and feel of the application by modifying these configuration files.

### API Documentation

#### `PromptAssembler` Component

The `PromptAssembler` component is located at `src/components/PromptAssembler.tsx`.

**Features:**

-   **Text Editor:**  Provides a rich text editor based on Slate React.
-   **File Mentions:** Allows mentioning uploaded files inline using `@` followed by the filename.
-   **File Upload:** Supports drag and drop or click to upload `.txt`, `.md`, and `.json` files.
-   **File Inventory:** Displays a list of uploaded files with options to remove them.
-   **Prompt Export:**  Allows copying the assembled prompt to the clipboard or downloading it as a `.md` file.
-   **Markdown Support:**  Renders and parses Markdown content from `.md` files.

**Usage:**

Import and use the `PromptAssembler` component in your React component.  Files can be uploaded via drag and drop or by clicking the upload area.  Mention files in the editor by typing `@` followed by the filename.

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

### Dependencies

Key dependencies used in this project:

-   **react**: Core React library.
-   **react-dom**:  React DOM bindings.
-   **@radix-ui/react-\***:  A set of accessible UI primitives.
-   **shadcn-ui**:  UI component library built with Radix UI and Tailwind CSS.
-   **tailwind-merge**:  Utility for merging Tailwind CSS classes.
-   **tailwindcss-animate**:  Plugin for Tailwind CSS animations.
-   **vite**:  Fast build tool and development server.
-   **typescript**:  TypeScript language support.
-   **slate**:  Framework for building rich text editors.
-   **slate-react**:  React bindings for Slate.
-   **slate-history**: History plugin for Slate editors.
-   **react-hook-form**:  Library for form management in React.
-   **zod**:  Schema validation library.
-   **lucide-react**:  React icons library.
-   **embla-carousel-react**:  Carousel component for React.
-   **react-day-picker**:  Date picker component for React.
-   **react-dropzone**:  Library for drag and drop file uploads.
-   **input-otp**:  Component for OTP input fields.
-   **sonner**:  Toast notification library.
-   **vaul**: Drawer component library.
-   **cmdk**: Command menu component library.
-   **recharts**: Charting library for React.
-   **react-resizable-panels**:  Library for creating resizable panels.
-   **next-themes**:  Library for theming in Next.js and React apps (used for theme context).
-   **marked**:  Markdown parser and compiler.

Refer to `package.json` for the complete list and versions of dependencies.

### Advanced Usage Examples

The `PromptAssembler` component can be further customized and integrated into more complex workflows. For example, you can:

-   **Programmatically set editor content:** Use state management to control the editor's value from outside the component.
-   **Extend file mention functionality:**  Modify the `withFileMentions` plugin to support different types of mentions or file metadata.
-   **Integrate with backend APIs:**  Send the assembled prompt to a backend API for processing or storage.
-   **Customize UI elements:** Style the `PromptAssembler` and Shadcn UI components using Tailwind CSS and component styling.