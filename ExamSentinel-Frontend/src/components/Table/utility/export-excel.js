import * as XLSX from "xlsx";

const formatCellValue = (value) => {
  if (value === null || value === undefined) return "";

  if (value instanceof Date) return value.toISOString().split("T")[0];

  if (typeof value === "object") return String(value);

  return value;
};

const formatColumnHeader = (columnKey) => {
  return columnKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};
export const exportToExcel = (
  data,
  selectedColumns,
  columnDefinitions,
  filename
) => {
  try {
    // Prepare worksheet data
    const headers = selectedColumns.map((colKey) => {
      return (
        columnDefinitions.find((col) => col.accessorKey === colKey)?.header ||
        colKey
      );
    });

    const worksheetData = [
      headers,
      ...data.map((row) =>
        selectedColumns.map((colKey) => formatCellValue(row[colKey]))
      ),
    ];

    // Create worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Write and download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Error exporting to Excel. Please try again.");
  }
};
