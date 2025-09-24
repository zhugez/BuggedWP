'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'

export function UploadSection() {
  const { upload, setCurrentFile, setIsUploading, setUploadProgress, setUploadError } = useAppStore()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setCurrentFile(file)
      setUploadError(null)

      // Simulate upload process
      simulateUpload(file)
    }
  }, [setCurrentFile, setUploadError])

  const simulateUpload = (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + Math.random() * 30
        if (next >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadProgress(100)
          return 100
        }
        return next
      })
    }, 200)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxFiles: 1,
    disabled: upload.isUploading
  })

  const clearFile = () => {
    setCurrentFile(null)
    setUploadProgress(0)
    setUploadError(null)
  }

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={`
          p-4 border-2 border-dashed transition-colors cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${upload.isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2 text-center">
          <Upload className="h-6 w-6 text-gray-400" />
          <div className="text-sm">
            {isDragActive ? (
              <span className="text-blue-600">Drop the ZIP file here</span>
            ) : (
              <span className="text-gray-600">
                Drop a ZIP file here, or{' '}
                <span className="text-blue-600 underline">browse</span>
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            WordPress plugin ZIP files only
          </div>
        </div>
      </Card>

      {/* Current File */}
      {upload.currentFile && (
        <Card className="p-3">
          <div className="flex items-start space-x-3">
            <File className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {upload.currentFile.name}
              </div>
              <div className="text-xs text-gray-500">
                {(upload.currentFile.size / 1024 / 1024).toFixed(2)} MB
              </div>

              {/* Progress Bar */}
              {upload.isUploading && (
                <div className="mt-2 space-y-1">
                  <Progress value={upload.progress} className="h-2" />
                  <div className="text-xs text-gray-500">
                    Uploading... {Math.round(upload.progress)}%
                  </div>
                </div>
              )}

              {/* Success State */}
              {!upload.isUploading && upload.progress === 100 && (
                <div className="flex items-center space-x-1 mt-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-700">Upload complete</span>
                </div>
              )}

              {/* Error State */}
              {upload.error && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-700">{upload.error}</span>
                </div>
              )}
            </div>

            {!upload.isUploading && (
              <Button variant="ghost" size="sm" onClick={clearFile}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}