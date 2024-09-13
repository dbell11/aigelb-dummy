# NextJS Chatbot

This project is a customizable chatbot built with NextJS, featuring speech-to-text and text-to-speech capabilities, easy language mode, and customer-specific configurations.

## Project Structure

```
/src
  /app
    /components
      /ChatBot
        ChatBot.tsx
        InputArea.tsx
        MessageList.tsx
    /config
      default.ts
      /kunde/kunde1.ts
      /kunde/kunde2.ts
    /kunde1
      page.tsx
    /kunde2
      page.tsx
```

## Features

- Customizable chatbot interface
- Speech-to-text input
- Text-to-speech output
- Easy language mode
- Customer-specific configurations
- Markdown rendering for messages
- Responsive design

## Configuration

The chatbot can be configured using the `ChatBotConfig` interface in `/src/app/config/default.ts`. Each customer can have their own configuration file in the `/src/app/config/` directory.

### Configuration Options

- `apiEndpoint`: API endpoints for conversation, transcription, and synthesis
- `textToSpeechApiEndpoint`: Endpoint for text-to-speech conversion
- `welcomeTitle`: Title displayed in the welcome message
- `welcomeMessage`: Content of the welcome message
- `examplePrompts`: Array of example prompts for users
- `bgColor`: Background color of the chat interface
- `textColor`: Text color of the chat interface
- `easyLanguage`: Enable/disable easy language mode
- `speechToTextEnabled`: Enable/disable speech-to-text functionality
- `logo`: URL or path to the logo image

## Components

### ChatBot

The main component that orchestrates the chatbot functionality.

### InputArea

Handles user input, including text input and speech-to-text functionality.

### MessageList

Displays the conversation history and handles text-to-speech playback.

## Setup and Usage

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure the API endpoints and other settings in the configuration files
4. Run the development server with `npm run dev`
5. Access the chatbot at `http://localhost:3000/kunde1` or `http://localhost:3000/kunde2`

## Customization

To create a new customer-specific chatbot:

1. Create a new configuration file in `/src/app/config/`
2. Create a new page in `/src/app/` for the customer
3. Import and use the ChatBot component with the customer-specific configuration
