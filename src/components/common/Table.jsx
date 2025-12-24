import React from "react";
import clsx from "clsx";

const Table = ({
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
}) => {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-dark-50 border-b border-dark-200">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="animate-pulse">
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-dark-200 rounded w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-dark-500">{emptyMessage}</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-dark-50 border-b border-dark-200">
            {columns.map((column, index) => (
              <th
                key={index}
                className={clsx(
                  "px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider",
                  column.headerClassName
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-dark-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-dark-50 transition-colors">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={clsx(
                    "px-6 py-4 text-sm text-dark-900",
                    column.cellClassName
                  )}
                >
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
