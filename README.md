# React Native Expo App

A modern dark-themed React Native Expo application with bottom tab navigation.

## Features

- Modern dark theme UI
- Bottom navigation with 5 tabs:
  - Home: Dashboard with stats, quick actions, and recent activity
  - Explore: Browse and discover content with search and categories
  - Add: Create new content with multiple options
  - Notifications: Stay updated with recent notifications
  - Profile: Manage your profile and settings
- TypeScript support
- Responsive design
- Modern UI components with Ionicons

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device (for testing)

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Running the App

### Start the development server:

```bash
npm start
```

### Run on specific platforms:

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Project Structure

```
jyelmg/
├── assets/           # Images and other static assets
├── src/
│   ├── screens/      # All screen components
│   │   ├── HomeScreen.tsx
│   │   ├── ExploreScreen.tsx
│   │   ├── AddScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── theme/        # Theme configuration
│       └── colors.ts
├── App.tsx           # Main app component with navigation
├── app.json          # Expo configuration
├── package.json      # Dependencies
└── tsconfig.json     # TypeScript configuration
```

## Customization

### Colors
Edit `src/theme/colors.ts` to customize the color scheme.

### Navigation
Edit `App.tsx` to modify navigation structure or add new tabs.

### Screens
All screen components are in `src/screens/`. Modify or add new screens as needed.

## Assets

Place your app icons and splash screen in the `assets/` folder:
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen (1284x2778)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `favicon.png` - Web favicon (48x48)

## Notes

- The app uses Expo SDK 52
- React Navigation v6 for navigation
- Ionicons for icons
- Dark theme is set as default

## License

MIT
