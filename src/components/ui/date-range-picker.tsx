'use client'

import { type FC, useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { DateInput } from '@/components/ui/date-input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ChevronUp, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { vi } from 'date-fns/locale'

export interface DateRangePickerProps {
    /** Click handler for applying the updates from DateRangePicker. */
    onUpdate?: (values: { range: DateRange, rangeCompare?: DateRange }) => void
    /** Initial value for start date */
    initialDateFrom?: Date | string
    /** Initial value for end date */
    initialDateTo?: Date | string
    /** Initial value for start date for compare */
    initialCompareFrom?: Date | string
    /** Initial value for end date for compare */
    initialCompareTo?: Date | string
    /** Alignment of popover */
    align?: 'start' | 'center' | 'end'
    /** Option for showing compare feature */
    showCompare?: boolean
}

const formatDate = (date: Date): string => {
    // Use user request format: dd/MM/yyyy
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
    if (typeof dateInput === 'string') {
        // If string is YYYY-MM-DD
        if (dateInput.includes('-')) {
            const parts = dateInput.split('-').map((part) => parseInt(part, 10))
            // Create a new Date object using the local timezone
            // Note: Month is 0-indexed, so subtract 1 from the month part
            const date = new Date(parts[0], parts[1] - 1, parts[2])
            return date
        }
        return new Date(dateInput);
    } else {
        // If dateInput is already a Date object, return it directly
        return dateInput
    }
}

interface DateRange {
    from: Date | undefined
    to: Date | undefined
}

interface Preset {
    name: string
    label: string
}

// Define presets (translated to Vietnamese)
const PRESETS: Preset[] = [
    { name: 'today', label: 'Hôm nay' },
    { name: 'yesterday', label: 'Hôm qua' },
    { name: 'thisWeek', label: 'Tuần này' },
    { name: 'lastWeek', label: 'Tuần trước' },
    { name: 'thisMonth', label: 'Tháng này' },
    { name: 'lastMonth', label: 'Tháng trước' },
    { name: 'last7', label: '7 ngày qua' },
    { name: 'last14', label: '14 ngày qua' },
    { name: 'last30', label: '30 ngày qua' }
]

/** The DateRangePicker component allows a user to select a range of dates */
export const DateRangePicker: FC<DateRangePickerProps> = ({
    initialDateFrom,
    initialDateTo,
    initialCompareFrom,
    initialCompareTo,
    onUpdate,
    align = 'end',
    showCompare = true
}) => {
    const [isOpen, setIsOpen] = useState(false)

    const [range, setRange] = useState<DateRange>({
        from: initialDateFrom ? getDateAdjustedForTimezone(initialDateFrom) : undefined,
        to: initialDateTo ? getDateAdjustedForTimezone(initialDateTo) : undefined
    })

    // Note: user requested showCompare support but in original F3 page it wasn't used heavily. 
    // We keep it as requested in component.
    const [rangeCompare, setRangeCompare] = useState<DateRange | undefined>(
        initialCompareFrom
            ? {
                from: new Date(new Date(initialCompareFrom).setHours(0, 0, 0, 0)),
                to: initialCompareTo
                    ? new Date(new Date(initialCompareTo).setHours(0, 0, 0, 0))
                    : new Date(new Date(initialCompareFrom).setHours(0, 0, 0, 0))
            }
            : undefined
    )

    // Refs to store the values of range and rangeCompare when the date picker is opened
    const openedRangeRef = useRef<DateRange | undefined>(undefined)
    const openedRangeCompareRef = useRef<DateRange | undefined>(undefined)

    const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined)

    const [isSmallScreen, setIsSmallScreen] = useState(
        typeof window !== 'undefined' ? window.innerWidth < 960 : false
    )

    useEffect(() => {
        const handleResize = (): void => {
            setIsSmallScreen(window.innerWidth < 960)
        }

        window.addEventListener('resize', handleResize)

        // Clean up event listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const getPresetRange = (presetName: string): DateRange => {
        const preset = PRESETS.find(({ name }) => name === presetName)
        if (!preset) throw new Error(`Unknown date range preset: ${presetName}`)
        const from = new Date()
        const to = new Date()
        const first = from.getDate() - from.getDay()

        switch (preset.name) {
            case 'today':
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'yesterday':
                from.setDate(from.getDate() - 1)
                from.setHours(0, 0, 0, 0)
                to.setDate(to.getDate() - 1)
                to.setHours(23, 59, 59, 999)
                break
            case 'last7':
                from.setDate(from.getDate() - 6)
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'last14':
                from.setDate(from.getDate() - 13)
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'last30':
                from.setDate(from.getDate() - 29)
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'thisWeek':
                from.setDate(first) // This might be Sunday depending on locale, Vietnam starts Monday.
                // Adjust for Monday start if needed.
                // Check current day. 0 is Sunday.
                // Standard JS getDay(): 0(Sun) - 6(Sat).
                // For Monday start:
                {
                    const day = from.getDay();
                    const diff = from.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                    from.setDate(diff);
                    from.setHours(0, 0, 0, 0);
                    to.setHours(23, 59, 59, 999);
                    // to should represent end of week? Default logic is simply 'today' as 'end'? 
                    // Logic in snippet seems to set 'to' as new Date() (today).
                    // Let's stick to the snippet logic but ensure 'to' is consistent.
                    // Actually snippet: case 'thisWeek': from.setDate(first)...
                    // If we want "This Week" usually means start of week to NOW.
                }
                break
            case 'lastWeek':
                {
                    const day = from.getDay();
                    const diff = from.getDate() - day - 6 + (day === 0 ? -6 : 1);
                    from.setDate(diff);
                    from.setHours(0, 0, 0, 0);
                    const end = new Date(from);
                    end.setDate(end.getDate() + 6);
                    end.setHours(23, 59, 59, 999);
                    to.setTime(end.getTime());
                }
                break
            case 'thisMonth':
                from.setDate(1)
                from.setHours(0, 0, 0, 0)
                to.setHours(23, 59, 59, 999)
                break
            case 'lastMonth':
                from.setMonth(from.getMonth() - 1)
                from.setDate(1)
                from.setHours(0, 0, 0, 0)
                to.setDate(0)
                to.setHours(23, 59, 59, 999)
                break
        }

        return { from, to }
    }

    const setPreset = (preset: string): void => {
        const range = getPresetRange(preset)
        setRange(range)
        if (rangeCompare && range.from) {
            const rangeCompare = {
                from: new Date(
                    range.from.getFullYear() - 1,
                    range.from.getMonth(),
                    range.from.getDate()
                ),
                to: range.to
                    ? new Date(
                        range.to.getFullYear() - 1,
                        range.to.getMonth(),
                        range.to.getDate()
                    )
                    : undefined
            }
            setRangeCompare(rangeCompare)
        }
    }

    const checkPreset = (): void => {
        for (const preset of PRESETS) {
            const presetRange = getPresetRange(preset.name)

            const normalizedRangeFrom = new Date(range.from ?? 0);
            if (range.from) normalizedRangeFrom.setHours(0, 0, 0, 0);

            const normalizedPresetFrom = new Date(
                (presetRange.from as Date).setHours(0, 0, 0, 0)
            )

            const normalizedRangeTo = new Date(range.to ?? 0);
            if (range.to) normalizedRangeTo.setHours(0, 0, 0, 0);

            const normalizedPresetTo = new Date(
                presetRange.to?.setHours(0, 0, 0, 0) ?? 0
            )

            if (
                normalizedRangeFrom.getTime() === normalizedPresetFrom.getTime() &&
                normalizedRangeTo.getTime() === normalizedPresetTo.getTime()
            ) {
                setSelectedPreset(preset.name)
                return
            }
        }

        setSelectedPreset(undefined)
    }

    const resetValues = (): void => {
        setRange({
            from: initialDateFrom ? getDateAdjustedForTimezone(initialDateFrom) : undefined,
            to: initialDateTo ? getDateAdjustedForTimezone(initialDateTo) : undefined
        })
        setRangeCompare(
            initialCompareFrom
                ? {
                    from:
                        typeof initialCompareFrom === 'string'
                            ? getDateAdjustedForTimezone(initialCompareFrom)
                            : initialCompareFrom,
                    to: initialCompareTo
                        ? typeof initialCompareTo === 'string'
                            ? getDateAdjustedForTimezone(initialCompareTo)
                            : initialCompareTo
                        : typeof initialCompareFrom === 'string'
                            ? getDateAdjustedForTimezone(initialCompareFrom)
                            : initialCompareFrom
                }
                : undefined
        )
    }

    useEffect(() => {
        checkPreset()
    }, [range])

    const PresetButton = ({
        preset,
        label,
        isSelected
    }: {
        preset: string
        label: string
        isSelected: boolean
    }) => (
        <Button
            className={cn(isSelected && 'pointer-events-none')}
            variant="ghost"
            onClick={() => {
                setPreset(preset)
            }}
        >
            <>
                <span className={cn('pr-2 opacity-0', isSelected && 'opacity-70')}>
                    <Check width={18} height={18} />
                </span>
                {label}
            </>
        </Button>
    )

    // Helper function to check if two date ranges are equal
    const areRangesEqual = (a?: DateRange, b?: DateRange): boolean => {
        if (!a || !b) return a === b // If either is undefined, return true if both are undefined
        return (
            a.from?.getTime() === b.from?.getTime() &&
            a.to?.getTime() === b.to?.getTime()
        )
    }

    useEffect(() => {
        if (isOpen) {
            openedRangeRef.current = range
            openedRangeCompareRef.current = rangeCompare
        }
    }, [isOpen])

    return (
        <Popover
            modal={true}
            open={isOpen}
            onOpenChange={(open: boolean) => {
                if (!open) {
                    resetValues()
                }
                setIsOpen(open)
            }}
        >
            <PopoverTrigger asChild>
                <Button size={'lg'} variant="outline" className="h-10 text-sm font-normal w-auto justify-start text-left">
                    <div className="flex items-center gap-2">
                        <div className="py-1">
                            {range.from ? (
                                <div>{`${formatDate(range.from)}${range.to != null ? ' - ' + formatDate(range.to) : ''}`}</div>
                            ) : (
                                <span>Chọn khoảng thời gian</span>
                            )}
                        </div>
                        {rangeCompare != null && rangeCompare.from != null && (
                            <div className="opacity-60 text-xs text-muted-foreground">
                                <>
                                    vs. {formatDate(rangeCompare.from)}
                                    {rangeCompare.to != null
                                        ? ` - ${formatDate(rangeCompare.to)}`
                                        : ''}
                                </>
                            </div>
                        )}
                        <div className="pl-1 opacity-50">
                            {isOpen ? (<ChevronUp className="h-4 w-4" />) : (<ChevronDown className="h-4 w-4" />)}
                        </div>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent align={align} className="w-auto p-0">
                <div className="flex">
                    <div className="flex flex-col">
                        <div className="flex flex-col lg:flex-row gap-2 px-3 py-4">
                            {showCompare && (
                                <div className="flex items-center space-x-2 pr-4 py-1">
                                    <Switch
                                        defaultChecked={Boolean(rangeCompare)}
                                        onCheckedChange={(checked: boolean) => {
                                            if (checked) {
                                                if (!range.to) {
                                                    setRange({
                                                        from: range.from,
                                                        to: range.from
                                                    })
                                                }
                                                if (range.from) {
                                                    setRangeCompare({
                                                        from: new Date(
                                                            range.from.getFullYear(),
                                                            range.from.getMonth(),
                                                            range.from.getDate() - 365
                                                        ),
                                                        to: range.to
                                                            ? new Date(
                                                                range.to.getFullYear() - 1,
                                                                range.to.getMonth(),
                                                                range.to.getDate()
                                                            )
                                                            : new Date(
                                                                range.from.getFullYear() - 1,
                                                                range.from.getMonth(),
                                                                range.from.getDate()
                                                            )
                                                    })
                                                }
                                            } else {
                                                setRangeCompare(undefined)
                                            }
                                        }}
                                        id="compare-mode"
                                    />
                                    <Label htmlFor="compare-mode">So sánh</Label>
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2 items-center">
                                    <DateInput
                                        value={range.from}
                                        onChange={(date) => {
                                            const toDate =
                                                range.to == null || date > range.to ? date : range.to
                                            setRange((prevRange) => ({
                                                ...prevRange,
                                                from: date,
                                                to: toDate
                                            }))
                                        }}
                                    />
                                    <div className="py-1">-</div>
                                    <DateInput
                                        value={range.to}
                                        onChange={(date) => {
                                            const fromDate = (range.from && date < range.from) ? date : range.from
                                            setRange((prevRange) => ({
                                                ...prevRange,
                                                from: fromDate,
                                                to: date
                                            }))
                                        }}
                                    />
                                </div>
                                {rangeCompare != null && (
                                    <div className="flex gap-2 items-center">
                                        <DateInput
                                            value={rangeCompare?.from}
                                            onChange={(date) => {
                                                if (rangeCompare) {
                                                    const compareToDate =
                                                        rangeCompare.to == null || date > rangeCompare.to
                                                            ? date
                                                            : rangeCompare.to
                                                    setRangeCompare((prevRangeCompare) => ({
                                                        ...prevRangeCompare,
                                                        from: date,
                                                        to: compareToDate
                                                    }))
                                                } else {
                                                    setRangeCompare({
                                                        from: date,
                                                        to: new Date()
                                                    })
                                                }
                                            }}
                                        />
                                        <div className="py-1">-</div>
                                        <DateInput
                                            value={rangeCompare?.to}
                                            onChange={(date) => {
                                                if (rangeCompare && rangeCompare.from) {
                                                    const compareFromDate =
                                                        date < rangeCompare.from
                                                            ? date
                                                            : rangeCompare.from
                                                    setRangeCompare({
                                                        ...rangeCompare,
                                                        from: compareFromDate,
                                                        to: date
                                                    })
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        {isSmallScreen && (
                            <Select defaultValue={selectedPreset} onValueChange={(value) => { setPreset(value) }}>
                                <SelectTrigger className="w-[180px] mx-auto mb-2">
                                    <SelectValue placeholder="Chọn nhanh..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRESETS.map((preset) => (
                                        <SelectItem key={preset.name} value={preset.name}>
                                            {preset.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <div className="border-t border-border">
                            <Calendar
                                mode="range"
                                locale={vi}
                                onSelect={(value: { from?: Date, to?: Date } | undefined) => {
                                    setRange({ from: value?.from, to: value?.to })
                                }}
                                selected={range as any}
                                numberOfMonths={isSmallScreen ? 1 : 2}
                                defaultMonth={
                                    new Date(
                                        new Date().setMonth(
                                            new Date().getMonth() - (isSmallScreen ? 0 : 1)
                                        )
                                    )
                                }
                            />
                        </div>
                    </div>
                    {!isSmallScreen && (
                        <div className="flex flex-col items-start border-l border-border bg-muted/50 w-44">
                            <div className="p-2 font-medium text-sm text-foreground/70 w-full text-center border-b">
                                Lọc nhanh
                            </div>
                            <div className="flex w-full flex-col items-start p-2 gap-1">
                                {PRESETS.map((preset) => (
                                    <PresetButton
                                        key={preset.name}
                                        preset={preset.name}
                                        label={preset.label}
                                        isSelected={selectedPreset === preset.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 p-3 border-t bg-muted/20">
                    <Button
                        onClick={() => {
                            setIsOpen(false)
                            resetValues()
                        }}
                        variant="ghost"
                        size="sm"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={() => {
                            setIsOpen(false)
                            if (
                                !areRangesEqual(range, openedRangeRef.current) ||
                                !areRangesEqual(rangeCompare, openedRangeCompareRef.current)
                            ) {
                                onUpdate?.({ range, rangeCompare })
                            }
                        }}
                        size="sm"
                    >
                        Cập nhật
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

DateRangePicker.displayName = 'DateRangePicker'
