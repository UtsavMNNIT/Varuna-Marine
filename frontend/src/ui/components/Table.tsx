// src/ui/components/Table.tsx
import React from "react";

export type Column<T> = {
  key: keyof T;
  header: string;
  className?: string;
  render?: (value: T[keyof T], row: T, rowIndex: number) => React.ReactNode;
};

export type TableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  getRowKey?: (row: T, index: number) => React.Key;
  emptyText?: string;
  className?: string;
};

function Table<T extends Record<string, unknown>>({
  columns,
  data,
  getRowKey = (_row, i) => i,
  emptyText = "No data",
  className = "",
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`text-left px-3 py-2 border-b ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                className="px-3 py-3 text-center text-sm text-gray-500"
                colSpan={columns.length}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={getRowKey(row, rowIndex)} className="hover:bg-gray-50">
                {columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <td
                      key={String(col.key)}
                      className={`px-3 py-2 border-b ${col.className ?? ""}`}
                    >
                      {col.render ? col.render(value, row, rowIndex) : (value as React.ReactNode)}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export { Table };        // <-- named export for `import { Table } from '...';`
export default Table;    // <-- default export for `import Table from '...';`
