'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AjaxHook } from '@/types'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'

interface CodeViewerProps {
  hook: AjaxHook
}

export function CodeViewer({ hook }: CodeViewerProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getSecurityCheckStatus = (check: boolean) => {
    return check ? (
      <div className="flex items-center space-x-1 text-green-700">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Present</span>
      </div>
    ) : (
      <div className="flex items-center space-x-1 text-red-700">
        <X className="h-4 w-4" />
        <span className="text-sm">Missing</span>
      </div>
    )
  }

  const getVulnerabilityDescription = (level: AjaxHook['vulnerabilityLevel'], checks: AjaxHook['securityChecks']) => {
    const missing = []
    if (!checks.currentUserCan) missing.push('Permission check (current_user_can)')
    if (!checks.wpVerifyNonce && !checks.checkAjaxReferer && !checks.checkAdminReferer) {
      missing.push('Nonce verification')
    }

    switch (level) {
      case 'secure':
        return 'This hook has proper security checks in place.'
      case 'warning':
        return `This hook has some security measures but may be missing: ${missing.join(', ')}`
      case 'vulnerable':
        return `This hook is vulnerable! Missing critical security checks: ${missing.join(', ')}`
    }
  }

  return (
    <div className="bg-gray-50 p-4">
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">{hook.callbackFunction}</h4>
                <Badge variant="outline">{hook.filePath}:{hook.lineNumber}</Badge>
              </div>
              <p className="text-sm text-gray-600">
                {getVulnerabilityDescription(hook.vulnerabilityLevel, hook.securityChecks)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(hook.codeSnippet)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Security Checks */}
        <div className="bg-white border-b p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Security Checks</h5>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Permission Check:</span>
              {getSecurityCheckStatus(hook.securityChecks.currentUserCan)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">wp_verify_nonce:</span>
              {getSecurityCheckStatus(hook.securityChecks.wpVerifyNonce)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">check_ajax_referer:</span>
              {getSecurityCheckStatus(hook.securityChecks.checkAjaxReferer)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">check_admin_referer:</span>
              {getSecurityCheckStatus(hook.securityChecks.checkAdminReferer)}
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="relative">
          <div className="bg-gray-900 text-gray-100 p-2 text-xs font-medium">
            PHP Code
          </div>
          <SyntaxHighlighter
            language="php"
            style={tomorrow}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '14px',
              lineHeight: '1.5',
            }}
            showLineNumbers
            startingLineNumber={hook.lineNumber}
          >
            {hook.codeSnippet}
          </SyntaxHighlighter>
        </div>

        {/* Recommendations */}
        {hook.vulnerabilityLevel !== 'secure' && (
          <div className="bg-yellow-50 border-t p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-amber-800">Security Recommendations</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  {!hook.securityChecks.currentUserCan && (
                    <li>• Add permission check: <code>current_user_can('appropriate_capability')</code></li>
                  )}
                  {!hook.securityChecks.wpVerifyNonce && !hook.securityChecks.checkAjaxReferer && (
                    <li>• Add nonce verification: <code>wp_verify_nonce()</code> or <code>check_ajax_referer()</code></li>
                  )}
                  <li>• Sanitize and validate all input data before processing</li>
                  <li>• Use prepared statements for database queries</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}