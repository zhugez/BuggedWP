'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { Shield, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'

export function StatsSection() {
  const { currentScan } = useAppStore()

  if (!currentScan) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No scan results available
      </div>
    )
  }

  const secureCount = currentScan.hooks.filter(h => h.vulnerabilityLevel === 'secure').length
  const warningCount = currentScan.hooks.filter(h => h.vulnerabilityLevel === 'warning').length
  const vulnerableCount = currentScan.hooks.filter(h => h.vulnerabilityLevel === 'vulnerable').length

  return (
    <div className="space-y-3">
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-700">Total Hooks</span>
          </div>
          <Badge variant="secondary">{currentScan.totalHooks}</Badge>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-700">Secure</span>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-300">
            {secureCount}
          </Badge>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-gray-700">Warning</span>
          </div>
          <Badge variant="outline" className="text-amber-700 border-amber-300">
            {warningCount}
          </Badge>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-700">Vulnerable</span>
          </div>
          <Badge variant="destructive">{vulnerableCount}</Badge>
        </div>
      </Card>
    </div>
  )
}