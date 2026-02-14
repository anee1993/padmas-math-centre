# Padma's Math Centre - Frontend

React + Vite frontend for the mathematics tuition management system.

## Features

- Student registration and authentication
- Teacher dashboard with student management
- Virtual classroom integration
- Assignment management with file uploads
- Grading system
- Responsive design with Tailwind CSS

## Tech Stack

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Context API for state management

## Development Setup

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your backend URL
# VITE_API_URL=http://localhost:8080/api

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

## Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env.local` file for development:

```env
VITE_API_URL=http://localhost:8080/api
```

For production, set `VITE_API_URL` to your deployed backend URL.

## Deployment

See [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variable: `VITE_API_URL`
4. Deploy

## Project Structure

```
src/
├── api/           # API configuration
├── assets/        # Static assets
├── components/    # Reusable components
├── context/       # React Context providers
├── pages/         # Page components
├── App.jsx        # Main app component
└── main.jsx       # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features by Role

### Teacher
- Approve/reject student registrations
- Manage virtual classroom links
- Create and manage assignments
- Grade student submissions
- View all student submissions by class

### Student
- Register and wait for approval
- Join virtual classrooms
- View and submit assignments
- View grades and feedback
- Track assignment status

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - Educational Use Only
