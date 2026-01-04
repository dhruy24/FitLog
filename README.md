# FitLog - Exercise Tracker

A modern, Next.js-based exercise tracking application that helps you log workouts, track progress, and monitor your fitness journey.

## Features

- **Exercise Selection**: Browse and search through a comprehensive list of exercises
- **Category Filtering**: Filter exercises by muscle group (Chest, Back, Shoulders, Arms, Legs, Core)
- **Workout Logging**: Log exercises with sets, reps, and weight for any date (today or past)
- **History Tracking**: View your workout history and see your personal records (max reps and max weight)
- **Local Storage**: All data is stored locally in your browser

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd fitlog
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Browse Exercises**: Navigate to `/exercises` to see all available exercises
2. **Search & Filter**: Use the search bar to find exercises by name, or filter by category
3. **Log Workout**: Click on an exercise to log a workout
   - Select a date (today or any past date)
   - Add sets with reps and weight
   - Save your workout
4. **View History**: After logging, view your exercise history to see past workouts and personal records

## Project Structure

```
fitlog/
  app/                    # Next.js App Router pages
    exercises/           # Exercise-related pages
      [id]/              # Dynamic exercise routes
        entry/           # Workout entry page
        history/         # Exercise history page
  components/            # React components
  lib/                   # Utility functions
    exercises.ts        # Exercise data
    storage.ts          # LocalStorage utilities
  types/                 # TypeScript type definitions
```

## Technology Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Browser LocalStorage
- **Date Handling**: date-fns

## Deployment on Vercel

The easiest way to deploy FitLog is using [Vercel](https://vercel.com):

1. Push your code to a GitHub repository
2. Import the project on [Vercel](https://vercel.com/new)
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy" and your app will be live!

### Manual Deployment

```bash
npm run build
npm run start
```

## Data Storage

All workout data is stored in the browser's LocalStorage. This means:
- Data persists between sessions
- Data is specific to each browser/device
- No backend or database required
- Data is private and never sent to a server

## License

This project is open source and available for personal use.
