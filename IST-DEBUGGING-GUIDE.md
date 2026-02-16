# IST Date Display Debugging Guide

## Current Status
Dates are still showing in UTC instead of IST despite code changes being deployed.

## What We've Done
1. ✅ Inlined `formatToIST()` function in 6 component files
2. ✅ Added debug logging to AssignmentDetail.jsx
3. ✅ Deployed to Vercel
4. ❌ Dates still showing in UTC

## Debug Steps to Follow

### Step 1: Verify Code Version
1. Open the Assignment Details page in your browser
2. Open browser console (F12 or Right-click → Inspect → Console)
3. Look for this message:
   ```
   🔍 AssignmentDetail Component Loaded - Version: IST-FIX-v3
   ```
4. If you DON'T see this message, the new code hasn't loaded yet

### Step 2: Test IST Formatting Function
1. On the Assignment Details page, you'll see a yellow debug box at the top
2. Click the "Test IST Formatting" button
3. You should see an alert with:
   ```
   Test Date: 2025-02-18T17:45:00.000Z
   Formatted: 18 Feb 2025, 11:15 pm
   ```
4. Check the console for the test output

### Step 3: Check API Response
1. In the console, look for:
   ```
   📅 Raw assignment data: {...}
   📅 Due date from API: 2025-02-18T17:45:00.000Z
   ```
2. This shows what date format the backend is sending

### Step 4: Check formatToIST Calls
1. Look for console logs like:
   ```
   formatToIST: 2025-02-18T17:45:00.000Z → 18 Feb 2025, 11:15 pm
   ```
2. These show the actual conversion happening

## Possible Issues & Solutions

### Issue 1: Old Code Still Cached
**Symptoms**: Don't see version message or debug button

**Solutions**:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache completely
3. Try incognito/private browsing mode
4. Try a different browser

### Issue 2: Vercel Deployment Not Complete
**Symptoms**: See old version message or no version message

**Solutions**:
1. Check Vercel dashboard for deployment status
2. Look for the latest deployment timestamp
3. Verify the deployment succeeded (green checkmark)
4. Check deployment logs for any errors

### Issue 3: formatToIST Not Being Called
**Symptoms**: No formatToIST console logs appear

**Solutions**:
1. The function might not be called for some reason
2. Check if assignment.dueDate is null/undefined
3. Verify the component is rendering the date field

### Issue 4: Browser Timezone Issues
**Symptoms**: formatToIST works in test but not in actual display

**Solutions**:
1. Check browser timezone settings
2. Verify Intl.DateTimeFormat is supported
3. Test in different browsers

## What to Report Back

Please share:
1. ✅ Do you see the version message? (IST-FIX-v3)
2. ✅ Do you see the yellow debug box?
3. ✅ What does the "Test IST Formatting" button show?
4. ✅ What console logs do you see? (copy all logs starting with 🔍, 📅, or formatToIST:)
5. ✅ What does the actual due date display on the page?
6. ✅ Screenshot of the page and console would be helpful

## Expected Behavior

When working correctly, you should see:
- Console: `formatToIST: 2025-02-18T17:45:00.000Z → 18 Feb 2025, 11:15 pm`
- Page displays: `Due: 18 Feb 2025, 11:15 pm`

## Next Steps Based on Findings

### If version message appears:
- Code is loaded, issue is with the formatting logic itself
- Need to investigate why formatToIST isn't working

### If version message doesn't appear:
- Code hasn't been deployed or cached
- Need to force clear cache or redeploy

### If test button works but dates still show UTC:
- formatToIST function works, but isn't being called
- Need to check where dates are displayed

---

**Created**: Feb 16, 2026
**Purpose**: Debug IST date display issue
