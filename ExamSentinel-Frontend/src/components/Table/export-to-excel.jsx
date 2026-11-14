import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet, ChevronDown } from "lucide-react";
import { exportToExcel } from "./utility/export-excel.js";

const formatColumnName = (name) =>
  name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export const ExcelExport = ({ data, columns, tableName, filteredData }) => {
  const [selectedColumns, setSelectedColumns] = useState(() => {
    // Initialize with all columns selected (except actions)
    const exportableColumns = columns.filter(
      (col) => col.accessorKey && col.id !== "actions"
    );
    return exportableColumns.reduce((acc, col) => {
      acc[col.accessorKey] = true;
      return acc;
    }, {});
  });

  const exportableColumns = columns.filter(
    (col) => col.accessorKey && col.id !== "actions"
  );

  const handleColumnToggle = (columnKey) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const handleExport = (exportType = "filtered") => {
    const selectedColumnKeys = Object.keys(selectedColumns).filter(
      (key) => selectedColumns[key]
    );

    if (selectedColumnKeys.length === 0) {
      alert("Please select at least one column to export");
      return;
    }

    const dataToExport = exportType === "all" ? data : filteredData;

    exportToExcel(
      dataToExport,
      selectedColumnKeys,
      exportableColumns,
      `${tableName}_${exportType}_${new Date().toISOString().split("T")[0]}`
    );
  };

  const selectedCount = Object.values(selectedColumns).filter(Boolean).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
          <Badge variant="secondary" className="ml-1">
            {selectedCount}
          </Badge>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Select Columns to Export</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {exportableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.accessorKey}
            className="capitalize"
            checked={selectedColumns[column.accessorKey] || false}
            onCheckedChange={() => handleColumnToggle(column.accessorKey)}
          >
            {formatColumnName(column.accessorKey || column.accessorKey)}
          </DropdownMenuCheckboxItem>
        ))}

        <DropdownMenuSeparator />

        <div className="px-2 py-1 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => handleExport("filtered")}
            disabled={selectedCount === 0}
          >
            <Download className="h-4 w-4" />
            Export Filtered Data ({filteredData.length} rows)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => handleExport("all")}
            disabled={selectedCount === 0}
          >
            <Download className="h-4 w-4" />
            Export All Data ({data.length} rows)
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
