import { create } from 'zustand'
import { AppState } from '@/types'
import { mockScanResult } from '@/lib/mock-data'

interface AppStore extends AppState {
  // Actions
  setCurrentScan: (scan: AppState['currentScan']) => void
  updateFilters: (filters: Partial<AppState['filters']>) => void
  setUploadProgress: (progress: number) => void
  setUploadError: (error: string | null) => void
  setIsUploading: (isUploading: boolean) => void
  setCurrentFile: (file: File | null) => void
  toggleHookSelection: (hookId: string) => void
  clearSelectedHooks: () => void
  resetFilters: () => void
}

const initialFilters = {
  showOnlyInsecure: false,
  hookTypeFilter: 'all' as const,
  severityFilter: 'all' as const,
  searchTerm: ''
}

const initialUploadState = {
  isUploading: false,
  progress: 0,
  currentFile: null,
  error: null
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  scanResults: [mockScanResult],
  currentScan: mockScanResult,
  filters: initialFilters,
  upload: initialUploadState,
  selectedHooks: [],

  // Actions
  setCurrentScan: (scan) => set({ currentScan: scan }),

  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),

  setUploadProgress: (progress) =>
    set((state) => ({
      upload: { ...state.upload, progress }
    })),

  setUploadError: (error) =>
    set((state) => ({
      upload: { ...state.upload, error }
    })),

  setIsUploading: (isUploading) =>
    set((state) => ({
      upload: { ...state.upload, isUploading }
    })),

  setCurrentFile: (currentFile) =>
    set((state) => ({
      upload: { ...state.upload, currentFile }
    })),

  toggleHookSelection: (hookId) =>
    set((state) => ({
      selectedHooks: state.selectedHooks.includes(hookId)
        ? state.selectedHooks.filter(id => id !== hookId)
        : [...state.selectedHooks, hookId]
    })),

  clearSelectedHooks: () => set({ selectedHooks: [] }),

  resetFilters: () => set({ filters: initialFilters })
}))