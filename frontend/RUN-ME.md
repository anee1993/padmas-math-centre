# Quick Start Guide

## Step 1: Open a NEW Terminal
Close the current Kiro terminal and open a fresh one (this will load Node.js into PATH)

## Step 2: Navigate to frontend folder
```bash
cd frontend
```

## Step 3: Install dependencies
```bash
npm install
```

This will install:
- axios (API calls)
- react-router-dom (routing)
- tailwindcss (styling)
- And other dependencies

## Step 4: Start the development server
```bash
npm run dev
```

The app will start on: http://localhost:5173/

## Alternative: Use the batch file
Double-click `install-and-run.bat` in the frontend folder

---

## Test the Application

1. **Register a Student:**
   - Go to http://localhost:5173/register
   - Fill in the form
   - Submit

2. **Login as Teacher:**
   - Email: teacher@mathtuition.com
   - Password: Teacher@123
   - Approve the student

3. **Login as Student:**
   - Use the email/password you registered with
   - Access student dashboard

---

## Troubleshooting

If npm is not recognized:
1. Close ALL terminals
2. Restart Kiro
3. Open a new terminal
4. Try again

If port 5173 is busy:
- The dev server might already be running
- Check http://localhost:5173/
