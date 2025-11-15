# PDF Table Extractor

A client-side PDF table extractor built with Svelte, TypeScript, and Tailwind CSS. Upload PDF files, preview them in a modal, and extract tables to CSV format - all in your browser without any backend.

## Features

- 📄 **PDF Upload**: Simple file upload form for PDF documents
- 👁️ **PDF Preview**: View uploaded PDFs in a modal dialog
- 📊 **Table Extraction**: Extract tables from PDF files
- 💾 **CSV Export**: Convert extracted tables to CSV format
- 🖥️ **Client-Side Only**: No backend or server required - everything runs in your browser
- 🎨 **Tailwind CSS**: Beautiful, responsive UI

## Tech Stack

- **SvelteKit** - Web framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **PDF.js** - PDF parsing and rendering
- **PapaParse** - CSV generation

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
```sh
git clone https://github.com/emnopal/pdf-extractor-svelte.git
cd pdf-extractor-svelte
```

2. Install dependencies:
```sh
npm install
```

### Development

Start the development server:

```sh
npm run dev
```

Or open the app in a new browser tab:

```sh
npm run dev -- --open
```

### Building

To create a production version:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Usage

1. Open the application in your browser
2. Click "Choose File" and select a PDF file
3. The PDF will open in a modal with a preview
4. Click "Convert to CSV" to extract tables and download as CSV
5. Click the X button or "Close" to close the modal and clear the PDF from memory

## Type Checking

Run type checking:

```sh
npm run check
```

Watch mode for type checking:

```sh
npm run check:watch
```

## License

This project is open source and available under the MIT License.

## Deployment

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

For static hosting (since this is a client-side app), use `@sveltejs/adapter-static`.
