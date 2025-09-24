export interface AjaxHook {
  id: string
  hookType: 'wp_ajax' | 'wp_ajax_nopriv'
  hookName: string
  callbackFunction: string
  filePath: string
  lineNumber: number
  securityChecks: {
    currentUserCan: boolean
    wpVerifyNonce: boolean
    checkAjaxReferer: boolean
    checkAdminReferer: boolean
  }
  vulnerabilityLevel: 'secure' | 'warning' | 'vulnerable'
  codeSnippet: string
}

export interface ScanResult {
  id: string
  pluginName: string
  uploadedAt: Date
  totalHooks: number
  vulnerableHooks: number
  hooks: AjaxHook[]
  status: 'scanning' | 'completed' | 'error'
}

export interface FilterState {
  showOnlyInsecure: boolean
  hookTypeFilter: 'all' | 'wp_ajax' | 'wp_ajax_nopriv'
  severityFilter: 'all' | 'vulnerable' | 'warning' | 'secure'
  searchTerm: string
}

export interface UploadState {
  isUploading: boolean
  progress: number
  currentFile: File | null
  error: string | null
}

export interface AppState {
  scanResults: ScanResult[]
  currentScan: ScanResult | null
  filters: FilterState
  upload: UploadState
  selectedHooks: string[]
}