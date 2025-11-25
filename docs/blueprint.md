# **App Name**: CollabCanvas

## Core Features:

- User Authentication: Users can register, log in, and manage their accounts using Google Authentication.
- Room Creation & Sharing: Users can create rooms and share the room link with others for collaborative access.
- Realtime Whiteboard: A collaborative whiteboard where multiple users can draw and see changes in real-time. Uses Firebase Realtime Database for synchronization.
- Realtime Code Editor: A collaborative code editor with syntax highlighting, code completion, and multiple language support, changes synchronized in real-time using Firebase Realtime Database.
- Code Execution Environment: Backend to execute code entered into editor.
- Input/Output Handling: Dedicated input box for providing input to the code and an output box to display the result after execution.
- Host Control & Write Transfer: The room host can see a list of connected users and transfer host control to another user. The host is capable of transfering white board writing power and code editor witing power to specific user.

## Style Guidelines:

- Primary color: Soft sky blue (#87CEEB) evoking collaboration and creativity.
- Background color: Light, desaturated blue-gray (#E8F0FE) to minimize distraction.
- Accent color: Warm orange (#FFA500) to highlight key interactive elements.
- Body and headline font: 'Inter', a grotesque-style sans-serif, for a clean, modern, neutral look suitable for both headlines and body text.
- Code font: 'Source Code Pro', a monospace font, for code snippets.
- Simple, clear icons for tools and actions in the whiteboard and code editor.
- Tab-based navigation to switch between the whiteboard and code editor, with a clear visual hierarchy.
- Subtle animations for UI transitions and feedback on user actions.