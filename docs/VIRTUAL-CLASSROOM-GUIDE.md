# Virtual Classroom Feature Guide

## Overview
The Virtual Classroom feature provides Google Meet-like video conferencing for each class grade (6-10) using Jitsi Meet.

## Key Features

✅ **Class-Specific Rooms:** Each grade has its own dedicated virtual classroom
✅ **Waiting Room Logic:** Students wait until teacher joins (like WebEx)
✅ **Teacher Moderator:** Teacher has full controls including screen sharing
✅ **Student Participant:** Students have limited controls (camera, mic, chat)
✅ **No Installation Required:** Works directly in browser
✅ **Free & Open Source:** Uses Jitsi Meet (meet.jit.si)

## How It Works

### For Students:
1. Login to student dashboard
2. See "Join Virtual Classroom" button
3. Click to join their class's virtual room
4. Wait in lobby until teacher joins
5. Once teacher joins, full video conference starts
6. Can use camera, microphone, chat, raise hand

### For Teacher:
1. Login to teacher dashboard
2. Access all virtual classrooms (Class 6-10)
3. Join any classroom as moderator
4. Full controls: screen share, mute all, recording, etc.
5. Students automatically join once teacher is present

## Technical Details

### Backend:
- Virtual classrooms initialized on app startup
- One room per grade: `padma-math-class-{6-10}`
- API endpoints:
  - `GET /api/virtual-classroom/my-classroom/{grade}` - Get classroom for specific grade
  - `GET /api/virtual-classroom/all` - Get all classrooms (teacher only)

### Frontend:
- Jitsi Meet External API integration
- Room naming: `padma-math-class-{grade}`
- Teacher role: Moderator with all toolbar buttons
- Student role: Participant with limited toolbar

### Jitsi Configuration:
- Domain: meet.jit.si (free hosted service)
- No prejoin page (direct entry)
- Audio/video muted by default for students
- Custom branding: "Padma's Math Centre"

## Teacher Controls

When teacher joins as moderator, they can:
- 📹 Share screen
- 🎤 Mute/unmute all participants
- 🎥 Disable video for all
- 📝 Use whiteboard
- 📊 View participant list
- 💬 Moderate chat
- 🔒 Lock room
- 📹 Record session (optional)
- ⚙️ Manage settings

## Student Controls

Students can:
- 🎤 Mute/unmute their microphone
- 🎥 Turn camera on/off
- 💬 Send chat messages
- ✋ Raise hand
- 👁️ View participants
- 🖼️ Change background (virtual)
- ⚙️ Adjust settings

## Setup Instructions

### 1. Update Frontend Dependencies
Run in frontend folder:
```bash
npm install
```

Or double-click: `frontend/update-dependencies.bat`

### 2. Restart Backend
The backend will automatically create virtual classrooms for grades 6-10 on startup.

### 3. Test the Feature

**As Student:**
1. Register a student account
2. Teacher approves registration
3. Login as student
4. Click "Join Virtual Classroom"
5. You'll see waiting message

**As Teacher:**
1. Login as teacher
2. Navigate to virtual classroom section
3. Join a classroom
4. Students can now join and see you

## Room URLs

Each class has a permanent room URL:
- Class 6: https://meet.jit.si/padma-math-class-6
- Class 7: https://meet.jit.si/padma-math-class-7
- Class 8: https://meet.jit.si/padma-math-class-8
- Class 9: https://meet.jit.si/padma-math-class-9
- Class 10: https://meet.jit.si/padma-math-class-10

## Browser Compatibility

Works on:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS/Android)

## Permissions Required

Users need to grant:
- 🎤 Microphone access
- 🎥 Camera access (optional)

## Troubleshooting

### Students can't join:
- Ensure teacher has joined first
- Check browser permissions for camera/mic
- Try refreshing the page

### No video/audio:
- Check browser permissions
- Ensure camera/mic are not used by another app
- Try different browser

### Poor quality:
- Check internet connection
- Reduce number of participants with video on
- Close other bandwidth-heavy applications

## Future Enhancements (Phase 3)

- 📹 Session recording
- 📊 Attendance tracking
- 📅 Scheduled classes with auto-join
- 📧 Email notifications before class
- 💾 Save chat history
- 📝 Breakout rooms
- 🎯 Polls and quizzes during session

## Security

- Rooms are persistent but require authentication
- Only enrolled students can access their class room
- Teacher has moderator privileges
- Can lock room to prevent new joiners
- Can remove disruptive participants

## Cost

- **Free:** Using meet.jit.si (Jitsi's free hosted service)
- **Limitations:** None for typical class sizes (up to 50 participants)
- **Alternative:** Can self-host Jitsi for more control

## Support

For issues or questions:
1. Check browser console for errors
2. Verify internet connection
3. Try incognito/private mode
4. Clear browser cache
5. Contact system administrator
