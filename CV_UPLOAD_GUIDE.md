# CV Upload and Management System

## Overview

Your portfolio now supports dynamic CV upload and management through Cloudinary. You can upload your CV in the AdminSettings and it will automatically be available for download in the Hero section.

## Features Added

### 1. Database Schema Update

- Added `cvUrl` field to the User model to store CV file URL from Cloudinary
- Applied database migration to add the new field

### 2. Backend API Enhancement

- **New Endpoint**: `POST /api/users/profile/cv`
  - Accepts PDF files up to 20MB
  - Validates file type (PDF only)
  - Uploads to Cloudinary in `portfolio/documents` folder
  - Automatically deletes old CV when new one is uploaded
  - Returns updated user profile with new CV URL

- **Updated DTO**: Added `cvUrl` field to UpdateUserProfileDto with URL validation

### 3. Frontend Admin Interface

- Added CV upload section in AdminSettings Profile tab
- **Upload Button**: Click to select PDF file
- **Current CV Link**: View/download currently uploaded CV
- **File Validation**:
  - PDF files only
  - Maximum 20MB file size
  - Clear error messages for validation failures
- **Loading States**: Shows upload progress with disabled buttons

### 4. Dynamic Hero Section

- **Download CV Button**: Now uses dynamic CV URL from user profile
- **Fallback**: Falls back to `/cv.pdf` if no CV is uploaded
- **Public Access**: CV can be downloaded by visitors without authentication

### 5. User Profile Hook

- Created `useUserProfile` hook to fetch user data for public components
- Handles loading states and errors gracefully
- Used by HeroSection to get current CV URL

## How to Use

### 1. Upload CV via Admin Dashboard

1. Login to your admin dashboard at `http://localhost:3003/admin`
2. Navigate to **Settings** → **Profile**
3. Scroll to the **CV Document** section
4. Click **Upload CV** button
5. Select your PDF CV file (max 20MB)
6. Wait for upload confirmation
7. Use **View Current CV** link to verify upload

### 2. CV Download on Public Site

1. Visit your homepage at `http://localhost:3003`
2. Click the **Download CV** button in the hero section
3. Your uploaded CV will download automatically
4. If no CV is uploaded, it falls back to `/cv.pdf`

## Technical Implementation

### API Endpoints

```
POST /api/users/profile/cv
- Requires: JWT authentication
- Accepts: multipart/form-data with 'file' field
- Validates: PDF files only, max 20MB
- Returns: Updated user profile with cvUrl
```

### File Storage

- **Platform**: Cloudinary
- **Folder**: `portfolio/documents`
- **Format**: PDF only
- **Size Limit**: 20MB
- **Auto-cleanup**: Old CVs are deleted when new ones are uploaded

### Frontend Components

```typescript
// AdminSettings CV Upload
<input type="file" accept=".pdf" onChange={handleCVUpload} />

// HeroSection Dynamic Link
<a href={profile?.cvUrl || "/cv.pdf"}>Download CV</a>
```

### Database Schema

```prisma
model User {
  // ... other fields
  cvUrl     String?      // CV file URL from Cloudinary
}
```

## Security & Validation

### Backend Validation

- **File Type**: Only PDF files accepted
- **File Size**: Maximum 20MB limit
- **Authentication**: JWT required for upload
- **URL Validation**: cvUrl field validates as proper URL

### Frontend Validation

- **File Type Check**: Prevents non-PDF selection
- **Size Check**: Warns if file exceeds 20MB
- **Error Handling**: Clear error messages for all failure cases
- **Loading States**: Prevents multiple uploads during processing

## Error Handling

### Common Scenarios

1. **File too large**: "PDF size must be less than 20MB"
2. **Wrong file type**: "Please select a PDF file"
3. **Upload failure**: "Failed to upload CV"
4. **Network error**: Handled gracefully with retry options

### Fallback Behavior

- If CV upload fails, old CV remains active
- If no CV uploaded, Download button links to `/cv.pdf`
- Public pages continue to work even if CV service is down

## Benefits

1. **No Manual File Management**: Upload directly through admin interface
2. **Automatic Updates**: Hero section immediately reflects new CV
3. **Professional URLs**: Clean Cloudinary URLs for sharing
4. **Storage Optimization**: Old files automatically cleaned up
5. **Version Control**: Only latest CV is kept active
6. **Public Access**: Visitors can download CV without authentication

## Next Steps

Consider extending this system to:

- Support multiple document formats (DOCX, TXT)
- Add document versioning/history
- Create document preview functionality
- Add download analytics/tracking
- Support multiple CVs (different languages/versions)

The CV upload system provides a professional, scalable solution for managing your resume while maintaining the clean design and user experience of your portfolio.
