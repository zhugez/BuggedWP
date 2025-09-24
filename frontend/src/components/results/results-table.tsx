'use client'

import { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { AjaxHook } from '@/types'
import { ChevronDown, ChevronUp, Eye, Copy, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { CodeViewer } from './code-viewer'

export function ResultsTable() {
  const { currentScan, filters, selectedHooks, toggleHookSelection } = useAppStore()
  const [expandedHook, setExpandedHook] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof AjaxHook>('vulnerabilityLevel')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const filteredHooks = useMemo(() => {
    if (!currentScan) return []

    let hooks = [...currentScan.hooks]

    // Apply filters
    if (filters.showOnlyInsecure) {
      hooks = hooks.filter(h => h.vulnerabilityLevel !== 'secure')
    }

    if (filters.hookTypeFilter !== 'all') {
      hooks = hooks.filter(h => h.hookType === filters.hookTypeFilter)
    }

    if (filters.severityFilter !== 'all') {
      hooks = hooks.filter(h => h.vulnerabilityLevel === filters.severityFilter)
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      hooks = hooks.filter(h =>
        h.hookName.toLowerCase().includes(term) ||
        h.callbackFunction.toLowerCase().includes(term) ||
        h.filePath.toLowerCase().includes(term)
      )
    }

    // Apply sorting
    hooks.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      // Special handling for vulnerability level sorting
      if (sortField === 'vulnerabilityLevel') {
        const severityOrder = { vulnerable: 3, warning: 2, secure: 1 }
        aVal = severityOrder[a.vulnerabilityLevel]
        bVal = severityOrder[b.vulnerabilityLevel]
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return hooks
  }, [currentScan, filters, sortField, sortDirection])

  const handleSort = (field: keyof AjaxHook) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSecurityIcon = (level: AjaxHook['vulnerabilityLevel']) => {
    switch (level) {
      case 'secure':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case 'vulnerable':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getSecurityBadge = (level: AjaxHook['vulnerabilityLevel']) => {
    switch (level) {
      case 'secure':
        return <Badge variant="outline" className="text-green-700 border-green-300">Secure</Badge>
      case 'warning':
        return <Badge variant="outline" className="text-amber-700 border-amber-300">Warning</Badge>
      case 'vulnerable':
        return <Badge variant="destructive">Vulnerable</Badge>
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleExpanded = (hookId: string) => {
    setExpandedHook(expandedHook === hookId ? null : hookId)
  }

  if (!currentScan) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">No scan results available</div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Scan Results</h3>
            <p className="text-sm text-gray-500">
              {filteredHooks.length} of {currentScan.totalHooks} hooks displayed
            </p>
          </div>
          {selectedHooks.length > 0 && (
            <Badge variant="secondary">
              {selectedHooks.length} selected
            </Badge>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  onChange={(e) => {
                    // Handle select all
                  }}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('hookName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Hook Name</span>
                  {sortField === 'hookName' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('filePath')}
              >
                <div className="flex items-center space-x-1">
                  <span>File:Line</span>
                  {sortField === 'filePath' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead>Callback Function</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('vulnerabilityLevel')}
              >
                <div className="flex items-center space-x-1">
                  <span>Security Status</span>
                  {sortField === 'vulnerabilityLevel' && (
                    sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHooks.map((hook) => (
              <>
                <TableRow
                  key={hook.id}
                  className={`
                    ${selectedHooks.includes(hook.id) ? 'bg-blue-50' : ''}
                    ${expandedHook === hook.id ? 'border-b-0' : ''}
                  `}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedHooks.includes(hook.id)}
                      onChange={() => toggleHookSelection(hook.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {hook.hookType}
                        </Badge>
                        <span className="font-medium text-sm">{hook.hookName}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{hook.filePath}</div>
                      <div className="text-gray-500">Line {hook.lineNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {hook.callbackFunction}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getSecurityIcon(hook.vulnerabilityLevel)}
                      {getSecurityBadge(hook.vulnerabilityLevel)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(hook.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(hook.hookName)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded Code Viewer */}
                {expandedHook === hook.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0 border-b">
                      <CodeViewer hook={hook} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>

        {filteredHooks.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No hooks match the current filters
          </div>
        )}
      </Card>
    </div>
  )
}