// // import React, { useState } from "react";
// // import {
// //   flexRender,
// //   getCoreRowModel,
// //   getFilteredRowModel,
// //   getPaginationRowModel,
// //   getSortedRowModel,
// //   useReactTable,
// // } from "@tanstack/react-table";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import { TableControls } from "./table-controls.jsx";
// // import { TablePagination } from "./table-pagination.jsx";

// // // Main DataTable Component
// // export const DataTable = ({
// //   data = [],
// //   columns = [],
// //   searchKey = "",
// //   searchPlaceholder = "Search...",
// //   showPagination = true,
// //   showColumnVisibility = true,
// //   showGlobalFilter = true,
// //   showExcelExport = true,
// //   pageSize = 10,
// //   className = "",
// //   tableName = "data",
// // }) => {
// //   const [sorting, setSorting] = useState([]);
// //   const [columnFilters, setColumnFilters] = useState([]);
// //   const [columnVisibility, setColumnVisibility] = useState({});
// //   const [rowSelection, setRowSelection] = useState({});
// //   const [globalFilter, setGlobalFilter] = useState("");

// //   const table = useReactTable({
// //     data,
// //     columns,
// //     onSortingChange: setSorting,
// //     onColumnFiltersChange: setColumnFilters,
// //     getCoreRowModel: getCoreRowModel(),
// //     getPaginationRowModel: getPaginationRowModel(),
// //     getSortedRowModel: getSortedRowModel(),
// //     getFilteredRowModel: getFilteredRowModel(),
// //     onColumnVisibilityChange: setColumnVisibility,
// //     onRowSelectionChange: setRowSelection,
// //     onGlobalFilterChange: setGlobalFilter,
// //     state: {
// //       sorting,
// //       columnFilters,
// //       columnVisibility,
// //       rowSelection,
// //       globalFilter,
// //     },
// //     initialState: {
// //       pagination: {
// //         pageSize,
// //       },
// //     },
// //   });

// //   return (
// //     <div className={`w-full space-y-4 ${className}`}>
// //       {/* Table Controls */}
// //       <TableControls
// //         table={table}
// //         globalFilter={globalFilter}
// //         setGlobalFilter={setGlobalFilter}
// //         searchPlaceholder={searchPlaceholder}
// //         showGlobalFilter={showGlobalFilter}
// //         showColumnVisibility={showColumnVisibility}
// //         showExcelExport={showExcelExport}
// //         data={data}
// //         columns={columns}
// //         tableName={tableName}
// //       />

// //       {/* Table */}
// //       <div className="rounded-md border">
// //         <Table>
// //           <TableHeader>
// //             {table.getHeaderGroups().map((headerGroup) => (
// //               <TableRow key={headerGroup.id}>
// //                 {headerGroup.headers.map((header) => {
// //                   return (
// //                     <TableHead key={header.id} className="font-medium">
// //                       {header.isPlaceholder
// //                         ? null
// //                         : flexRender(
// //                             header.column.columnDef.header,
// //                             header.getContext()
// //                           )}
// //                     </TableHead>
// //                   );
// //                 })}
// //               </TableRow>
// //             ))}
// //           </TableHeader>
// //           <TableBody>
// //             {table.getRowModel().rows?.length ? (
// //               table.getRowModel().rows.map((row) => (
// //                 <TableRow
// //                   key={row.id}
// //                   data-state={row.getIsSelected() && "selected"}
// //                   className="hover:bg-muted/50"
// //                 >
// //                   {row.getVisibleCells().map((cell) => (
// //                     <TableCell key={cell.id}>
// //                       {flexRender(
// //                         cell.column.columnDef.cell,
// //                         cell.getContext()
// //                       )}
// //                     </TableCell>
// //                   ))}
// //                 </TableRow>
// //               ))
// //             ) : (
// //               <TableRow>
// //                 <TableCell
// //                   colSpan={columns.length}
// //                   className="h-24 text-center text-muted-foreground"
// //                 >
// //                   No results found.
// //                 </TableCell>
// //               </TableRow>
// //             )}
// //           </TableBody>
// //         </Table>
// //       </div>

// //       {/* Pagination */}
// //       {showPagination && <TablePagination table={table} />}
// //     </div>
// //   );
// // };

// import React, { useEffect, useState } from "react";
// import {
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { TableControls } from "./table-controls.jsx";
// import { TablePagination } from "./table-pagination.jsx";
// import { useLocation } from "react-router-dom";

// // Main DataTable Component
// export const DataTable = ({
//   data = [],
//   columns = [],
//   searchKey = "",
//   searchPlaceholder = "Search...",
//   showPagination = true,
//   showColumnVisibility = true,
//   showGlobalFilter = true,
//   showExcelExport = true,
//   pageSize = 10,
//   className = "",
//   tableName = "data",
//   filterConfig = [], // New prop for dynamic filters
// }) => {
//   const location = useLocation();
//   const [sorting, setSorting] = useState([]);
//   const [columnFilters, setColumnFilters] = useState([]);
//   const [columnVisibility, setColumnVisibility] = useState({});
//   const [rowSelection, setRowSelection] = useState({});
//   const [globalFilter, setGlobalFilter] = useState("");
//   const [hasAppliedInitialSearch, setHasAppliedInitialSearch] = useState(false);

//   useEffect(() => {
//     if (!hasAppliedInitialSearch && location.state?.initialSearch) {
//       setGlobalFilter(location.state.initialSearch);
//       setHasAppliedInitialSearch(true);

//       // Replace history to remove initialSearch from location.state
//       window.history.replaceState({}, document.title);
//     }
//   }, [location.state, hasAppliedInitialSearch]);


//   const table = useReactTable({
//     data,
//     columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     onGlobalFilterChange: setGlobalFilter,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//       globalFilter,
//     },
//     initialState: {
//       pagination: {
//         pageSize,
//       },
//     },
//   });

//   return (
//     <div className={`w-full space-y-4 ${className}`}>
//       {/* Table Controls */}
//       <TableControls
//         table={table}
//         globalFilter={globalFilter}
//         setGlobalFilter={setGlobalFilter}
//         searchPlaceholder={searchPlaceholder}
//         showGlobalFilter={showGlobalFilter}
//         showColumnVisibility={showColumnVisibility}
//         showExcelExport={showExcelExport}
//         data={data}
//         columns={columns}
//         tableName={tableName}
//         filterConfig={filterConfig} // Pass the filter configuration
//       />

//       {/* Table */}
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => {
//                   return (
//                     <TableHead key={header.id} className="font-medium">
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                     </TableHead>
//                   );
//                 })}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows?.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow
//                   key={row.id}
//                   data-state={row.getIsSelected() && "selected"}
//                   className="hover:bg-muted/50"
//                 >
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className="h-24 text-center text-muted-foreground"
//                 >
//                   No results found.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Pagination */}
//       {showPagination && <TablePagination table={table} />}
//     </div>
//   );
// };
import React, { useEffect, useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableControls } from "./table-controls.jsx";
import { TablePagination } from "./table-pagination.jsx";
import { Checkbox } from "../ui/checkbox.jsx";
import { useLocation } from "react-router-dom";

// Main DataTable Component
export const DataTable = ({
  data = [],
  columns = [],
  searchKey = "",
  searchPlaceholder = "Search...",
  showPagination = true,
  showColumnVisibility = true,
  showGlobalFilter = true,
  showExcelExport = true,
  pageSize = 10,
  className = "",
  tableName = "data",
  filterConfig = [],
  onSelectedRowsChange,
  enableRowSelection = false,
}) => {
  const location = useLocation();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [hasAppliedInitialSearch, setHasAppliedInitialSearch] = useState(false);

  // Generate initial column visibility based on column meta
  const initialColumnVisibility = useMemo(() => {
    const visibility = {};
    columns.forEach((column) => {
      const columnId = column.accessorKey || column.id;
      if (columnId && column.meta && column.meta.hasOwnProperty('defaultVisible')) {
        visibility[columnId] = column.meta.defaultVisible;
      }
    });
    return visibility;
  }, [columns]);

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);

  // Update column visibility when columns change
  useEffect(() => {
    setColumnVisibility(initialColumnVisibility);
  }, [initialColumnVisibility]);

  useEffect(() => {
    if (!hasAppliedInitialSearch && location.state?.initialSearch) {
      setGlobalFilter(location.state.initialSearch);
      setHasAppliedInitialSearch(true);

      // Replace history to remove initialSearch from location.state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, hasAppliedInitialSearch]);

  // ✅ Add Selection Column dynamically
  const selectionColumn = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  };

  const finalColumns = enableRowSelection
    ? [selectionColumn, ...columns]
    : columns;
  const table = useReactTable({
    data,
    columns: finalColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // ✅ Return selected rows to parent when they change
  useEffect(() => {
    if (onSelectedRowsChange) {
      const selectedData = table.getSelectedRowModel().flatRows.map((row) => row.original);
      onSelectedRowsChange(selectedData);
    }
  }, [rowSelection]);

  return (
    <div className={`w-full space-y-4 ${className} bg-background p-4 rounded-lg shadow`}>
      {tableName && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{tableName}</h2>
        </div>
      )}
      {/* Table Controls */}
      <TableControls
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        searchPlaceholder={searchPlaceholder}
        showGlobalFilter={showGlobalFilter}
        showColumnVisibility={showColumnVisibility}
        showExcelExport={showExcelExport}
        data={data}
        columns={columns}
        tableName={tableName}
        filterConfig={filterConfig}
      />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && <TablePagination table={table} />}
    </div>
  );
};