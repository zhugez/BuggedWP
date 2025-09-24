'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { Search, X } from 'lucide-react'

export function FilterSection() {
  const { filters, updateFilters, resetFilters } = useAppStore()

  const handleToggleInsecure = () => {
    updateFilters({ showOnlyInsecure: !filters.showOnlyInsecure })
  }

  const handleHookTypeFilter = (type: typeof filters.hookTypeFilter) => {
    updateFilters({ hookTypeFilter: type })
  }

  const handleSeverityFilter = (severity: typeof filters.severityFilter) => {
    updateFilters({ severityFilter: severity })
  }

  const handleSearchChange = (searchTerm: string) => {
    updateFilters({ searchTerm })
  }

  const hasActiveFilters =
    filters.showOnlyInsecure ||
    filters.hookTypeFilter !== 'all' ||
    filters.severityFilter !== 'all' ||
    filters.searchTerm !== ''

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search hooks..."
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Toggle */}
      <Button
        variant={filters.showOnlyInsecure ? "default" : "outline"}
        size="sm"
        onClick={handleToggleInsecure}
        className="w-full justify-center"
      >
        {filters.showOnlyInsecure ? 'Show All Hooks' : 'Show Only Insecure'}
      </Button>

      {/* Hook Type Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          Hook Type
        </h4>
        <div className="flex flex-wrap gap-1">
          {(['all', 'wp_ajax', 'wp_ajax_nopriv'] as const).map((type) => (
            <Badge
              key={type}
              variant={filters.hookTypeFilter === type ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => handleHookTypeFilter(type)}
            >
              {type === 'all' ? 'All' : type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Severity Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          Security Level
        </h4>
        <div className="flex flex-wrap gap-1">
          {(['all', 'vulnerable', 'warning', 'secure'] as const).map((severity) => (
            <Badge
              key={severity}
              variant={filters.severityFilter === severity ? "default" : "outline"}
              className={`cursor-pointer text-xs ${
                severity === 'vulnerable' ? 'hover:bg-red-100' :
                severity === 'warning' ? 'hover:bg-amber-100' :
                severity === 'secure' ? 'hover:bg-green-100' : ''
              }`}
              onClick={() => handleSeverityFilter(severity)}
            >
              {severity === 'all' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="w-full justify-center text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}