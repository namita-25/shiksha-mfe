# Implement OBLF Teacher Dashboard & Attendance Selection Flow

This plan addresses the missing/partially available functionalities for the OBLF Teacher flow, specifically focusing on the Dashboard and Class Selection experience.

Currently, OBLF teachers are forced directly into the Attendance screen where they must manually select their school and class from dropdowns. The new flow will allow them to land on a dashboard listing their assigned classes, where they can simply tap a class to immediately open the attendance roster for it.

## User Review Required

> [!WARNING]
> **Behavioral Change for OBLF Teachers**: This change will stop OBLF teachers from being immediately redirected to the `/attandence` tab upon login. Instead, they will land on the Dashboard (specifically the "My Classes" view) where they will see their assigned schools and classes. 

## Open Questions

> [!IMPORTANT]
> 1. **My Classes UI update**: In `/my-classes`, clicking a class currently loads the list of students on the right side of the screen. Should tapping a class *immediately* navigate to the Attendance page, OR should we keep the student list on the right and add a specific "Mark Attendance" button there? (The plan assumes immediate navigation on tap, per requirement 4.3).
> 2. **Default Tab**: For OBLF Teachers, should the Dashboard *only* show the "My Classes" and "Attendance" tabs? (Currently, content, course, and groups are hidden for them).

## Proposed Changes

### Dashboard Updates
Removing the forced redirect so OBLF teachers can see their class list.

#### [MODIFY] [dashboard/page.tsx](file:///home/ttpl-rt-151/Documents/Documents/Shikshav/Shiksha-mfe/new%20learner%20app/shiksha-mfe/apps/learner-web-app/src/app/dashboard/page.tsx)
- Remove `isOblfTenant` from the immediate redirect block in `useEffect` (around line 157) so it doesn't push them to `/attandence`.
- Update `updateTabFromURL` to allow OBLF teachers to remain on the dashboard.
- Update `handleTabChange` to remove the forced redirect for `isOblfTenant`.
- Adjust the default tab logic so that if the user is an OBLF teacher, the default `activeTab` is set to `myClasses`.

### Class Selection Navigation
Turning the class list into navigation triggers.

#### [MODIFY] [my-classes/page.tsx](file:///home/ttpl-rt-151/Documents/Documents/Shikshav/Shiksha-mfe/new%20learner%20app/shiksha-mfe/apps/learner-web-app/src/app/my-classes/page.tsx)
- Update the `handleBatchClickForCenter` function (or the onClick handler for the batch cards). Instead of just setting local state to load members, it will navigate the user to the attendance page using `router.push('/attandence?centerId=' + center.centerId + '&classId=' + batch.cohortId)`.

### Auto-loading Attendance
Skipping the manual dropdowns when navigating from the dashboard.

#### [MODIFY] [attandence/page.tsx](file:///home/ttpl-rt-151/Documents/Documents/Shikshav/Shiksha-mfe/new%20learner%20app/shiksha-mfe/apps/learner-web-app/src/app/attandence/page.tsx)
- Add logic using `useSearchParams()` to check for `centerId` and `classId` in the URL upon component mount.
- If these query parameters exist:
  - Automatically set the `selectedCenterId` and `classId` states.
  - Automatically trigger the `handleRemoteSession()` function to fetch the roster for that specific class and open the Present/Absent modal immediately.
  - Optionally, clean up the URL after loading so a refresh doesn't auto-trigger again if not desired.

## Verification Plan

### Manual Verification
1. Log in as a teacher belonging to the OBLF tenant.
2. Verify that I land on the "My Classes" dashboard tab, displaying my assigned School and Classes.
3. Tap on one of the classes in the list.
4. Verify that I am immediately routed to the Attendance screen, and the Present/Absent roster modal opens automatically for that specific class, without needing to select anything from the dropdowns.
