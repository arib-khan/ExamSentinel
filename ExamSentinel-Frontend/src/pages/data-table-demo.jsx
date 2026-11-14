import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "../components/Table/data-table";
import {
  taskColumns,
  userColumns,
  sampleTaskData,
  sampleUserData,
} from "../components/Table/column-defination.jsx";

// Main Demo Component
export default function DataTableDemo() {
  const [activeTable, setActiveTable] = useState("tasks");

  return (
    <div className="container mx-auto py-10">
      {/* Table Switcher */}
      <div className="flex space-x-2 mb-6">
        <Button
          variant={activeTable === "tasks" ? "default" : "outline"}
          onClick={() => setActiveTable("tasks")}
        >
          Tasks Table ({sampleTaskData.length} items)
        </Button>
        <Button
          variant={activeTable === "users" ? "default" : "outline"}
          onClick={() => setActiveTable("users")}
        >
          Users Table ({sampleUserData.length} items)
        </Button>
      </div>

      {/* Render Tables */}
      {activeTable === "tasks" ? (
        <DataTable
          data={sampleTaskData}
          columns={taskColumns}
          searchPlaceholder="Search tasks..."
          tableName="tasks"
          showExcelExport={true}
        />
      ) : (
        <DataTable
          data={sampleUserData}
          columns={userColumns}
          searchPlaceholder="Search users..."
          tableName="users"
          showExcelExport={true}
        />
      )}

      {/* Usage Instructions */}
      {/*            <div className="mt-8 p-6 bg-card border rounded-lg">*/}
      {/*                <h3 className="text-lg font-semibold mb-4">📚 How to Use</h3>*/}
      {/*                <div className="grid md:grid-cols-2 gap-6">*/}
      {/*                    <div>*/}
      {/*                        <h4 className="font-medium mb-2">File Structure:</h4>*/}
      {/*                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">*/}
      {/*{`components/*/}
      {/*├── DataTable.js          // Main table component*/}
      {/*├── TableControls.js      // Search, filters, export*/}
      {/*├── TablePagination.js    // Pagination controls*/}
      {/*├── ExcelExport.js        // Export dropdown*/}
      {/*├── TableUIComponents.js  // Reusable UI elements*/}
      {/*├── columnDefinitions.js  // Column configs & data*/}
      {/*├── excelUtils.js         // Export utilities*/}
      {/*└── DataTableDemo.js      // Demo component`}*/}
      {/*                        </pre>*/}
      {/*                    </div>*/}
      {/*                    <div>*/}
      {/*                        <h4 className="font-medium mb-2">Excel Export Features:</h4>*/}
      {/*                        <ul className="text-sm space-y-2 text-muted-foreground">*/}
      {/*                            <li>• Select specific columns to export</li>*/}
      {/*                            <li>• Export filtered data or all data</li>*/}
      {/*                            <li>• Automatic filename with date</li>*/}
      {/*                            <li>• CSV format for maximum compatibility</li>*/}
      {/*                            <li>• Proper escaping of special characters</li>*/}
      {/*                            <li>• Column headers are auto-formatted</li>*/}
      {/*                        </ul>*/}
      {/*                    </div>*/}
      {/*                </div>*/}
      {/*            </div>*/}
    </div>
  );
}
