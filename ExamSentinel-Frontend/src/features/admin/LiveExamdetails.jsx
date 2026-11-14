import React, { useState, useEffect, useMemo } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    ChevronDown,
    ChevronUp,
    Eye,
    Search,
    Download,
    RefreshCw,
    Moon,
    Sun,
    AlertTriangle,
    Users,
    Clock,
    Activity,
    MoreHorizontal,
    FileText,
    Camera,
    Shield,
    Wifi,
    WifiOff,
} from 'lucide-react'

// Mock API functions
const mockApi = {
    async fetchStudents() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        return Array.from({ length: 50 }, (_, i) => ({
            id: `CAND-${i + 1000}`,
            name: `Student ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
            rollNumber: `RN20250828${i + 1}`,
            examName: ['Mathematics Final', 'Physics Midterm', 'Chemistry Quiz', 'Biology Test'][i % 4],
            status: ['Active', 'Disconnected', 'Suspicious', 'Completed'][Math.floor(Math.random() * 4)],
            ipAddress: `192.168.${Math.floor(i / 10) + 1}.${(i % 10) + 100}`,
            currentQuestion: Math.floor(Math.random() * 50) + 1,
            totalQuestions: 50,
            timeLeft: Math.max(0, 120 - (i * 2)), // minutes
            startTime: new Date(Date.now() - (i * 60000)).toISOString(),
            lastActivity: new Date(Date.now() - Math.random() * 300000).toISOString(),
            alerts: generateAlerts(i),
            tabSwitches: Math.floor(Math.random() * 5),
            cameraStatus: Math.random() > 0.3 ? 'Active' : 'Disabled',
            microphoneStatus: Math.random() > 0.4 ? 'Active' : 'Disabled',
            screenShare: Math.random() > 0.8 ? 'Detected' : 'Clean',
        }))
    }
}

function generateAlerts(index) {
    const alerts = []
    if (index % 5 === 0) alerts.push({ type: 'warning', message: 'Multiple tab switches detected' })
    if (index % 7 === 0) alerts.push({ type: 'error', message: 'Camera disconnected' })
    if (index % 11 === 0) alerts.push({ type: 'info', message: 'Unusual mouse activity' })
    return alerts
}

// Export to Excel function
const exportToExcel = (data) => {
    const headers = [
        'ID', 'Name', 'Roll Number', 'Exam', 'Status', 'IP Address',
        'Current Question', 'Time Left', 'Tab Switches',
        'Camera Status', 'Microphone Status', 'Last Activity'
    ]

    const csvContent = [
        headers.join(','),
        ...data.map(row => [
            row.id,
            row.name,
            row.rollNumber,
            row.examName,
            row.status,
            row.ipAddress,
            `${row.currentQuestion}/${row.totalQuestions}`,
            `${row.timeLeft} min`,
            row.tabSwitches,
            row.cameraStatus,
            row.microphoneStatus,
            new Date(row.lastActivity).toLocaleString()
        ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exam-monitoring-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
}

const StatusBadge = ({ status }) => {
    const variants = {
        Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        Disconnected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        Suspicious: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }

    return <Badge className={variants[status]}>{status}</Badge>
}

const AlertIcon = ({ alerts }) => {
    if (!alerts.length) return null

    const hasError = alerts.some(alert => alert.type === 'error')
    const hasWarning = alerts.some(alert => alert.type === 'warning')

    return (
        <AlertTriangle
            className={`h-4 w-4 ${hasError ? 'text-red-500' : hasWarning ? 'text-yellow-500' : 'text-blue-500'
                }`}
        />
    )
}

const StudentDetailsModal = ({ student, isOpen, onClose }) => {
    if (!student) return null

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        {student.name} - Exam Details
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <strong>Roll Number:</strong> {student.rollNumber}
                                </div>
                                <div>
                                    <strong>Exam:</strong> {student.examName}
                                </div>
                                <div>
                                    <strong>Status:</strong> <StatusBadge status={student.status} />
                                </div>
                                <div>
                                    <strong>IP Address:</strong> {student.ipAddress}
                                </div>
                                <div>
                                    <strong>Attempt Question:</strong> {student.currentQuestion}/{student.totalQuestions}
                                </div>
                                <div>
                                    <strong>Time Left:</strong> {student.timeLeft} minutes
                                </div>

                                <div>
                                    <strong>Tab Switches:</strong> {student.tabSwitches}
                                </div>
                            </div>


                            {student.alerts.length > 0 && (
                                <div className="pt-4 border-t">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Active Alerts
                                    </h4>
                                    <div className="space-y-2">
                                        {student.alerts.map((alert, index) => (
                                            <div
                                                key={index}
                                                className={`p-2 rounded text-sm ${alert.type === 'error' ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300' :
                                                    alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300' :
                                                        'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                                    }`}
                                            >
                                                {alert.message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t text-xs text-gray-500">
                                <div>Start Time: {new Date(student.startTime).toLocaleString()}</div>
                                <div>Last Activity: {new Date(student.lastActivity).toLocaleString()}</div>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                    <AlertDialogAction>Take Action</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default function LiveExamMonitorData() {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [globalFilter, setGlobalFilter] = useState('')
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [autoRefresh, setAutoRefresh] = useState(true)

    // Fetch data
    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await mockApi.fetchStudents()
            setStudents(data)
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Auto refresh every 30 seconds
    useEffect(() => {
        if (!autoRefresh) return

        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [autoRefresh])


    const columnHelper = createColumnHelper()

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Student Name',
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{row.original.name}</span>
                        <AlertIcon alerts={row.original.alerts} />
                    </div>
                ),
            }),
            columnHelper.accessor('rollNumber', {
                header: 'Roll Number',
                cell: ({ getValue }) => (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getValue()}
                    </span>
                ),
            }),
            columnHelper.accessor('examName', {
                header: 'Exam Name',
                cell: ({ getValue }) => (
                    <span className="text-sm font-medium">{getValue()}</span>
                ),
            }),

            columnHelper.accessor('currentQuestion', {
                header: 'Attempt Question',
                cell: ({ row }) => (
                    <div className="text-sm">
                        <div className="font-medium">
                            {row.original.currentQuestion}/{row.original.totalQuestions}
                        </div>

                    </div>
                ),
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: ({ getValue }) => <StatusBadge status={getValue()} />,
            }),
            columnHelper.accessor('timeLeft', {
                header: 'Time Left',
                cell: ({ getValue }) => (
                    <div className={`text-sm font-medium ${getValue() < 10 ? 'text-red-600' : getValue() < 30 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                        {getValue()}m
                    </div>
                ),
            }),

            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedStudent(row.original)
                                    setDetailsOpen(true)
                                }}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            }),
        ],
        []
    )

    const table = useReactTable({
        data: students,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: 'includesString',
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    })

    // Statistics
    const stats = useMemo(() => {
        const total = students.length
        const active = students.filter(s => s.status === 'Active').length
        const suspicious = students.filter(s => s.alerts.length > 0).length

        return { total, active, suspicious }
    }, [students])

    return (
        <div className="min-h-screen transition-colors ">
            <div className="container mx-auto  space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Live Exam Monitor
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Real-time monitoring of active examinations
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={autoRefresh ? 'text-green-600' : ''}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Alerts</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.suspicious}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Controls */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search students..."
                                        value={globalFilter ?? ''}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={fetchData}
                                    disabled={loading}
                                    size="sm"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => exportToExcel(students)}
                                    size="sm"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Excel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead
                                                    key={header.id}
                                                    className="cursor-pointer select-none"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                        {{
                                                            asc: <ChevronUp className="h-4 w-4" />,
                                                            desc: <ChevronDown className="h-4 w-4" />,
                                                        }[header.column.getIsSorted()] ?? null}
                                                    </div>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                <div className="flex items-center justify-center">
                                                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                                                    Loading students...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No students found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>
                                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                                    {table.getPageCount()}
                                </span>
                                <span>•</span>
                                <span>
                                    {table.getFilteredRowModel().rows.length} student(s)
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Student Details Modal */}
                <StudentDetailsModal
                    student={selectedStudent}
                    isOpen={detailsOpen}
                    onClose={() => setDetailsOpen(false)}
                />
            </div>
        </div>
    )
}