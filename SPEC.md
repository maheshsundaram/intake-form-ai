# Auto Shop Intake Form MVP Specification

## Overview
This MVP is a web-based intake form system for an auto shop, allowing receptionists to create, populate, and save intake forms based on customer-provided handwritten forms. The workflow includes a mobile web app for capturing a form image and a desktop web app for managing and editing the form.

## Tech Stack
- **Frontend:** Next.js (React) + TailwindCSS + ShadCN UI
- **Backend:** Next.js API Routes (in-memory storage for MVP)
- **Mobile Web APIs:** Camera API for image capture
- **Persistence:** In-memory storage (lost on refresh)
- **Sync Mechanism:** Polling every 2 seconds

## Desktop App Features
### Navigation & Layout
- **Left Sidebar:** Displays a list of previously saved forms (sorted by creation date, most recent first)
- **Main View:** 
  - `/forms/` → Form history
  - `/forms/new` → New form page
  - `/forms/:id` → Previously saved forms (editable)

### Form Behavior
- The form layout should **strictly adhere to the provided mockup** both **visually and functionally**. The mockup defines the exact structure, field placement, and user flow. However, underlying changes such as using React instead of vanilla JavaScript are acceptable.
- Fields match the paper form’s exact layout
- Editable text inputs (no validation or required fields for MVP)
- Copy button next to each field (copies plain text only)
- Save button **enabled only when there are unsaved changes**
- Update button for previously saved forms (enabled only when changes are made)
- Discard button **instantly clears the form** and returns to history (no confirmation prompt)
- Delete button **instantly removes saved forms** (no undo option)
- Service request fields are **dynamically addable/removable**, with new entries appearing at the bottom
- Signature is a **mock image** for the MVP (future enhancement: digital signature input)
- **Form should include an option to open the captured image in a modal for viewing.**

### QR Code & Mobile Sync
- Clicking **"New Form"** opens a **modal with a QR code** (`/snap`)
- QR code stays visible until manually closed
- Desktop app **shows "Waiting for photo..."** until data is received
- Polls every **2 seconds** for new mobile submissions
- When data arrives:
  - **Auto-fills form fields**
  - **Shows toast notification: "Form data received"**
  - **Includes the captured image along with form values**
  - **Allows opening the image in a modal within the form view**
  - Form is considered **unsaved** until manually saved

## Mobile App Features
### `/snap` (Camera View)
- **Opens camera immediately** upon page load
- **Floating capture button overlay** for better UI
- **Simple overlay guide** to assist with framing the paper form
- When a photo is taken:
  - Redirects to `/snap/preview`
  - Shows **photo preview** with "Retake" and "Submit" buttons
- "Retake" **immediately returns to the camera** (no confirmation prompt)
- "Submit" **sends the captured image and a fixed mock dataset** to the desktop app (no actual OCR processing for MVP)
- Redirects to `/snap/success` after submission

### `/snap/success`
- Displays **"Form submitted!"** message
- Button: **"Take Another Photo"** (redirects to `/snap`)
- Browser navigation works normally (back button allowed)

## Data Flow & Storage
- **Form data and the captured image are stored in-memory** (cleared on refresh)
- **Polling mechanism** syncs mobile submissions with desktop form (switching to WebSockets is a future enhancement)
- **No authentication or backend database** for MVP (future enhancement)

## Future Enhancements
1. **Switch from polling to WebSockets** for real-time updates
2. **Make QR code dynamic** to support multiple active forms
3. **Add framing guide overlay on mobile camera preview**
4. **Support multiple drafts instead of overwriting unsent forms**
5. **Show a confirmation prompt before discarding a new form**
6. **Allow customizing the "Copy All" format (plain text vs structured)**
7. **Introduce a status badge (e.g., "Completed" or "Draft") in form history**
8. **Make form history searchable or filterable**
9. **Auto-save edits to previously saved forms instead of requiring an "Update" button**
10. **Improve mobile submission flow with a brief loading indicator** before redirecting
11. **Implement backend storage for saved forms** (instead of in-memory)
12. **Add authentication** to secure form access
13. **Allow retaking a photo after submission (with overwrite confirmation)**
14. **Enforce proper field validation (phone numbers, emails, ZIP codes, etc.)**
15. **Use a dropdown for State selection instead of free text**
16. **Enforce structured validation for mileage and vehicle year inputs**
