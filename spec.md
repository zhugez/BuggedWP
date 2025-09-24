# WordPress Plugin Security Scanner - Project Specification

## Requirements

### Core Functionality
- **Upload Interface**: Accept ZIP files or folder uploads containing WordPress plugin source code
- **AJAX Hook Detection**: Scan for `wp_ajax_*` and `wp_ajax_nopriv_*` action hooks
- **Security Analysis**: Identify callback functions and check for:
  - Missing permission checks (`current_user_can()`)
  - Missing nonce verification (`wp_verify_nonce()`, `check_admin_referer()`, `check_ajax_referer()`)
- **Vulnerability Reporting**: Display findings with file locations, line numbers, and security status

### Security Patterns to Detect
- `add_action('wp_ajax_*', 'callback_function')`
- `add_action('wp_ajax_nopriv_*', 'callback_function')`
- Absence of `current_user_can()` in callback functions
- Absence of nonce verification functions in callback functions

### Target Users
- Developer teams
- Code reviewers
- Security auditors
- WordPress plugin developers

## Tech Stack

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Upload**: File drag-and-drop with progress indicators
- **State Management**: Zustand (if needed) 

### Backend
- **Framework**: Python FastAPI
- **Code Analysis**: AST parsing using `ast` module or `php-ast` extension
- **File Processing**: ZIP extraction with `zipfile` module
- **API**: RESTful endpoints with JSON responses
- **Documentation**: Auto-generated with FastAPI/OpenAPI

### Additional Tools
- **Code Indexing**: MCP integration (Serena) for enhanced code analysis
- **Deployment**: Docker containers for both frontend and backend
- **Development**: Hot reload for both frontend and backend

## Design Guidelines

### UI Framework Choice: Next.js + TypeScript + Tailwind + shadcn/ui
**Rationale**: Modern, type-safe, component-based architecture with excellent developer experience

### Visual Design Principles
- **Clean & Minimal**: Focus on functionality over decoration
- **Developer-Friendly**: Familiar patterns and intuitive navigation
- **Responsive**: Works well on desktop and tablet devices
- **Accessible**: WCAG 2.1 AA compliance for screen readers and keyboard navigation

### Color Scheme
- **Success**: Green (#10B981) for secure handlers
- **Warning**: Amber (#F59E0B) for potentially insecure handlers
- **Error**: Red (#EF4444) for confirmed vulnerabilities
- **Neutral**: Gray scale for UI elements

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header: App Title + Upload Button                       │
├───────────┬─────────────────────────────────────────────┤
│ Sidebar   │ Main Content Area                           │
│           │                                             │
│ - Upload  │ ┌─────────────────────────────────────────┐ │
│ - Filters │ │ Results Table                           │ │
│ - Stats   │ │ - Hook Name                             │ │
│           │ │ - File:Line                             │ │
│           │ │ - Callback Function                     │ │
│           │ │ - Security Status                       │ │
│           │ └─────────────────────────────────────────┘ │
│           │                                             │
│           │ ┌─────────────────────────────────────────┐ │
│           │ │ Code Snippet Panel (Collapsible)       │ │
│           │ │ - Syntax highlighted code               │ │
│           │ │ - Missing security checks highlighted   │ │
│           │ └─────────────────────────────────────────┘ │
└───────────┴─────────────────────────────────────────────┘
```

## Milestones

### Milestone 1: UI Setup
**Goal**: Build the initial dashboard interface with dummy data

**Deliverables**:
- Next.js project setup with TypeScript and Tailwind
- Dashboard layout with sidebar and main content area
- File upload component with drag-and-drop functionality
- Results table with mock data showing:
  - AJAX hook names
  - File paths and line numbers
  - Callback function names
  - Security status indicators (✅/⚠️)
- Basic filtering options (show all / show only insecure)
- Responsive design implementation

**Duration**: 1-2 weeks

### Milestone 2: Backend Integration
**Goal**: Connect the frontend to the backend API using MCP tools for code analysis

**Deliverables**:
- FastAPI backend setup with file upload endpoints
- PHP code parsing using AST or token analysis
- AJAX hook detection algorithm
- Security pattern analysis (permission checks, nonce verification)
- MCP integration (Serena) for enhanced code indexing
- **Security Analysis API**: Implementation of structured prompt system (see `prompt.md`) that:
  - Processes indexed plugin code through analysis pipeline
  - Generates exactly 5 security recommendations per scan
  - Returns structured JSON with severity levels, file references, and code examples
  - Supports user preferences for analysis focus and threshold settings
- API endpoints for:
  - File upload and processing (`/upload`)
  - Vulnerability scan results (`/scan/{upload_id}`)
  - Security analysis with recommendations (`/analyze-security`)
  - Code snippet retrieval (`/snippet/{file_path}`)
- Frontend integration with real backend data
- Error handling and loading states

**Security Analysis Integration**:
- Backend processes uploaded plugin code and extracts AJAX hook information
- Calls security analysis endpoint with structured data (plugin name, file paths, detected hooks, security checks)
- Returns 5 prioritized recommendations with actionable fixes
- Frontend displays recommendations in dashboard with expandable details

**Duration**: 2-3 weeks

### Milestone 3: Further Refinements and Features (Optional)
**Goal**: Polish the application and add advanced features

**Deliverables**:
- Code snippet viewer with syntax highlighting
- Collapsible panels for detailed vulnerability information
- Export functionality (JSON, PDF reports)
- Scan history and result caching
- Advanced filtering and sorting options
- Performance optimizations for large plugins
- Docker deployment configuration
- Documentation and user guides

**Duration**: 1-2 weeks

## Web Dashboard Features

### Core Components

#### Sidebar
- **Upload Section**:
  - Drag-and-drop zone for ZIP files
  - Folder selection option
  - Upload progress indicator
  - Recent scans list

#### Main Content Area
- **Results Table**:
  - Sortable columns
  - Pagination for large result sets
  - Status icons (✅ secure, ⚠️ warning, ❌ vulnerable)
  - Quick action buttons

#### Interactive Elements
- **Filter Controls**:
  - Show all handlers / Show only insecure
  - Filter by file type or directory
  - Search by function name
- **Code Viewer**:
  - Collapsible code snippet panels
  - Syntax highlighting for PHP code
  - Highlighted missing security checks
  - Line number references

### User Experience
- **Intuitive Workflow**: Upload → Scan → Review → Export
- **Real-time Feedback**: Progress indicators and status updates
- **Contextual Help**: Tooltips explaining security issues
- **Keyboard Navigation**: Full keyboard accessibility

## Technical Considerations

### Performance
- Stream processing for large ZIP files
- Lazy loading for code snippets
- Pagination for large result sets
- Caching for repeated scans

### Security
- File type validation
- Size limits for uploads
- Sanitized file extraction
- No code execution, only static analysis

### Scalability
- Stateless API design
- Horizontal scaling capability
- Efficient memory usage for large codebases
- Queue system for background processing (future enhancement)

## Success Criteria

1. **Functionality**: Successfully detects WordPress AJAX security vulnerabilities
2. **Usability**: Intuitive interface that developers can use without training
3. **Accuracy**: Minimal false positives/negatives in vulnerability detection
4. **Performance**: Processes typical WordPress plugins (< 10MB) within 30 seconds
5. **Reliability**: Handles various plugin structures and coding patterns gracefully