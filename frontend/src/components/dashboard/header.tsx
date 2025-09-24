'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { Upload, Shield, AlertTriangle } from 'lucide-react'

export function Header() {
  const { currentScan, upload } = useAppStore()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">
            WordPress Security Scanner
          </h1>
        </div>

        {currentScan && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-gray-600">
              {currentScan.pluginName}
            </Badge>
            <Badge variant="secondary">
              {currentScan.totalHooks} hooks found
            </Badge>
            {currentScan.vulnerableHooks > 0 && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{currentScan.vulnerableHooks} vulnerable</span>
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          disabled={upload.isUploading}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Plugin</span>
        </Button>
      </div>
    </header>
  )
}