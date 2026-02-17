# IST Date Display Issue - Root Cause Analysis

## The Problem
Dates are displaying in UTC instead of IST (Indian Standard Time) across the application.

## Root Cause Identified

### Backend Configuration
In `src/main/resources/application.yml`, line 33:
```yaml
jdbc:
  time_zone: UTC
```

This forces Hibernate to store and retrieve ALL timestamps in UTC timezone.

### How It Works
1. Teacher creates assignment with due date: "Feb 18, 2025 11:15 PM IST"
2. Backend stores in database as: "2025-02-18T17:45:00Z" (UTC)
3. Backend sends to frontend as: "2025-02-18T17:45:00.000Z"
4. Frontend should convert to IST: "18 Feb 2025, 11:15 pm"

## Current Status

### What We've Implemented ✅
1. `formatToIST()` function in 6 frontend components
2. Uses `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'`
3. Should automatically convert UTC to IST

### Why It Might Not Be Working ❌

**Hypothesis 1: Code Not Deployed**
- Vercel might not have picked up the latest changes
- Browser cache might be showing old version
- Need to verify with debug logs

**Hypothesis 2: Function Not Being Called**
- The formatToIST function exists but isn't being invoked
- Date might be displayed directly without formatting
- Need to check actual rendering code

**Hypothesis 3: Date Format Issue**
- Backend might be sending dates in a format that JavaScript can't parse
- Need to verify the exact format from API response

## Testing Strategy

### Step 1: Verify Code Deployment
1. Check for version log: `IST-FIX-v3`
2. Click "Test IST Formatting" button
3. Verify function works in isolation

### Step 2: Check API Response
1. Look at console log: `📅 Due date from API:`
2. Verify format is ISO 8601 with Z suffix
3. Example: `2025-02-18T17:45:00.000Z`

### Step 3: Verify Function Calls
1. Look for console logs: `formatToIST: ... → ...`
2. Should see one log per date displayed
3. Verify conversion is correct

## Expected vs Actual

### Expected Flow
```
API: "2025-02-18T17:45:00.000Z"
  ↓
formatToIST()
  ↓
Display: "18 Feb 2025, 11:15 pm"
```

### If Still Showing UTC
```
API: "2025-02-18T17:45:00.000Z"
  ↓
??? (formatToIST not called or not working)
  ↓
Display: "Feb 18, 2025, 5:45 PM" (UTC)
```

## Solutions

### Solution 1: Frontend Fix (Current Approach) ✅
- Keep backend in UTC (best practice)
- Convert to IST in frontend using formatToIST
- **Status**: Implemented, needs verification

### Solution 2: Backend Timezone Change (Not Recommended) ❌
- Change `time_zone: UTC` to `time_zone: Asia/Kolkata`
- **Problem**: Makes backend timezone-dependent
- **Problem**: Breaks if users are in different timezones
- **Not recommended for production**

### Solution 3: Hybrid Approach
- Keep backend in UTC
- Add timezone field to user profile
- Display dates in user's timezone
- **Future enhancement**

## Immediate Action Required

1. **Deploy Latest Code**
   - Push to GitHub ✅ (Done)
   - Wait for Vercel deployment
   - Verify deployment succeeded

2. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R)
   - Or use incognito mode
   - Or clear cache completely

3. **Test with Debug Tools**
   - Open Assignment Details page
   - Check console for version log
   - Click "Test IST Formatting" button
   - Report back findings

4. **Share Console Output**
   - Copy all console logs
   - Share screenshot of page
   - Share what date is actually displayed

## Why UTC in Backend is Good Practice

1. **Consistency**: All times stored in one timezone
2. **No DST Issues**: UTC doesn't have daylight saving time
3. **Multi-timezone Support**: Easy to convert to any timezone
4. **Industry Standard**: Most applications use UTC in backend

## Next Steps

Based on debug output, we'll:
1. Verify formatToIST is being called
2. Check if conversion is working correctly
3. Identify why dates still show UTC
4. Apply targeted fix

---

**Created**: Feb 16, 2026
**Status**: Investigating
**Priority**: High
