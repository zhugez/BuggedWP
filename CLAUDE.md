# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

I'm a product manager with limited coding experience who's looking to learn to become more technical. When you're coding and doing your work, please share tips that explain the tech architecture and any changes that you're making and why.

## Project Overview

**WordPress Plugin Security Scanner** - A full-stack web application that analyzes WordPress plugins for AJAX security vulnerabilities, specifically checking for missing permission and nonce verification.

## Architecture

### Full-Stack Design Pattern
This project follows a **microservices-like architecture** with clear separation between frontend and backend:

- **Frontend**: Next.js 15 + TypeScript (user interface and file upload)
- **Backend**: Python FastAPI (code analysis and security recommendations)
- **Integration Layer**: MCP (Model Context Protocol) tools for enhanced code indexing

### Key Architectural Components

1. **Upload & Processing Pipeline**:
   - Frontend handles file uploads → Backend processes ZIP extraction → Code parsing via AST → Security analysis
2. **AI-Powered Analysis**:
   - Structured prompt system (see `prompt.md`) generates exactly 5 security recommendations per scan
3. **Security-Focused Data Flow**:
   - Detects WordPress AJAX hooks → Analyzes callback functions → Identifies missing security checks

## Development Commands

### Frontend (Next.js 15)
```bash
# Initial setup
npx create-next-app@latest bugged-wp --typescript --tailwind --app
cd bugged-wp

# Development
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint checking
npm run typecheck    # TypeScript type checking
```

### Backend (Python FastAPI)
```bash
# Setup virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-multipart

# Development
uvicorn main:app --reload  # Start development server (http://localhost:8000)
pytest                    # Run tests
python -m pytest -v      # Verbose test output
```

### State Management
- **Frontend**: Zustand for lightweight state management
- **Backend**: Stateless API design with structured JSON responses

## File Structure and Key Files

### Planning Documents (Current Phase)
- **`spec.md`**: Complete project specification with tech stack, milestones, and UI design
- **`todo.md`**: Detailed task breakdown for Milestone 1 (UI Setup)
- **`prompt.md`**: Structured prompt system for security analysis API

### Expected Project Structure (Post-Implementation)
```
frontend/
├── src/app/                 # Next.js App Router
├── src/components/
│   ├── ui/                 # shadcn/ui components
│   ├── upload/            # File upload components
│   ├── dashboard/         # Main dashboard layout
│   └── results/           # Results table and code viewer
├── src/lib/               # Utilities and configurations
└── src/types/             # TypeScript type definitions

backend/
├── app/
│   ├── routers/           # API endpoints
│   ├── models/            # Pydantic models
│   ├── services/          # Business logic
│   └── utils/             # Helper functions
├── tests/                 # Unit and integration tests
└── requirements.txt       # Python dependencies
```

## Development Milestones

### Milestone 1: UI Setup (1-2 weeks)
**Focus**: Build frontend with mock data
- Next.js project with TypeScript + Tailwind + shadcn/ui
- Dashboard with file upload, results table, and filtering
- Responsive design with developer-friendly UX

### Milestone 2: Backend Integration (2-3 weeks)
**Focus**: Connect to real API with security analysis
- FastAPI backend with PHP code parsing
- Implementation of structured prompt system from `prompt.md`
- MCP integration for enhanced code indexing
- 5 security recommendations per scan

### Milestone 3: Polish & Features (1-2 weeks, Optional)
**Focus**: Advanced features and deployment
- Code snippet viewer with syntax highlighting
- Export functionality and scan history
- Docker deployment configuration

## WordPress Security Patterns

### AJAX Hook Detection Targets
```php
// Primary patterns to detect:
add_action('wp_ajax_action_name', 'callback_function');
add_action('wp_ajax_nopriv_action_name', 'callback_function');

// Security checks to verify:
current_user_can('capability')           // Permission checking
wp_verify_nonce($nonce, 'action')       // Nonce verification
check_ajax_referer('action')            // AJAX-specific nonce check
check_admin_referer('action')           // Admin-specific nonce check
```

### Vulnerability Severity Levels
- **Critical**: Missing authorization allowing privilege escalation
- **High**: Missing nonce verification enabling CSRF attacks
- **Medium**: Input validation issues leading to XSS/injection
- **Low**: General security improvements and best practices

## Technical Implementation Notes

### Security Analysis Pipeline (Milestone 2)
1. **Code Parsing**: Use PHP AST parsing to accurately detect function calls
2. **Pattern Matching**: Identify AJAX hooks and trace to callback functions
3. **Security Assessment**: Check for presence of security functions within callbacks
4. **AI Analysis**: Send structured data to LLM via prompt system for recommendations
5. **Results Processing**: Return exactly 5 prioritized security recommendations

### Key Integration Points
- **MCP Tools**: Serena integration for enhanced code indexing capabilities
- **Structured Prompts**: Template system in `prompt.md` ensures consistent analysis
- **Type Safety**: Full TypeScript coverage for frontend, Pydantic models for backend

## Testing Strategy

### Frontend Testing
- Component unit tests with Jest/React Testing Library
- Upload functionality and state management testing
- Responsive design validation

### Backend Testing
- API endpoint testing with pytest
- PHP code parsing accuracy tests
- Security pattern detection validation

## Performance Considerations

- **Frontend**: Lazy loading for code snippets, pagination for large result sets
- **Backend**: Stream processing for large ZIP files, efficient AST parsing
- **Scalability**: Stateless API design, horizontal scaling capability

## Success Criteria

1. **Accuracy**: Minimal false positives/negatives in vulnerability detection
2. **Performance**: Process typical plugins (< 10MB) within 30 seconds
3. **Usability**: Intuitive interface requiring no training for developers
4. **Reliability**: Handle various plugin structures and coding patterns gracefully