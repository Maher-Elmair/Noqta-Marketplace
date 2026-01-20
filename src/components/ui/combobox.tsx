"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/hooks/use-translation"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  allowCustom?: boolean
  onCreate?: (value: string) => void
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  allowCustom = false,
  onCreate,
}: ComboboxProps) {
  const t = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  
  const defaultPlaceholder = placeholder || t('common.selectOption')
  const defaultSearchPlaceholder = searchPlaceholder || t('common.search')
  const defaultEmptyText = emptyText || t('common.noResultsFound')
  
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(search.toLowerCase())
  )



  const handleSelect = (currentValue: string) => {
    onChange(currentValue === value ? "" : currentValue)
    setOpen(false)
  }

  const handleCreate = () => {
    if (allowCustom && onCreate && search) {
      onCreate(search)
      setOpen(false)
      setSearch("")
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label || value
            : defaultPlaceholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full p-2" align="start">
        <Input 
            placeholder={defaultSearchPlaceholder} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
        />
        <div className="max-h-[200px] overflow-y-auto space-y-1">
            {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                    {defaultEmptyText}
                    {allowCustom && search && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={handleCreate}
                        >
                            {t('common.addCustom')} "{search}"
                        </Button>
                    )}
                </div>
            ) : (
                filteredOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onSelect={() => handleSelect(option.value)}
                        className="flex items-center justify-between cursor-pointer"
                    >
                        {option.label}
                        <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                value === option.value ? "opacity-100" : "opacity-0"
                            )}
                        />
                    </DropdownMenuItem>
                ))
            )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
