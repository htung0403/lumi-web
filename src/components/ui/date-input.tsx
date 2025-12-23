import React, { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DateInputProps {
    value?: Date
    onChange: (date: Date) => void
    className?: string
}

export const DateInput: React.FC<DateInputProps> = ({ value, onChange, className }) => {
    const [inputValue, setInputValue] = useState('')

    // Format: DD/MM/YYYY
    const formatDate = (date: Date) => {
        const dd = String(date.getDate()).padStart(2, '0')
        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const yyyy = date.getFullYear()
        return `${dd}/${mm}/${yyyy}`
    }

    useEffect(() => {
        if (value) {
            setInputValue(formatDate(value))
        } else {
            setInputValue('')
        }
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value

        // Auto-format DD/MM/YYYY while typing
        val = val.replace(/\D/g, '') // Remove non-digits
        if (val.length > 8) val = val.substring(0, 8)

        let formatted = val
        if (val.length > 2) {
            formatted = val.substring(0, 2) + '/' + val.substring(2)
        }
        if (val.length > 4) {
            formatted = formatted.substring(0, 5) + '/' + val.substring(4)
        }

        setInputValue(formatted)

        // If complete, trigger onChange
        if (val.length === 8) {
            const d = parseInt(val.substring(0, 2))
            const m = parseInt(val.substring(2, 4)) - 1
            const y = parseInt(val.substring(4, 8))
            const date = new Date(y, m, d)
            if (!isNaN(date.getTime()) && date.getFullYear() === y && date.getMonth() === m && date.getDate() === d) {
                onChange(date)
            }
        }
    }

    return (
        <Input
            type="text"
            placeholder="dd/mm/yyyy"
            value={inputValue}
            onChange={handleInputChange}
            className={cn("w-[120px] text-center", className)}
        />
    )
}
