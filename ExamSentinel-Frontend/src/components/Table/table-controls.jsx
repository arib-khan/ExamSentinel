// // import React from "react";
// // import {
// //   DropdownMenu,
// //   DropdownMenuCheckboxItem,
// //   DropdownMenuContent,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { ChevronDown, Search, Settings2 } from "lucide-react";
// // import { ExcelExport } from "./export-to-excel.jsx";

// // export const TableControls = ({
// //   table,
// //   globalFilter,
// //   setGlobalFilter,
// //   searchPlaceholder,
// //   showGlobalFilter,
// //   showColumnVisibility,
// //   showExcelExport,
// //   data,
// //   columns,
// //   tableName,
// // }) => {
// //   return (
// //     <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
// //       {/* Left side: Search Input */}
// //       <div className="flex flex-col md:flex-1 md:flex-row md:items-center md:space-x-2">
// //         {showGlobalFilter && (
// //           <div className="relative max-w-full md:max-w-sm">
// //             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
// //             <Input
// //               placeholder={searchPlaceholder}
// //               value={globalFilter ?? ""}
// //               onChange={(event) => setGlobalFilter(event.target.value)}
// //               className="pl-8 w-full"
// //             />
// //           </div>
// //         )}
// //       </div>

// //       {/* Right side: Buttons */}
// //       <div className="flex flex-wrap items-center gap-2 md:justify-end">
// //         {showExcelExport && (
// //           <ExcelExport
// //             data={data}
// //             columns={columns}
// //             tableName={tableName}
// //             filteredData={table
// //               .getFilteredRowModel()
// //               .rows.map((row) => row.original)}
// //           />
// //         )}

// //         {showColumnVisibility && (
// //           <DropdownMenu>
// //             <DropdownMenuTrigger asChild>
// //               <Button variant="outline" className="flex items-center">
// //                 <Settings2 className="mr-2 h-4 w-4" />
// //                 View
// //                 <ChevronDown className="ml-2 h-4 w-4" />
// //               </Button>
// //             </DropdownMenuTrigger>
// //             <DropdownMenuContent align="end" className="w-[150px]">
// //               {table
// //                 .getAllColumns()
// //                 .filter((column) => column.getCanHide())
// //                 .map((column) => (
// //                   <DropdownMenuCheckboxItem
// //                     key={column.id}
// //                     className="capitalize"
// //                     checked={column.getIsVisible()}
// //                     onCheckedChange={(value) =>
// //                       column.toggleVisibility(!!value)
// //                     }
// //                   >
// //                     {typeof column.columnDef.header === "string"
// //                       ? column.columnDef.header
// //                       : column.id
// //                           .replace(/_/g, " ")
// //                           .replace(
// //                             /\w\S*/g,
// //                             (w) => w.charAt(0).toUpperCase() + w.slice(1)
// //                           )}
// //                   </DropdownMenuCheckboxItem>
// //                 ))}
// //             </DropdownMenuContent>
// //           </DropdownMenu>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // import React, { useState } from "react";
// // import {
// //   DropdownMenu,
// //   DropdownMenuCheckboxItem,
// //   DropdownMenuContent,
// //   DropdownMenuTrigger,
// //   DropdownMenuLabel,
// // } from "@/components/ui/dropdown-menu";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { ChevronDown, Search, Settings2, Filter } from "lucide-react";
// // import { ExcelExport } from "./export-to-excel.jsx";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// // export const TableControls = ({
// //   table,
// //   globalFilter,
// //   setGlobalFilter,
// //   searchPlaceholder,
// //   showGlobalFilter,
// //   showColumnVisibility,
// //   showExcelExport,
// //   data,
// //   columns,
// //   tableName,
// // }) => {
// //   const [filters, setFilters] = useState({
// //     DifficultyLevel: "",
// //     Language: "",
// //   });

// //   // Update column filter when dropdown changes
// //   const handleFilterChange = (columnId, value) => {
// //     setFilters((prev) => ({ ...prev, [columnId]: value }));
// //     const column = table.getColumn(columnId);
// //     if (column) column.setFilterValue(value || undefined);
// //   };

// //   return (
// //     <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
// //       {/* Left side: Search Input */}
// //       <div className="flex flex-col md:flex-1 md:flex-row md:items-center md:space-x-2">
// //         {showGlobalFilter && (
// //           <div className="relative max-w-full md:max-w-sm">
// //             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
// //             <Input
// //               placeholder={searchPlaceholder}
// //               value={globalFilter ?? ""}
// //               onChange={(event) => setGlobalFilter(event.target.value)}
// //               className="pl-8 w-full"
// //             />
// //           </div>
// //         )}

// //         {/* Filter Dropdown Icon */}
// //         <DropdownMenu>
// //           <DropdownMenuTrigger asChild>
// //             <Button variant="outline" className="ml-2 flex items-center">
// //               <Filter className="h-4 w-4 mr-1" />
// //               Filter
// //             </Button>
// //           </DropdownMenuTrigger>
// //           <DropdownMenuContent className="space-y-2 p-3 w-64">
// //             <DropdownMenuLabel className="text-sm font-semibold text-muted-foreground">
// //               Filter Questions
// //             </DropdownMenuLabel>

// //             {/* Filter: Difficulty Level */}
// //             <Select
// //               value={filters.DifficultyLevel}
// //               onValueChange={(value) => handleFilterChange("DifficultyLevel", value)}
// //             >
// //               <SelectTrigger className="w-full">
// //                 <SelectValue placeholder="Difficulty Level" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 <SelectItem value=" ">All</SelectItem>
// //                 <SelectItem value="Easy">Easy</SelectItem>
// //                 <SelectItem value="Medium">Medium</SelectItem>
// //                 <SelectItem value="Hard">Hard</SelectItem>
// //               </SelectContent>
// //             </Select>

// //             {/* Filter: Language */}
// //             <Select
// //               value={filters.Language}
// //               onValueChange={(value) => handleFilterChange("Language", value)}
// //             >
// //               <SelectTrigger className="w-full">
// //                 <SelectValue placeholder="Language" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 <SelectItem value=" ">All</SelectItem>
// //                 <SelectItem value="English">English</SelectItem>
// //                 <SelectItem value="Hindi">Hindi</SelectItem>
// //               </SelectContent>
// //             </Select>
// //           </DropdownMenuContent>
// //         </DropdownMenu>
// //       </div>

// //       {/* Right side: Buttons */}
// //       <div className="flex flex-wrap items-center gap-2 md:justify-end">
// //         {showExcelExport && (
// //           <ExcelExport
// //             data={data}
// //             columns={columns}
// //             tableName={tableName}
// //             filteredData={table
// //               .getFilteredRowModel()
// //               .rows.map((row) => row.original)}
// //           />
// //         )}

// //         {showColumnVisibility && (
// //           <DropdownMenu>
// //             <DropdownMenuTrigger asChild>
// //               <Button variant="outline" className="flex items-center">
// //                 <Settings2 className="mr-2 h-4 w-4" />
// //                 View
// //                 <ChevronDown className="ml-2 h-4 w-4" />
// //               </Button>
// //             </DropdownMenuTrigger>
// //             <DropdownMenuContent align="end" className="w-[150px]">
// //               {table
// //                 .getAllColumns()
// //                 .filter((column) => column.getCanHide())
// //                 .map((column) => (
// //                   <DropdownMenuCheckboxItem
// //                     key={column.id}
// //                     className="capitalize"
// //                     checked={column.getIsVisible()}
// //                     onCheckedChange={(value) =>
// //                       column.toggleVisibility(!!value)
// //                     }
// //                   >
// //                     {typeof column.columnDef.header === "string"
// //                       ? column.columnDef.header
// //                       : column.id
// //                         .replace(/_/g, " ")
// //                         .replace(
// //                           /\w\S*/g,
// //                           (w) => w.charAt(0).toUpperCase() + w.slice(1)
// //                         )}
// //                   </DropdownMenuCheckboxItem>
// //                 ))}
// //             </DropdownMenuContent>
// //           </DropdownMenu>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };


// import React, { useState, useMemo } from "react";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
//   DropdownMenuLabel,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ChevronDown, Search, Settings2, Filter } from "lucide-react";
// import { ExcelExport } from "./export-to-excel.jsx";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// export const TableControls = ({
//   table,
//   globalFilter,
//   setGlobalFilter,
//   searchPlaceholder,
//   showGlobalFilter,
//   showColumnVisibility,
//   showExcelExport,
//   data,
//   columns,
//   tableName,
//   filterConfig = [], // New prop for dynamic filter configuration
// }) => {
//   const [filters, setFilters] = useState({});

//   // Generate dynamic filter options based on data and filterConfig
//   const filterOptions = useMemo(() => {
//     if (!data || !filterConfig.length) return {};

//     const options = {};

//     filterConfig.forEach(config => {
//       const { key, label, type = 'select' } = config;

//       if (type === 'select') {
//         // Extract unique values for this column
//         const uniqueValues = [...new Set(
//           data
//             .map(item => item[key])
//             .filter(value => value !== null && value !== undefined && value !== '')
//         )].sort();

//         options[key] = {
//           label,
//           type,
//           values: uniqueValues
//         };
//       }
//     });

//     return options;
//   }, [data, filterConfig]);

//   // Update column filter when dropdown changes
//   const handleFilterChange = (columnId, value) => {
//     setFilters((prev) => ({ ...prev, [columnId]: value }));
//     const column = table.getColumn(columnId);
//     if (column) {
//       column.setFilterValue(value === "all" || value === "" ? undefined : value);
//     }
//   };

//   // Clear all filters
//   const clearAllFilters = () => {
//     setFilters({});
//     filterConfig.forEach(config => {
//       const column = table.getColumn(config.key);
//       if (column) column.setFilterValue(undefined);
//     });
//   };

//   // Check if any filters are active
//   const hasActiveFilters = Object.values(filters).some(value => value && value !== "all");

//   return (
//     <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//       {/* Left side: Search Input */}
//       <div className="flex flex-col md:flex-1 md:flex-row md:items-center md:space-x-2">
//         {showGlobalFilter && (
//           <div className="relative max-w-full md:max-w-sm mb-1">
//             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder={searchPlaceholder}
//               value={globalFilter ?? ""}
//               onChange={(event) => setGlobalFilter(event.target.value)}
//               className="pl-8 w-full"
//             />
//           </div>
//         )}

//         {/* Dynamic Filter Dropdown */}
//         {filterConfig.length > 0 && (
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" className="ml-2 flex items-center relative">
//                 <Filter className="h-4 w-4 mr-1" />
//                 Filter
//                 {hasActiveFilters && (
//                   <span className="ml-1 h-2 w-2 bg-blue-500 rounded-full"></span>
//                 )}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="space-y-2 p-3 w-64">
//               <div className="flex items-center justify-between mb-2">
//                 <DropdownMenuLabel className="text-sm font-semibold text-muted-foreground p-0">
//                   Filter Options
//                 </DropdownMenuLabel>
//                 {hasActiveFilters && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={clearAllFilters}
//                     className="h-6 px-2 text-xs"
//                   >
//                     Clear All
//                   </Button>
//                 )}
//               </div>

//               {/* Dynamic Filter Controls */}
//               {filterConfig.map((config) => {
//                 const options = filterOptions[config.key];
//                 if (!options || !options.values.length) return null;

//                 return (
//                   <div key={config.key} className="space-y-1">
//                     <label className="text-xs text-muted-foreground">
//                       {options.label}
//                     </label>
//                     <Select
//                       value={filters[config.key] || ""}
//                       onValueChange={(value) => handleFilterChange(config.key, value)}
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder={`Select ${options.label}`} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">All</SelectItem>
//                         {options.values.map((value) => (
//                           <SelectItem key={value} value={value}>
//                             {value}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 );
//               })}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         )}
//       </div>

//       {/* Right side: Buttons */}
//       <div className="flex flex-wrap items-center gap-2 md:justify-end">
//         {showExcelExport && (
//           <ExcelExport
//             data={data}
//             columns={columns}
//             tableName={tableName}
//             filteredData={table
//               .getFilteredRowModel()
//               .rows.map((row) => row.original)}
//           />
//         )}

//         {showColumnVisibility && (
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" className="flex items-center">
//                 <Settings2 className="mr-2 h-4 w-4" />
//                 View
//                 <ChevronDown className="ml-2 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end"
//               className="w-[200px] max-h-60 overflow-auto"
//             >
//               {table
//                 .getAllColumns()
//                 .filter((column) => column.getCanHide())
//                 .map((column) => (
//                   <DropdownMenuCheckboxItem
//                     key={column.id}
//                     className="capitalize"
//                     checked={column.getIsVisible()}
//                     onCheckedChange={(value) =>
//                       column.toggleVisibility(!!value)
//                     }
//                   >
//                     {typeof column.columnDef.header === "string"
//                       ? column.columnDef.header
//                       : column.id
//                         .replace(/_/g, " ")
//                         .replace(
//                           /\w\S*/g,
//                           (w) => w.charAt(0).toUpperCase() + w.slice(1)
//                         )}
//                   </DropdownMenuCheckboxItem>
//                 ))}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         )}
//       </div>
//     </div>
//   );
// };


import React, { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, Settings2, Filter, Eye, EyeOff } from "lucide-react";
import { ExcelExport } from "./export-to-excel.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const TableControls = ({
  table,
  globalFilter,
  setGlobalFilter,
  searchPlaceholder,
  showGlobalFilter,
  showColumnVisibility,
  showExcelExport,
  data,
  columns,
  tableName,
  filterConfig = [],
}) => {
  const [filters, setFilters] = useState({});

  // Generate dynamic filter options based on data and filterConfig
  const filterOptions = useMemo(() => {
    if (!data || !filterConfig.length) return {};

    const options = {};

    filterConfig.forEach(config => {
      const { key, label, type = 'select' } = config;

      if (type === 'select') {
        // Extract unique values for this column
        const uniqueValues = [...new Set(
          data
            .map(item => item[key])
            .filter(value => value !== null && value !== undefined && value !== '')
        )].sort();

        options[key] = {
          label,
          type,
          values: uniqueValues
        };
      }
    });

    return options;
  }, [data, filterConfig]);

  // Update column filter when dropdown changes
  const handleFilterChange = (columnId, value) => {
    setFilters((prev) => ({ ...prev, [columnId]: value }));
    const column = table.getColumn(columnId);
    if (column) {
      column.setFilterValue(value === "all" || value === "" ? undefined : value);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
    filterConfig.forEach(config => {
      const column = table.getColumn(config.key);
      if (column) column.setFilterValue(undefined);
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value && value !== "all");

  // Get column display name
  const getColumnDisplayName = (column) => {
    // First check if there's a meta.displayName
    if (column.columnDef.meta?.displayName) {
      return column.columnDef.meta.displayName;
    }

    // Then check if header is a string
    if (typeof column.columnDef.header === "string") {
      return column.columnDef.header;
    }

    // Fall back to formatted column ID
    return column.id
      .replace(/_/g, " ")
      .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
  };

  // Reset columns to default visibility
  const resetToDefaults = () => {
    const defaultVisibility = {};
    columns.forEach((column) => {
      const columnId = column.accessorKey || column.id;
      if (columnId && column.meta && column.meta.hasOwnProperty('defaultVisible')) {
        defaultVisibility[columnId] = column.meta.defaultVisible;
      }
    });

    // Apply default visibility to all columns
    Object.keys(defaultVisibility).forEach(columnId => {
      const column = table.getColumn(columnId);
      if (column) {
        column.toggleVisibility(defaultVisibility[columnId]);
      }
    });
  };

  // Show all columns
  const showAllColumns = () => {
    table.getAllColumns()
      .filter((column) => column.getCanHide())
      .forEach((column) => {
        column.toggleVisibility(true);
      });
  };

  // Hide all columns (except those that can't be hidden)
  const hideAllColumns = () => {
    table.getAllColumns()
      .filter((column) => column.getCanHide())
      .forEach((column) => {
        column.toggleVisibility(false);
      });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Left side: Search Input */}
      <div className="flex flex-col md:flex-1 md:flex-row md:items-center md:space-x-2">
        {showGlobalFilter && (
          <div className="relative max-w-full md:max-w-sm mb-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 w-full"
            />
          </div>
        )}

        {/* Dynamic Filter Dropdown */}
        {filterConfig.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2 flex items-center relative">
                <Filter className="h-4 w-4 mr-1" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-1 h-2 w-2 bg-blue-500 rounded-full"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-2 p-3 w-64">
              <div className="flex items-center justify-between mb-2">
                <DropdownMenuLabel className="text-sm font-semibold text-muted-foreground p-0">
                  Filter Options
                </DropdownMenuLabel>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Dynamic Filter Controls */}
              {filterConfig.map((config) => {
                const options = filterOptions[config.key];
                if (!options || !options.values.length) return null;

                return (
                  <div key={config.key} className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      {options.label}
                    </label>
                    <Select
                      value={filters[config.key] || ""}
                      onValueChange={(value) => handleFilterChange(config.key, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select ${options.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {options.values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Right side: Buttons */}
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        {showExcelExport && (
          <ExcelExport
            data={data}
            columns={columns}
            tableName={tableName}
            filteredData={table
              .getFilteredRowModel()
              .rows.map((row) => row.original)}
          />
        )}

        {showColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[250px] max-h-80 overflow-auto">
              <DropdownMenuLabel className="font-semibold">
                Column Visibility
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Quick Actions */}
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded-sm mb-2">
                <span className="text-xs text-muted-foreground">Quick Actions:</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetToDefaults}
                    className="h-6 px-2 text-xs"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={showAllColumns}
                    className="h-6 px-2 text-xs"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={hideAllColumns}
                    className="h-6 px-2 text-xs"
                  >
                    <EyeOff className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Column Checkboxes */}
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    <span className="flex items-center justify-between w-full">
                      {getColumnDisplayName(column)}
                      {column.columnDef.meta?.defaultVisible && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded ml-2">
                          Default
                        </span>
                      )}
                    </span>
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};