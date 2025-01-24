Detailed Implementation Phases
Phase 1: Project Setup and File System
1.1 Project Initialization
pseudocodeCopyCREATE new SvelteKit 5 project
CONFIGURE project structure:
  /src
    /lib
      /components
      /stores
      /utils
    /routes
1.2 File System Interface
pseudocodeCopyCREATE FileSystemManager:
  FUNCTION scanDirectory(path):
    READ all files in directory
    FILTER for image files
    RETURN directory structure

  FUNCTION createBookStructure:
    FOR each folder:
      CREATE book object
      ADD pages array
      STORE metadata
1.3 Data Structure
jsonCopy{
  "books": [
    {
      "id": "unique_id",
      "name": "folder_name",
      "pages": [
        {
          "id": "page_id",
          "path": "file_path",
          "batesNumber": "EXH001",
          "annotations": []
        }
      ]
    }
  ]
}
1.4 Basic Navigation
pseudocodeCopyCREATE stores/books.js:
  EXPORT bookStore
  IMPLEMENT functions:
    loadBooks()
    getCurrentBook()
    getPage()

CREATE components/BookList.svelte:
  DISPLAY folder structure
  HANDLE book selection
Phase 2: Image Management
2.1 Image Loading System
pseudocodeCopyCREATE ImageLoader:
  IMPLEMENT lazy loading
  CACHE recently viewed images
  HANDLE error states

CREATE components/ImageViewer.svelte:
  ACCEPT image path
  IMPLEMENT zoom/pan
  HANDLE loading states
2.2 Image Navigation
pseudocodeCopyCREATE NavigationManager:
  TRACK current position
  IMPLEMENT:
    nextImage()
    previousImage()
    jumpToImage(batesNumber)
Phase 3: Bates System
3.1 Numbering Logic
pseudocodeCopyCREATE BatesManager:
  IMPLEMENT:
    generateBatesNumber()
    createBatesIndex()
    searchByBates()

STORE structure:
{
  "batesIndex": {
    "EXH001": "path/to/image1",
    "EXH002": "path/to/image2"
  }
}
Phase 4: Annotation System
4.1 Canvas Management
pseudocodeCopyCREATE AnnotationLayer:
  IMPLEMENT:
    createCanvas()
    handleDrawing()
    saveAnnotations()

STORE structure:
{
  "annotations": [
    {
      "id": "anno_id",
      "type": "drawing|shape|text",
      "points": [],
      "style": {}
    }
  ]
}
4.2 History System
pseudocodeCopyCREATE HistoryManager:
  IMPLEMENT:
    pushState()
    undo()
    redo()
    saveHistory()
    loadHistory()

STORE structure:
{
  "history": [
    {
      "timestamp": "ISO_DATE",
      "action": "action_type",
      "data": {}
    }
  ]
}

Phase 5: Integration and Optimization
5.1 Component Integration
pseudocodeCopy
CREATE MainViewer.svelte:
  INTEGRATE:
    ImageViewer
    AnnotationLayer
    NavigationControls
  IMPLEMENT:
    State synchronization
    Event handling
    Error boundaries

5.2 UI Controls
pseudocodeCopy
CREATE ToolbarComponent.svelte:
  IMPLEMENT:
    Annotation tool selection
    Color picker
    Line width control
    Opacity settings
    Tool presets

CREATE AnnotationControls.svelte:
  IMPLEMENT:
    Layer management
    Visibility toggles
    Delete/Edit controls

5.3 Export/Import System
pseudocodeCopy
CREATE ExportManager:
  IMPLEMENT:
    exportAnnotations(format)
    exportWithBates()
    generatePDF()
    
CREATE ImportManager:
  IMPLEMENT:
    importAnnotations(data)
    validateImport()
    mergeAnnotations()

5.4 Performance Optimization
pseudocodeCopy
IMPLEMENT:
  Canvas rendering optimization
  Lazy loading improvements
  Memory management
  State updates batching
  Event debouncing

5.5 Testing and Documentation
pseudocodeCopy
CREATE Integration Tests:
  TEST component interactions
  TEST state synchronization
  TEST export/import cycle
  TEST performance metrics

UPDATE Documentation:
  API documentation
  Usage examples
  Performance guidelines
  Troubleshooting guide

Testing Strategy
Each Component Test
pseudocodeCopyFOR each component:
  TEST initialization
  TEST user interactions
  TEST state management
  TEST error handling
Integration Tests
pseudocodeCopyTEST file loading → display
TEST annotation → save → load
TEST bates search → display
TEST history → undo/redo
Performance Tests
pseudocodeCopyMEASURE:
  Image load times
  Annotation responsiveness
  State management overhead
  Memory usage patterns
