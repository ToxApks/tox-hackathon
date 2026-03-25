# PDF Management Feature - Implementation Guide

## Overview
This document provides comprehensive guidance for using the PDF management feature in the EduMentor AI application.

## Features

### 1. **PDF Upload with Automatic Topic Generation**
- Users can upload PDF documents from the Resources page
- PDFs are automatically processed to extract text
- Extracted text is sent to the Gemini API to generate learning topics
- Progress indicators show the upload and processing stages

### 2. **PDF Storage Options**
- **Local Storage (Default)**: Uses `URL.createObjectURL()` for temporary URLs
  - Faster upload
  - Good for small files
  - Data persists in browser localStorage
  
- **Cloud Storage**: Uses Firebase Storage for permanent storage
  - Set `useCloudStorage={true}` in PdfUpload component
  - Requires Firebase Storage rules to be configured
  - Better for production use

### 3. **Resource Management**
- Resources are stored in browser localStorage per user
- Each resource includes:
  - Title (from filename)
  - Upload date
  - File metadata (size, name)
  - Generated topics
  - PDF URL (blob or cloud storage)

### 4. **PDF Viewer with Advanced Controls**
- Responsive PDF viewing with canvas rendering
- Navigation controls:
  - Next/Previous page buttons
  - Direct page number input
  - Page counter (e.g., "5 / 20")
- Zoom controls:
  - Zoom In/Out buttons (0.5x to 3.0x)
  - Reset zoom button
  - Zoom percentage display
- Download functionality
- Error handling with user-friendly messages

### 5. **LocalStorage Persistence**
- Resources are automatically saved to localStorage
- Survives browser refresh
- Per-user storage (user ID is part of the key)
- Automatic cleanup on logout

## File Structure

```
src/
├── components/
│   ├── PdfUpload.tsx          - PDF upload component
│   └── ErrorBoundary.tsx      - Error boundary for error handling
├── pages/
│   ├── DocumentViewer.tsx     - PDF viewer component
│   ├── PDFViewerPage.tsx      - PDF viewer page with routing
│   └── Resources.tsx          - Resources page with upload integration
├── services/
│   ├── documentService.ts     - PDF processing service
│   ├── storageService.ts      - Firebase Storage service
│   └── storageLocal.ts        - LocalStorage management service
└── types.ts                   - Updated Resource type
```

## API Integration

### Extract Topics Endpoint
- **URL**: `/api/extract-topics`
- **Method**: POST
- **Body**:
  ```json
  {
    "text": "extracted PDF text content"
  }
  ```
- **Response**:
  ```json
  [
    {
      "title": "Topic Title",
      "content": "Detailed explanation",
      "keyPoints": ["point1", "point2", ...],
      "example": "Practical example"
    },
    ...
  ]
  ```

## Usage Guide

### For Users

1. **Upload a PDF**
   - Navigate to Resources page
   - Click "Click to upload PDF" in the Upload section
   - Select a PDF file (max 50MB)
   - Wait for processing (text extraction + topic generation)
   - Resource will appear in the list once complete

2. **View PDF**
   - Click "View" button on any resource card
   - Use page navigation to move through pages
   - Use zoom controls to adjust view size
   - Download PDF using download button

3. **Search & Organize**
   - Use search bar to find resources by title
   - Resources display:
     - Number of generated topics
     - Upload date
     - File size

### For Developers

#### Setting Up Firebase Storage

1. Update `firestore.rules` to allow PDF uploads:
```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

// Also create similar rules for Storage
service firebase.storage {
  match /b/{bucket}/o {
    match /pdfs/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

2. Update PdfUpload component:
```jsx
<PdfUpload
  onUploadSuccess={handleUploadSuccess}
  onError={handleUploadError}
  userId={user?.uid}
  useCloudStorage={true}  // Enable cloud storage
/>
```

#### Extending Topic Generation

For custom topic extraction, modify the backend `/api/extract-topics` endpoint with your own AI model or rules.

#### Custom Storage Strategy

To implement custom storage (AWS S3, Azure Blob, etc.):

1. Create a new service file (e.g., `services/s3Service.ts`)
2. Implement upload/download functions
3. Replace `storageService.ts` usage in `PdfUpload` component

#### Error Handling Best Practices

All components include error handling. Add ErrorBoundary to your routes:

```jsx
<ErrorBoundary>
  <Routes>
    {/* your routes */}
  </Routes>
</ErrorBoundary>
```

## Configuration Options

### PdfUpload Component Props
```typescript
interface PdfUploadProps {
  onUploadSuccess: (resource: Resource) => void;  // Required
  onError: (error: string) => void;               // Required
  userId?: string;                                // Optional (for cloud storage)
  useCloudStorage?: boolean;                      // Default: false
}
```

### DocumentViewer Component Props
```typescript
interface DocumentViewerProps {
  pdfUrl: string;      // Required: URL to PDF
  title: string;       // Required: Display title
}
```

## Limitations & Considerations

1. **File Size**: Default max 50MB (configurable in documentService.ts)
2. **Preview Speed**: Large PDFs may take time for text extraction
3. **Browser Storage**: LocalStorage has ~5-10MB limit per domain
4. **CORS**: Cloud PDF URLs must comply with CORS policies
5. **Worker File**: pdfjs-dist requires worker file from CDN

## Troubleshooting

### PDF fails to load
- Check if PDF is corrupted
- Verify pdfjs worker URL is accessible
- Check browser console for CORS errors

### Topics not generating
- Verify backend API is running (`npm run dev`)
- Check Gemini API key in environment
- Ensure text extraction succeeded

### Storage quota exceeded
- Clear localStorage data
- Migrate to cloud storage
- Implement data cleanup strategy

### Slow uploads
- Compress PDF before uploading
- Use cloud storage for large files
- Check network connection

## Future Enhancements

- [ ] Batch PDF upload support
- [ ] OCR for scanned documents
- [ ] PDF annotation tools
- [ ] Topic-based study sessions
- [ ] Progress tracking per topic
- [ ] Collaborative resource sharing
- [ ] Advanced search with filters
- [ ] Export resources as study guides

## Security Considerations

- Validate all file uploads server-side
- Sanitize PDF content before processing
- Use HTTPS for all API calls
- Implement rate limiting on upload endpoint
- Encrypt sensitive PDFs in storage
- Regular cleanup of orphaned blob URLs
