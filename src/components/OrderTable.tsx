/**
 * OrderTable Component
 * Renders a responsive, filterable, and sortable table of orders with pagination.
 * - Uses HeroUI Table components
 * - Handles multi-select filters for columns
 * - Enables sorting by column
 * - Designed to be responsive across viewports
 */

"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Button,
} from "@heroui/react";
import { useState, Dispatch, SetStateAction } from "react";
import { Order } from "@/types/orders";
import { FilterState } from "@/types/filters";
import { ChevronRight, ChevronDown } from "lucide-react";

interface OrderTableProps {
  data: Order[];
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  uniqueValues: Record<keyof FilterState, string[]>;
  sortKey: keyof Order | "daysSinceOrder" | "status";
  sortDirection: "asc" | "desc";
  setSortKey: (key: keyof Order | "daysSinceOrder" | "status") => void;
  setActivePresetName: (name: string | null) => void;
  setSortDirection: (dir: "asc" | "desc") => void;
}

//  Constants
const columns: { key: keyof FilterState | "oid" | "days"; label: string }[] = [
  { key: "oid", label: "OID" },
  { key: "status", label: "Status" },
  { key: "type", label: "Type" },
  { key: "lock", label: "Lock" },
  { key: "customer", label: "Customer" },
  { key: "days", label: "Days Since Order" },
  { key: "model", label: "Model" },
  { key: "designer", label: "Designer" },
];

const DAYS_FILTER_OPTIONS = ["<5", "<15", "<30", "<60"];

export default function OrderTable({
  data,
  filters,
  setFilters,
  uniqueValues,
  sortKey,
  sortDirection,
  setSortKey,
  setSortDirection,
  setActivePresetName,
}: OrderTableProps) {
  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const pages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Toggle a single filter option (multi-select behavior)
  const handleToggleOption = (key: keyof FilterState, option: string) => {
    const current = new Set(filters[key] || []);
    current.has(option) ? current.delete(option) : current.add(option);
    setFilters({ ...filters, [key]: Array.from(current) });
    setPage(1);
  };

  // Select all options for a field
  const selectAll = (key: keyof FilterState, options: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: options }));
    setPage(1);
  };

  // Clear all selected filters for a field
  const clearFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: [] }));
    setPage(1);
  };

  // Return options available for filtering by column
  const getOptionsForKey = (key: keyof FilterState | "days"): string[] => {
    if (key === "days") return DAYS_FILTER_OPTIONS;
    return uniqueValues[key as keyof FilterState] || [];
  };

  // Select all filter values across all fields
  const handleAllSelect = () => {
    const newFilters: FilterState = {
      status: [...uniqueValues.status],
      type: [...uniqueValues.type],
      lock: [...uniqueValues.lock],
      customer: [...uniqueValues.customer],
      model: [...uniqueValues.model],
      designer: [...uniqueValues.designer],
      days: [...DAYS_FILTER_OPTIONS],
    };
    setFilters(newFilters);
    setPage(1);
  };

  const completedStatuses = new Set(["Ready for Packaging", "QC", "Delivered"]);

  return (
    <>
      {/* Responsive Table Container */}
      <div className="w-full overflow-x-auto rounded-lg border border-black mt-2">
        <div className="min-w-full md:min-w-[1200px] shadow">
          <Table
            removeWrapper
            isStriped
            aria-label="Order Table with Filters"
            classNames={{
              table: "w-full table-auto",
              th: "bg-white border-b border-black",
            }}
          >
            {/* Table Header with filters and sorting */}
            <TableHeader className="sticky top-0 bg-primary text-white z-10 shadow-sm">
              {columns.map((col) => {
                const sortableKey =
                  col.key === "days" ? "daysSinceOrder" : col.key;
                const isFilterable = col.key !== "oid";

                return (
                  <TableColumn
                    key={col.key}
                    className="align-top min-w-[140px] sm:min-w-[160px] text-xs sm:text-sm"
                  >
                    <div className="flex flex-col gap-1 relative">
                      {/* Sort Button */}
                      <div className="w-full font-bold text-xs sm:text-sm flex justify-between items-center px-2 sm:px-3 py-1 bg-black text-white rounded mt-4">
                        {col.label}
                        <button
                          onClick={() => {
                            const isAlreadySorted = sortKey === sortableKey;
                            if (isAlreadySorted) {
                              setSortDirection(
                                sortDirection === "asc" ? "desc" : "asc"
                              );
                            } else {
                              setSortKey(
                                sortableKey as keyof Order | "daysSinceOrder"
                              );
                              setSortDirection("asc");
                            }
                          }}
                          className="text-xs"
                        >
                          {col.key === sortKey || sortableKey === sortKey
                            ? sortDirection === "asc"
                              ? "▲"
                              : "▼"
                            : "▲"}
                        </button>
                      </div>

                      {/* Filter Dropdown */}
                      <div className="mt-1 bg-white border border-gray-500 rounded shadow p-2 z-10 w-full max-w-[220px] md:max-w-none">
                        {isFilterable ? (
                          <div className="filter-scroll flex flex-col overflow-y-auto max-h-32 min-h-32 pr-1 pt-1 text-sm">
                            {getOptionsForKey(col.key as keyof FilterState).map(
                              (opt) => {
                                const selected =
                                  filters[
                                    col.key as keyof FilterState
                                  ]?.includes(opt);
                                return (
                                  <div
                                    key={opt}
                                    onClick={() =>
                                      handleToggleOption(
                                        col.key as keyof FilterState,
                                        opt
                                      )
                                    }
                                    className={`px-2 py-1 rounded-md border border-gray-500 cursor-pointer ${
                                      selected
                                        ? "bg-gray-300 bg-gray-100 border-gray-500 font-medium"
                                        : "hover:bg-gray-100 border-gray-500"
                                    }`}
                                  >
                                    {opt}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <div className="filter-scroll flex flex-col overflow-y-auto min-h-32 pt-1 text-sm">
                            <div
                              onClick={handleAllSelect}
                              className="text-sm text-gray-600 border rounded px-1 py-1 text-center border-gray-500 cursor-pointer hover:bg-gray-100"
                            >
                              All
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Filter Action Buttons */}
                      {isFilterable ? (
                        <div className="flex justify-between text-xs mb-4">
                          <Button
                            size="sm"
                            variant="light"
                            onPress={() =>
                              selectAll(
                                col.key as keyof FilterState,
                                getOptionsForKey(col.key as keyof FilterState)
                              )
                            }
                          >
                            Select all
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            onPress={() =>
                              clearFilter(col.key as keyof FilterState)
                            }
                          >
                            Clear
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => {
                            setFilters({
                              status: [],
                              type: [],
                              lock: [],
                              customer: [],
                              model: [],
                              designer: [],
                              days: [],
                            });
                            localStorage.removeItem("active-order-preset");
                            setActivePresetName(null);
                          }}
                        >
                          Clear Selection
                        </Button>
                      )}
                    </div>
                  </TableColumn>
                );
              })}
            </TableHeader>

            {/* Table Rows */}
            <TableBody emptyContent="No orders found.">
              {paginatedData.map((order) => {
                const arrowIcon = completedStatuses.has(order.statusLeft) ? (
                  <ChevronRight fill="black" size={24} />
                ) : (
                  <ChevronDown fill="black" size={24} />
                );
                return (
                  <TableRow
                    key={order.oid}
                    className="border-b border-gray-300"
                  >
                    <TableCell>
                      <div className="p-4 bg-gray-100 rounded text-lg font-bold flex items-center justify-between">
                        {order.oid}
                        <span>{arrowIcon}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="p-2 rounded-sm">
                        <div className="grid grid-cols-[80px_1fr_24px] gap-1 items-stretch w-full">
                          <div className="row-span-2 text-xs bg-gray-100 rounded px-2 py-1 flex items-center justify-center text-center">
                            {order.statusLeft}
                          </div>
                          <div className="text-xs bg-gray-100 rounded px-2 py-1">
                            {order.statusLeft}
                          </div>
                          <div className="text-xs bg-gray-100 rounded px-2 py-1 text-center">
                            L
                          </div>
                          <div className="text-xs bg-gray-100 rounded px-2 py-1">
                            {order.statusRight}
                          </div>
                          <div className="text-xs bg-gray-100 rounded px-2 py-1 text-center">
                            R
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="bg-gray-100 p-4 rounded">
                        {order.type}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="bg-gray-100 p-4 rounded">
                        {order.lock || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="bg-gray-100 p-4 rounded">
                        {order.customer}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="bg-gray-100 p-4 rounded">
                        {order.daysSinceOrder}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="bg-gray-100 p-4 rounded">
                        {order.model}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="bg-gray-100 p-4 rounded">
                        {order.designer}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={(page) => setPage(page)}
        />
      </div>
    </>
  );
}
