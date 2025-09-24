'use client'

import React, { useCallback, useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, CheckCircle2, Search, ShieldAlert, ShieldCheck, Copy, Download, Eye, Info } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer } from "recharts"
import { useAppStore } from '@/lib/store'
import { AjaxHook } from '@/types'
import { UnifiedUpload } from '@/components/upload/unified-upload'

type Severity = "secure" | "warning" | "vulnerable" | "unknown"

function getSeverity(hook: AjaxHook): Severity {
  const { currentUserCan, wpVerifyNonce, checkAjaxReferer, checkAdminReferer } = hook.securityChecks
  const hasPermission = currentUserCan
  const hasNonce = wpVerifyNonce || checkAjaxReferer || checkAdminReferer

  if (hasPermission && hasNonce) return "secure"
  if (!hasPermission && !hasNonce) return "vulnerable"
  return "warning"
}

function isNopriv(hookName: string) {
  return hookName.includes("nopriv")
}

function formatLocation(file: string, line: number) {
  return `${file}:${line}`
}

export default function WPAjaxAuditDashboard() {
  const { currentScan, filters, updateFilters } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [codeOpen, setCodeOpen] = useState(false)
  const [codeItem, setCodeItem] = useState<AjaxHook | null>(null)

  const hooks = currentScan?.hooks || []

  const stats = useMemo(() => {
    const total = hooks.length
    const bySeverity = hooks.reduce(
      (acc, h) => { acc[getSeverity(h)]++; return acc },
      { secure: 0, warning: 0, vulnerable: 0, unknown: 0 } as Record<Severity, number>
    )
    const missingNonce = hooks.filter(h => !h.securityChecks.wpVerifyNonce && !h.securityChecks.checkAjaxReferer && !h.securityChecks.checkAdminReferer).length
    const missingPerm = hooks.filter(h => !h.securityChecks.currentUserCan).length
    return { total, bySeverity, missingNonce, missingPerm }
  }, [hooks])

  const filtered = useMemo(() => {
    return hooks.filter(h => {
      if (filters.showOnlyInsecure && getSeverity(h) === "secure") return false
      if (filters.hookTypeFilter === "wp_ajax" && isNopriv(h.hookName)) return false
      if (filters.hookTypeFilter === "wp_ajax_nopriv" && !isNopriv(h.hookName)) return false
      const q = filters.searchTerm.trim().toLowerCase()
      if (!q) return true
      return (
        h.hookName.toLowerCase().includes(q) ||
        h.filePath.toLowerCase().includes(q) ||
        h.callbackFunction.toLowerCase().includes(q)
      )
    })
  }, [hooks, filters])

  const chartData = useMemo(() => [
    { name: "Secure", value: stats.bySeverity.secure, fill: "#10B981" },
    { name: "Warning", value: stats.bySeverity.warning, fill: "#F59E0B" },
    { name: "Vulnerable", value: stats.bySeverity.vulnerable, fill: "#EF4444" },
    { name: "Unknown", value: stats.bySeverity.unknown, fill: "#6B7280" },
  ], [stats])


  const copyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(hooks, null, 2))
  }

  const exportCSV = () => {
    const headers = [
      "hook","hook_file","hook_line","callback","handler_file","handler_line","has_permission_check","has_nonce_check","severity"
    ]
    const rows = hooks.map(h => [
      h.hookName, h.filePath, String(h.lineNumber), h.callbackFunction,
      h.filePath, String(h.lineNumber),
      String(h.securityChecks.currentUserCan),
      String(h.securityChecks.wpVerifyNonce || h.securityChecks.checkAjaxReferer),
      getSeverity(h)
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wp-ajax-audit.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WordPress Security Scanner</h1>
            <p className="text-gray-600 mt-1">
              Scan WordPress plugins for missing <code className="bg-gray-100 px-1 py-0.5 rounded">current_user_can()</code> and nonce checks in AJAX handlers
            </p>
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" onClick={() => {}}>
                    <Info className="mr-2 h-4 w-4"/>Load sample
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Use built-in sample findings for demo</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" onClick={copyJSON}>
              <Copy className="mr-2 h-4 w-4"/>Copy JSON
            </Button>
            <Button onClick={exportCSV}>
              <Download className="mr-2 h-4 w-4"/>Export CSV
            </Button>
          </div>
        </div>

        {/* Upload Zone */}
        <UnifiedUpload />

        {/* Controls & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm border-0 shadow-md lg:col-span-3">
            <CardContent className="p-6 space-y-6">
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                  <Input
                    placeholder="Search hook, file, or callback…"
                    className="pl-10"
                    value={filters.searchTerm}
                    onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="onlyInsecure"
                    checked={filters.showOnlyInsecure}
                    onCheckedChange={(checked) => updateFilters({ showOnlyInsecure: checked })}
                  />
                  <Label htmlFor="onlyInsecure" className="font-medium">Only insecure</Label>
                </div>
                <Select
                  value={filters.hookTypeFilter}
                  onValueChange={(value: any) => updateFilters({ hookTypeFilter: value })}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Hook type"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All hooks</SelectItem>
                    <SelectItem value="wp_ajax">wp_ajax (authenticated)</SelectItem>
                    <SelectItem value="wp_ajax_nopriv">wp_ajax_nopriv (public)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" fontSize={12}/>
                    <YAxis allowDecimals={false} fontSize={12}/>
                    <RTooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0 shadow-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Security Summary</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total hooks</span>
                  <span className="font-semibold text-lg">{stats.total}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Critical</span>
                  <Badge variant="destructive" className="px-2 py-1">
                    {stats.bySeverity.vulnerable}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Warnings</span>
                  <Badge className="px-2 py-1 bg-amber-100 text-amber-800 hover:bg-amber-200">
                    {stats.bySeverity.warning}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Secure</span>
                  <Badge className="px-2 py-1 bg-green-100 text-green-800 hover:bg-green-200">
                    {stats.bySeverity.secure}
                  </Badge>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-4"/>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Missing nonce check</span>
                  <span className="font-medium text-red-600">{stats.missingNonce}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Missing permission check</span>
                  <span className="font-medium text-red-600">{stats.missingPerm}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card className="shadow-sm border-0 shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr className="text-left">
                    <th className="p-4 font-medium text-gray-700">Hook</th>
                    <th className="p-4 font-medium text-gray-700">Type</th>
                    <th className="p-4 font-medium text-gray-700">Location</th>
                    <th className="p-4 font-medium text-gray-700">Callback</th>
                    <th className="p-4 font-medium text-gray-700">Security Checks</th>
                    <th className="p-4 font-medium text-gray-700">Status</th>
                    <th className="p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((hook, idx) => {
                    const severity = getSeverity(hook)
                    return (
                      <tr key={hook.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{hook.hookName}</div>
                        </td>
                        <td className="p-4">
                          {isNopriv(hook.hookName) ? (
                            <Badge variant="secondary" className="text-xs">nopriv</Badge>
                          ) : (
                            <Badge className="text-xs bg-blue-100 text-blue-800">auth</Badge>
                          )}
                        </td>
                        <td className="p-4 text-gray-600 font-mono text-xs">
                          {formatLocation(hook.filePath, hook.lineNumber)}
                        </td>
                        <td className="p-4">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {hook.callbackFunction}
                          </code>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {hook.securityChecks.wpVerifyNonce || hook.securityChecks.checkAjaxReferer ? (
                              <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                                <CheckCircle2 className="h-3 w-3"/> nonce
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-600 text-xs">
                                <AlertTriangle className="h-3 w-3"/> nonce
                              </span>
                            )}
                            {hook.securityChecks.currentUserCan ? (
                              <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                                <CheckCircle2 className="h-3 w-3"/> perm
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-600 text-xs">
                                <AlertTriangle className="h-3 w-3"/> perm
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {severity === "secure" && (
                            <span className="inline-flex items-center gap-1 text-green-700 text-sm">
                              <ShieldCheck className="h-4 w-4"/> Secure
                            </span>
                          )}
                          {severity === "warning" && (
                            <span className="inline-flex items-center gap-1 text-amber-700 text-sm">
                              <ShieldAlert className="h-4 w-4"/> Warning
                            </span>
                          )}
                          {severity === "vulnerable" && (
                            <span className="inline-flex items-center gap-1 text-red-700 text-sm">
                              <ShieldAlert className="h-4 w-4"/> Critical
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setCodeItem(hook); setCodeOpen(true) }}
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1"/> View Code
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="p-8 text-center text-gray-500" colSpan={7}>
                        {hooks.length === 0 ? "No hooks found. Upload a plugin to start scanning." : "No results match the current filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Code Preview Dialog */}
        <Dialog open={codeOpen} onOpenChange={setCodeOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Code Preview
              </DialogTitle>
            </DialogHeader>
            {codeItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Hook:</span>
                    <div className="mt-1 font-mono text-blue-600">{codeItem.hookName}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <div className="mt-1 font-mono text-gray-600">
                      {formatLocation(codeItem.filePath, codeItem.lineNumber)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-950 text-gray-100 rounded-lg p-4 overflow-auto">
                  <pre className="text-sm leading-relaxed">
                    <code>{codeItem.codeSnippet}</code>
                  </pre>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Security Recommendations</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>• Always verify nonce tokens using <code>wp_verify_nonce()</code> or <code>check_ajax_referer()</code></div>
                    <div>• Check user capabilities with <code>current_user_can()</code> before processing</div>
                    <div>• Sanitize and validate all input data before use</div>
                    <div>• Use prepared statements for database queries</div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="text-xs text-gray-500 text-center py-6 border-t">
          © {new Date().getFullYear()} WordPress Security Scanner — Built for security auditing
        </div>
      </div>


      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-50 text-red-700 border border-red-200 rounded-xl px-6 py-4 shadow-lg max-w-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}