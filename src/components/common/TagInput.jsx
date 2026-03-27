import { useState } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export function TagInput({ value = [], onChange, placeholder }) {
  const [inputValue, setInputValue] = useState('')

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed])
      }
      setInputValue('')
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function removeTag(tag) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-0.5 rounded-full outline-none hover:bg-secondary-foreground/20 focus-visible:ring-1"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remover {tag}</span>
          </button>
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="h-auto min-w-[120px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
      />
    </div>
  )
}
