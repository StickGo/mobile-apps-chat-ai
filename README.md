# Mobile Chat AI App

A beautiful and interactive Chat AI application built with React Native and Expo.

## Features

- **Conversation List**: View your recent chats with AI assistants.
- **Chat Detail**: Interactive chat interface with message bubbles, timestamps, and animations.
- **Profile**: Manage your profile and app settings.
- **Bonus Features**:
    - ✨ **Animations**: Smooth message entries and layout transitions.
    - ⌨️ **Typing Indicator**: Visual feedback when AI is "responding".
    - 🔄 **Pull to Refresh**: Easily refresh your conversation list.
    - 🌙 **Dark Mode Toggle**: Switch between light and dark themes (UI only).

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (File-based routing)
- **Icons**: Lucide React Native
- **Animations**: React Native Reanimated
- **Language**: TypeScript

## Project Structure

```text
app/
├── (tabs)/
│   ├── index.tsx      # Conversation List
│   ├── profile.tsx    # Profile Screen
│   └── _layout.tsx    # Tab Navigation
├── chat/
│   └── [id].tsx       # Chat Detail Screen
└── _layout.tsx        # Root Stack Navigation
components/            # Shared components
constants/             # Theme and colors
```

## How to Run

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd mobile-app-chatai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the project**:
   ```bash
   npx expo start
   ```

4. **Open on your device**:
   - Use the **Expo Go** app on iOS or Android.
   - Scan the QR code from the terminal or browser.

## Evaluation Criteria Met

- [x] Application runs without error.
- [x] Conversation List complete (Avatar, title, preview, time).
- [x] Chat Detail with bubbles (AI left, User right, timestamps).
- [x] Profile with menu (Avatar, email, menu items).
- [x] Navigation functioning (Tabs and Stack).
- [x] Consistent styling.
- [x] Bonus: Dark mode toggle (+5).
- [x] Bonus: Animations (+5).
- [x] Bonus: Typing indicator (+5).
- [x] Bonus: Pull to refresh (+5).
