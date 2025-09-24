'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { Upload, File, FolderOpen, X, CheckCircle, AlertCircle } from 'lucide-react'

export function UnifiedUpload() {
  const { upload, setCurrentFile, setIsUploading, setUploadProgress, setUploadError } = useAppStore()
  const [uploadType, setUploadType] = useState<'zip' | 'folder' | null>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setCurrentFile(file)
      setUploadError(null)
      setUploadType('zip')
      simulateUpload(file)
    }
  }, [setCurrentFile, setUploadError])

  const onFolderSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      // Create a fake file object to represent the folder
      const folderFile = new File([''], 'plugin-folder', { type: 'application/x-folder' })
      setCurrentFile(folderFile)
      setUploadError(null)
      setUploadType('folder')
      simulateUpload(folderFile)
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
    setUploadType(null)
    if (folderInputRef.current) {
      folderInputRef.current.value = ''
    }
  }

  const selectFolder = () => {
    folderInputRef.current?.click()
  }

  return (
    <Card className="shadow-sm border-0 shadow-md">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Upload className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold">Upload Plugin</h2>
        </div>

        {/* Main Upload Area */}
        {!upload.currentFile ? (
          <div className="space-y-4">
            {/* Drag & Drop Zone */}
            <Card
              {...getRootProps()}
              className={`
                border-2 border-dashed transition-all duration-200 cursor-pointer
                ${isDragActive
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
                ${upload.isUploading ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <CardContent className="p-8 text-center">
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className={`
                      p-4 rounded-full transition-colors
                      ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}
                    `}>
                      <Upload className={`
                        h-8 w-8 transition-colors
                        ${isDragActive ? 'text-blue-600' : 'text-gray-400'}
                      `} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isDragActive ? 'Drop your ZIP file here' : 'Upload Plugin ZIP'}
                    </h3>
                    <p className="text-gray-600">
                      Drag and drop a WordPress plugin ZIP file, or click to browse
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <File className="h-3 w-3" />
                    <span>Supports .zip files up to 50MB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Options */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-500 bg-white px-3">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Folder Selection */}
            <Button
              variant="outline"
              onClick={selectFolder}
              disabled={upload.isUploading}
              className="w-full h-12 border-dashed"
            >
              <FolderOpen className="mr-3 h-4 w-4" />
              Select Plugin Folder (Development)
            </Button>

            <input
              type="file"
              ref={folderInputRef}
              onChange={onFolderSelect}
              className="hidden"
              //@ts-ignore
              webkitdirectory="true"
              directory="true"
              multiple
            />

            <p className="text-xs text-gray-500 text-center">
              Folder selection uses sample data for demonstration
            </p>
          </div>
        ) : (
          /* File Preview & Progress */
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {uploadType === 'zip' ? (
                  <File className="h-8 w-8 text-blue-500" />
                ) : (
                  <FolderOpen className="h-8 w-8 text-green-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 truncate">
                      {upload.currentFile.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>
                        {uploadType === 'zip' ? 'ZIP Archive' : 'Plugin Folder'}
                      </span>
                      {uploadType === 'zip' && (
                        <span>
                          {(upload.currentFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                  </div>

                  {!upload.isUploading && (
                    <Button variant="ghost" size="sm" onClick={clearFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Progress Bar */}
                {upload.isUploading && (
                  <div className="mt-3 space-y-2">
                    <Progress value={upload.progress} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Processing... {Math.round(upload.progress)}%
                      </span>
                      <span className="text-gray-500">
                        Analyzing security patterns
                      </span>
                    </div>
                  </div>
                )}

                {/* Success State */}
                {!upload.isUploading && upload.progress === 100 && (
                  <div className="flex items-center gap-2 mt-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700 font-medium">
                      Upload complete! Analysis results are ready.
                    </span>
                  </div>
                )}

                {/* Error State */}
                {upload.error && (
                  <div className="flex items-center gap-2 mt-3">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{upload.error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Another */}
            {!upload.isUploading && (
              <Button
                variant="outline"
                onClick={clearFile}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Another Plugin
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}