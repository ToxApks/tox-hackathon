# PDF Feature - Quick Reference Guide

## 🚀 Quick Start

### Enable the Feature
The feature is already integrated! Just:
1. Ensure backend is running: `npm run dev`
2. Navigate to Resources tab
3. Upload a PDF

### Import & Use

```typescript
// In your components
import { PdfUpload } from '../components/PdfUpload';
import { DocumentViewer } from '../pages/DocumentViewer';
import { PDFViewerPage } from '../pages/PDFViewerPage';

// In your services
import { extractPdfText, generateTopicsFromText, validatePdfFile } from '../services/documentService';
import { uploadPdfToStorage } from '../services/storageService';
import { getResourcesFromStorage, addResourceToStorage } from '../services/storageLocal';
import { formatFileSize, getResourceStats } from '../utils/pdfUtils';
```

## 📦 Component Usage

### PdfUpload Component

```jsx
<PdfUpload
  onUploadSuccess={(resource) => {
    console.log('Uploaded:', resource);
    setResources([...resources, resource]);
  }}
  onError={(error) => {
    console.error('Error:', error);
    showErrorNotification(error);
  }}
  userId={user?.uid}
  useCloudStorage={false}  // true for Firebase Storage
/>
```

### DocumentViewer Component

```jsx
<DocumentViewer
  pdfUrl="blob:http://..." // or "https://..."
  title="Document Title"
/>
```

### PDFViewerPage Component

```jsx
// Automatically handles routing within /viewer/:resourceId
// No props needed - uses useParams() and userId
<PDFViewerPage userId={user?.uid} />
```

## 🔗 Navigation

```typescript
// Navigate to PDF viewer
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate(`/viewer/${resource.id}`, { state: { resource } });

// Go back from PDF viewer
navigate('/resources');
```

## 💾 LocalStorage Operations

```typescript
import {
  getResourcesFromStorage,
  addResourceToStorage,
  deleteResourceFromStorage,
  updateResourceInStorage,
  getResourceById,
  clearUserResources,
} from '../services/storageLocal';

// Get all resources
const resources = getResourcesFromStorage(userId);

// Add new resource
addResourceToStorage(userId, newResource);

// Delete resource
deleteResourceFromStorage(userId, resourceId);

// Get single resource
const resource = getResourceById(userId, resourceId);

// Clear all (on logout)
clearUserResources(userId);
```

## 📤 Document Service

```typescript
import {
  extractPdfText,
  generateTopicsFromText,
  createPdfBlobUrl,
  validatePdfFile,
  createResource,
  getFileMetadata,
} from '../services/documentService';

// Extract text from PDF file
const text = await extractPdfText(pdfFile);

// Generate topics from text
const topics = await generateTopicsFromText(text);

// Create blob URL
const url = createPdfBlobUrl(file);

// Validate file before upload
const { valid, error } = validatePdfFile(file);
if (!valid) console.error(error);

// Get file metadata
const meta = getFileMetadata(file);

// Create complete resource
const resource = createResource(file, topics, pdfUrl);
```

## ☁️ Firebase Storage

```typescript
import {
  uploadPdfToStorage,
  uploadPdfWithProgress,
  deletePdfFromStorage,
} from '../services/storageService';

// Simple upload
const downloadUrl = await uploadPdfToStorage(userId, pdfFile);

// Upload with progress
const url = await uploadPdfWithProgress(userId, file, (progress) => {
  console.log(`Progress: ${progress}%`);
});

// Delete from storage
await deletePdfFromStorage(pdfUrl);
```

## 🛠️ Utility Functions

```typescript
import {
  formatFileSize,
  formatDate,
  getRelativeTime,
  getTotalTopics,
  getCompletedTopics,
  getAverageScore,
  getResourceStats,
  searchResources,
  sortByDate,
  sortByTitle,
} from '../utils/pdfUtils';

// Format file size
const sizeDisplay = formatFileSize(2097152); // "2 MB"

// Format dates
const date = formatDate(resource.uploadDate);
const relative = getRelativeTime(resource.uploadDate); // "2 days ago"

// Get statistics
const stats = {
  total: getTotalTopics(resources),
  completed: getCompletedTopics(resources),
  average: getAverageScore(resources),
};

// Get resource stats
const resourceStats = getResourceStats(resource);
// Returns: { totalTopics, completedTopics, completionPercentage, averageScore, isComplete }

// Search resources
const results = searchResources(resources, 'algorithms');

// Sort resources
const byDate = sortByDate(resources, 'desc');
const byTitle = sortByTitle(resources, 'asc');
```

## 🎨 UI Status States

### Upload Progress States
```typescript
// Progress object: { stage, percent }
// Stages: 'selecting' | 'extracting' | 'processing' | 'uploading'
// Percent: 0-100
```

### Error Messages
```typescript
// Validation errors
"Please upload a valid PDF file"
"File is empty"
"File size exceeds 50MB limit"

// Processing errors
"Failed to extract text from PDF"
"Failed to generate topics"
"Failed to load PDF"
```

## 🔄 Data Flow Patterns

### Upload Complete Flow
```typescript
// 1. User selects file
// 2. Validate file
// 3. Extract text
// 4. Generate topics
// 5. Upload/Create blob URL
// 6. Create resource object
// 7. Save to localStorage
// 8. Update UI state
// 9. Show success message
```

### View PDF Flow
```typescript
// 1. User clicks View button
// 2. Navigate to /viewer/:resourceId
// 3. PDFViewerPage loads resource
// 4. DocumentViewer renders PDF
// 5. User controls navigation/zoom
// 6. User can download or go back
```

## 🧪 Testing Snippets

```javascript
// Test localStorage
const testResources = JSON.parse(
  localStorage.getItem('edumentor_resources_USER_ID')
);
console.log(testResources);

// Test PDF extraction
const file = new File(
  ['...binary data...'],
  'test.pdf',
  { type: 'application/pdf' }
);
const text = await extractPdfText(file);
console.log(text.length, 'characters extracted');

// Test file validation
const { valid, error } = validatePdfFile(largeFile);
console.log(valid ? 'Valid!' : `Invalid: ${error}`);
```

## ⚡ Performance Tips

1. **Lazy Load Topics**: Don't load all topics immediately
2. **Debounce Search**: Use debounce on search input
3. **Blob URL Cleanup**: Always revoke blob URLs when done
4. **Pagination**: Show 10-20 resources per page
5. **Caching**: Cache generated topics in localStorage

## 🔍 Debugging

```typescript
// Enable detailed logging
const logger = (stage, message, data) => {
  console.log(`[PDF] ${stage}:`, message, data);
};

// Check storage usage
console.log('Storage:', {
  resources: JSON.stringify(getResourcesFromStorage(userId)).length,
  quota: navigator.storage?.estimate?.(),
});

// Monitor API calls
window.fetch = (url, options) => {
  console.log('API Call:', url, options);
  return originalFetch(url, options);
};
```

## 📋 Checklist for Integration

- [ ] Backend `/api/extract-topics` endpoint working
- [ ] Gemini API key configured
- [ ] Firebase configured (if using cloud storage)
- [ ] pdfjs worker URL accessible
- [ ] Components imported correctly
- [ ] Routes added to main Router
- [ ] Error boundaries in place
- [ ] User ID passed to components
- [ ] localStorage enabled in browser
- [ ] Tailwind CSS working for styling

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| PDF won't render | Check pdfjs worker URL, ensure PDF URL is valid |
| Topics not generating | Verify backend is running, check API response |
| Storage full | Clear localStorage, use cloud storage |
| Navigation not working | Verify routes in App.tsx |
| Blob URLs not working | Check browser supports blob URLs, revoke old URLs |
| File too large | Use cloud storage, compress PDF |
| CORS errors | Ensure PDF is from same origin or has CORS headers |

## 📞 Getting Help

1. Check console for error messages
2. Review error boundaries logs
3. Verify API responses in Network tab
4. Check browser DevTools Storage tab
5. Review PDF_FEATURE_GUIDE.md for detailed info
