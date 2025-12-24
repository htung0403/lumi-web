import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface SkeletonTableProps {
    columns: number
    rows?: number
}

export function SkeletonTable({ columns, rows = 10 }: SkeletonTableProps) {
    return (
        <div className="rounded-md border animate-pulse">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        {Array.from({ length: columns }).map((_, i) => (
                            <TableHead key={i} className="h-10">
                                <Skeleton className="h-4 w-full opacity-50" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRow key={i}>
                            {Array.from({ length: columns }).map((_, j) => (
                                <TableCell key={j} className="py-3">
                                    <Skeleton className="h-4 w-full opacity-20" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
