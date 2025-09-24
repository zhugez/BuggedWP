# BuggedWP - WordPress Plugin Security Scanner

A comprehensive security analysis tool for WordPress plugins that detects AJAX vulnerabilities and broken access control issues.

## 🎯 Project Overview

BuggedWP is a full-stack web application designed to analyze WordPress plugins for common security vulnerabilities, with a focus on AJAX handlers and access control issues. The tool provides an intuitive dashboard for uploading plugins and viewing detailed security analysis results.

## ✨ Features

### Current Features (Milestone 1 ✅)
- **Modern Dashboard**: Clean, responsive UI with gradient backgrounds and professional styling
- **Unified Upload System**: Drag-and-drop ZIP files or select plugin folders
- **Interactive Results Table**: Sortable table with security status indicators
- **Advanced Filtering**: Filter by hook type, severity level, and search functionality
- **Code Viewer**: Modal dialog with syntax-highlighted PHP code and security recommendations
- **Data Visualization**: Interactive charts showing vulnerability distribution
- **Export Functionality**: JSON copy and CSV export for security reports
- **Real-time State Management**: Zustand-powered reactive state management

### Planned Features (Milestone 2)
- **Advanced Backend**: FastAPI-based security analysis engine
- **Enhanced Detection**: 10+ vulnerability types including IDOR, privilege escalation, and CSRF
- **Real Plugin Analysis**: Actual PHP code parsing with AST analysis
- **Detailed Reports**: Attack vectors, business impact, and remediation guides
- **Performance Optimization**: Parallel processing and caching systems

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand for lightweight state management
- **Charts**: Recharts for data visualization

### Backend (Planned)
- **Framework**: Python FastAPI
- **Code Analysis**: PHP AST parsing
- **File Processing**: Secure ZIP extraction and analysis
- **Security Patterns**: Patchstack Academy-inspired vulnerability detection

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended package manager)
- Python 3.8+ (for backend development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zhugez/BuggedWP.git
   cd BuggedWP
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - The application will show sample WordPress plugin vulnerabilities

## 🔧 Development

### Frontend Development
```bash
cd frontend
pnpm dev             # Start development server
pnpm build           # Build for production
pnpm lint            # Run ESLint
pnpm typecheck       # TypeScript type checking
```

### Project Structure
```
BuggedWP/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # shadcn/ui base components
│   │   │   ├── upload/     # Upload-related components
│   │   │   ├── dashboard/  # Dashboard layout components
│   │   │   └── results/    # Results display components
│   │   ├── lib/            # Utilities and configurations
│   │   └── types/          # TypeScript type definitions
│   ├── package.json
│   └── tailwind.config.js
├── spec.md                  # Project specifications
├── todo.md                  # Development task tracking
├── prompt.md               # AI analysis prompt templates
├── CLAUDE.md               # Development guidance for AI assistants
└── README.md               # This file
```

## 🛡️ Security Analysis

### Current Detection Capabilities
- **AJAX Handlers**: Detects `wp_ajax` and `wp_ajax_nopriv` hooks
- **Permission Checks**: Identifies missing `current_user_can()` calls
- **Nonce Verification**: Checks for `wp_verify_nonce()`, `check_ajax_referer()` usage
- **Severity Classification**: Categorizes vulnerabilities as Secure, Warning, or Vulnerable

### Planned Enhancements (Milestone 2)
- **Broken Access Control**: IDOR, privilege escalation, unauthorized data access
- **CSRF Vulnerabilities**: Advanced nonce validation and referer checking
- **Input Validation**: SQL injection, XSS prevention analysis
- **File Operations**: Unsafe file upload/download detection
- **Database Security**: Unsafe query detection and sanitization analysis

## 📊 Security Patterns

Based on research from Patchstack Academy, the tool identifies common WordPress security anti-patterns:

### Vulnerable Patterns
```php
// Missing authorization
add_action('wp_ajax_save_data', 'handle_save');
function handle_save() {
    update_option('sensitive_data', $_POST['data']); // ❌ No capability check
}

// Missing nonce verification
add_action('wp_ajax_delete_post', 'handle_delete');
function handle_delete() {
    if (!current_user_can('delete_posts')) return;
    wp_delete_post($_POST['post_id']); // ❌ No nonce verification
}
```

### Secure Patterns
```php
// Proper security implementation
add_action('wp_ajax_save_data', 'handle_save');
function handle_save() {
    if (!current_user_can('manage_options')) { // ✅ Capability check
        wp_die('Unauthorized');
    }

    if (!wp_verify_nonce($_POST['nonce'], 'save_data')) { // ✅ Nonce verification
        wp_die('Invalid nonce');
    }

    $data = sanitize_text_field($_POST['data']); // ✅ Input sanitization
    update_option('sensitive_data', $data);
}
```

## 🧪 Testing

The application includes comprehensive mock data representing common WordPress plugin vulnerabilities:
- Plugins with missing capability checks
- AJAX handlers without nonce verification
- Mixed security implementations
- Real-world vulnerable code examples

## 📈 Roadmap

### ✅ Milestone 1: Frontend UI (Completed)
- Modern dashboard interface
- File upload system
- Results visualization
- Export functionality

### 🚧 Milestone 2: Backend Integration (In Progress)
- FastAPI backend development
- Advanced PHP code analysis
- Real vulnerability detection
- Enhanced reporting

### 📋 Milestone 3: Advanced Features
- Machine learning-assisted detection
- Plugin marketplace integration
- CI/CD pipeline integration
- Enterprise reporting features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Patchstack Academy](https://patchstack.com/academy/) for WordPress security research
- [OWASP](https://owasp.org/) for security best practices
- WordPress security community for vulnerability insights

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**⚠️ Security Notice**: This tool is designed for security research and authorized testing only. Always obtain proper permission before analyzing third-party plugins.