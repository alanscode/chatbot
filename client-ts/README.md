# Claude 3.7 Chatbot - TypeScript Client

This is a TypeScript React client for the Claude 3.7 Chatbot application. It provides a user interface for interacting with the Claude 3.7 API through the backend server.

## Features

- Chat interface with Claude 3.7
- Real-time streaming of responses
- Markdown and code syntax highlighting
- TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client-ts directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

4. Install the @tailwindcss/typography plugin:

```bash
npm install @tailwindcss/typography
# or
yarn add @tailwindcss/typography
```

### Running the Application

Start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at http://localhost:3002.

## Usage

- Type a message in the input field and press Enter or click the send button
- The response will stream in real-time
- Toggle between the chat interface and streaming test using the button at the top

## API Integration

The client communicates with the backend server at http://localhost:5000/api. Make sure the server is running before using the client.

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Axios for API requests
- react-markdown for rendering markdown
- react-syntax-highlighter for code highlighting 