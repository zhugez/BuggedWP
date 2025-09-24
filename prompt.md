# Backend API Analysis Prompt - Milestone 2

## Overview
This prompt is used by the FastAPI backend to analyze indexed WordPress plugin code and generate security recommendations. The prompt processes the analyzed code structure and returns 5 targeted security recommendations.

## Input Schema

### Required Fields
```json
{
  "plugin_name": "string",           // Plugin name or upload ID
  "file_paths": ["string"],          // Array of file paths containing hooks
  "analysis_results": [              // Array of detected AJAX handlers
    {
      "hook_type": "string",         // wp_ajax, wp_ajax_nopriv, etc.
      "hook_name": "string",         // Full hook name (e.g., wp_ajax_save_data)
      "callback_function": "string", // Function name handling the AJAX request
      "file_path": "string",         // File containing the callback
      "line_number": "number",       // Line where hook is registered
      "detected_checks": {           // Security checks found in callback
        "current_user_can": "boolean",
        "wp_verify_nonce": "boolean",
        "check_ajax_referer": "boolean",
        "check_admin_referer": "boolean"
      },
      "code_snippet": "string",     // Relevant callback function code
      "vulnerability_level": "string" // critical, high, medium, low
    }
  ]
}
```

### Optional Context Fields
```json
{
  "preferences": {
    "focus_only_insecure": "boolean",    // Only analyze handlers missing security checks
    "severity_threshold": "string",      // minimum, medium, high, critical
    "include_best_practices": "boolean", // Include general security advice
    "code_examples": "boolean"           // Include code examples in recommendations
  }
}
```

## Analysis Prompt Template

### System Prompt
```
You are a WordPress security expert analyzing AJAX handlers for vulnerabilities. Your task is to analyze the provided plugin code and generate exactly 5 security recommendations based on the detected issues.

Focus areas:
1. Missing authorization checks (current_user_can)
2. Missing nonce verification (wp_verify_nonce, check_ajax_referer)
3. Input validation and sanitization
4. SQL injection prevention
5. Cross-site scripting (XSS) prevention
6. Privilege escalation risks
7. Data exposure concerns

Guidelines:
- Prioritize critical and high-severity issues
- Provide actionable, specific recommendations
- Include code examples when helpful
- Reference exact file paths and line numbers
- Explain the security impact of each issue
```

### User Prompt Template
```
Analyze the following WordPress plugin for AJAX security vulnerabilities:

**Plugin Information:**
- Name: {{plugin_name}}
- Files analyzed: {{file_paths}}

**Detected AJAX Handlers:**
{{#each analysis_results}}
---
**Handler {{@index}}:**
- Hook: {{hook_type}} - {{hook_name}}
- Callback: {{callback_function}} ({{file_path}}:{{line_number}})
- Security Checks:
  - current_user_can: {{detected_checks.current_user_can}}
  - wp_verify_nonce: {{detected_checks.wp_verify_nonce}}
  - check_ajax_referer: {{detected_checks.check_ajax_referer}}
  - check_admin_referer: {{detected_checks.check_admin_referer}}
- Vulnerability Level: {{vulnerability_level}}

**Code Snippet:**
```php
{{code_snippet}}
```
{{/each}}

**Analysis Preferences:**
{{#if preferences.focus_only_insecure}}
- Focus only on insecure handlers
{{/if}}
{{#if preferences.severity_threshold}}
- Minimum severity: {{preferences.severity_threshold}}
{{/if}}
{{#if preferences.include_best_practices}}
- Include general security best practices
{{/if}}

**Required Output:**
Generate exactly 5 security recommendations in the following JSON format:

```json
{
  "recommendations": [
    {
      "id": 1,
      "title": "Brief recommendation title",
      "severity": "critical|high|medium|low",
      "description": "Detailed explanation of the security issue",
      "affected_handlers": ["handler1", "handler2"],
      "file_references": [
        {
          "file": "path/to/file.php",
          "line": 123,
          "function": "callback_function_name"
        }
      ],
      "impact": "Explanation of potential security impact",
      "solution": "Step-by-step fix instructions",
      "code_example": "// Fixed code example (if applicable)"
    }
  ],
  "summary": {
    "total_handlers": 0,
    "vulnerable_handlers": 0,
    "critical_issues": 0,
    "high_issues": 0,
    "medium_issues": 0,
    "low_issues": 0
  }
}
```

Priority order for recommendations:
1. Critical: Missing authorization allowing privilege escalation
2. High: Missing nonce verification enabling CSRF attacks
3. Medium: Input validation issues leading to XSS/injection
4. Low: General security improvements and best practices

Ensure each recommendation is:
- Specific to the analyzed code
- Actionable with clear fix instructions
- Includes relevant file/line references
- Explains the security impact clearly
```

## Example API Call

### Request Body
```json
{
  "plugin_name": "contact-form-manager",
  "file_paths": ["includes/ajax-handlers.php", "admin/settings.php"],
  "analysis_results": [
    {
      "hook_type": "wp_ajax",
      "hook_name": "wp_ajax_save_form_data",
      "callback_function": "handle_save_form",
      "file_path": "includes/ajax-handlers.php",
      "line_number": 45,
      "detected_checks": {
        "current_user_can": false,
        "wp_verify_nonce": false,
        "check_ajax_referer": false,
        "check_admin_referer": false
      },
      "code_snippet": "function handle_save_form() {\n    $form_data = $_POST['form_data'];\n    update_option('contact_forms', $form_data);\n    wp_die('success');\n}",
      "vulnerability_level": "critical"
    }
  ],
  "preferences": {
    "focus_only_insecure": true,
    "severity_threshold": "medium",
    "include_best_practices": true,
    "code_examples": true
  }
}
```

### Expected Response Format
```json
{
  "recommendations": [
    {
      "id": 1,
      "title": "Add Authorization Check to AJAX Handler",
      "severity": "critical",
      "description": "The handle_save_form function lacks user permission verification, allowing any authenticated user to modify contact form settings.",
      "affected_handlers": ["handle_save_form"],
      "file_references": [
        {
          "file": "includes/ajax-handlers.php",
          "line": 45,
          "function": "handle_save_form"
        }
      ],
      "impact": "Unauthorized users could modify or delete contact forms, leading to data loss or website defacement.",
      "solution": "Add current_user_can('manage_options') check at the beginning of the function.",
      "code_example": "function handle_save_form() {\n    if (!current_user_can('manage_options')) {\n        wp_die('Unauthorized', 403);\n    }\n    // ... rest of function\n}"
    }
  ],
  "summary": {
    "total_handlers": 1,
    "vulnerable_handlers": 1,
    "critical_issues": 1,
    "high_issues": 0,
    "medium_issues": 0,
    "low_issues": 0
  }
}
```

## Integration Notes

### FastAPI Endpoint
```python
@app.post("/analyze-security")
async def analyze_security(request: SecurityAnalysisRequest):
    # Process the analysis_results and generate prompt
    # Send to LLM/analysis engine
    # Parse and validate response
    # Return structured recommendations
```

### Frontend Integration
The frontend will call this endpoint after the plugin code has been indexed and analyzed, passing the detected AJAX handlers and user preferences to receive the 5 security recommendations for display in the dashboard.

### Error Handling
- Invalid input schema: Return 400 with validation errors
- Analysis timeout: Return 408 with partial results if available
- LLM service unavailable: Return 503 with retry information
- No recommendations generated: Return 200 with empty recommendations array and explanation