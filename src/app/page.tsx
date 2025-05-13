/**
 * HomePage (page.tsx)
 * Main entry for the Order Overview Dashboard.
 */

"use client";

import { useState, useMemo, useEffect } from "react";
import orders from "@/data/orders.json";
import { Order } from "@/types/orders";
import OrderTable from "@/components/OrderTable";
import { FilterState, Preset } from "@/types/filters";
import PresetManager from "@/components/PresetManager";
import { Spinner } from "@heroui/react";

export type SortableOrderKeys = keyof Order | "daysSinceOrder" | "status";

const defaultFilterState: FilterState = {
  status: [],
  type: [],
  lock: [],
  customer: [],
  model: [],
  designer: [],
  days: [],
};

export default function HomePage() {
  const allOrders = orders as Order[];

  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilterState,
  });
  const [sortKey, setSortKey] = useState<SortableOrderKeys>("oid");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activePresetName, setActivePresetName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved preset or fallback to previous session
  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem("order-presets");
      const activeName = localStorage.getItem("active-order-preset");

      if (savedPresets && activeName) {
        const all: Preset[] = JSON.parse(savedPresets);
        const active = all.find((p) => p.name === activeName);
        if (active) {
          setFilters(active.filters);
          setSortKey(active.sortKey);
          setSortDirection(active.sortDirection);
          setActivePresetName(active.name);
          setLoading(false);
          return;
        }
      }

      const raw = localStorage.getItem("order-filters");
      const key = localStorage.getItem("order-sortKey") as SortableOrderKeys;
      const dir = localStorage.getItem("order-sortDirection") as "asc" | "desc";

      const validKeys: SortableOrderKeys[] = [
        "oid",
        "daysSinceOrder",
        "status",
        ...(Object.keys(allOrders[0]).filter(
          (k) => typeof allOrders[0][k as keyof Order] === "string"
        ) as SortableOrderKeys[]),
      ];

      if (raw) setFilters(JSON.parse(raw));
      if (validKeys.includes(key)) setSortKey(key);
      if (["asc", "desc"].includes(dir)) setSortDirection(dir);
    } catch (err) {
      console.warn("Failed to load saved filters or presets", err);
    }
    setLoading(false);
  }, [allOrders]);

  // Save current filters and sort state
  useEffect(() => {
    localStorage.setItem("order-filters", JSON.stringify(filters));
    localStorage.setItem("order-sortKey", sortKey);
    localStorage.setItem("order-sortDirection", sortDirection);
  }, [filters, sortKey, sortDirection]);

  // Extract all unique values for filters
  const uniqueValues = useMemo(() => {
    const getUnique = (key: keyof Order) =>
      Array.from(new Set(allOrders.map((o) => o[key]))).filter(
        Boolean
      ) as string[];

    const allStatuses = Array.from(
      new Set(allOrders.flatMap((o) => [o.statusLeft, o.statusRight]))
    );

    return {
      OID: [],
      days: [],
      status: allStatuses,
      type: getUnique("type"),
      lock: getUnique("lock"),
      customer: getUnique("customer"),
      model: getUnique("model"),
      designer: getUnique("designer"),
    };
  }, [allOrders]);

  const matchDays = (value: number, filters: string[]) => {
    if (filters.length === 0) return true;
    return filters.some((f) => {
      const threshold = parseInt(f.replace("<", ""), 10);
      return value < threshold;
    });
  };

  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      return Object.entries(filters).every(([key, selected]) => {
        if (!selected || selected.length === 0) return true;
        if (key === "days") return matchDays(order.daysSinceOrder, selected);
        if (key === "status") {
          return (
            selected.includes(order.statusLeft) ||
            selected.includes(order.statusRight)
          );
        }
        return selected.includes(order[key as keyof Order] as string);
      });
    });
  }, [filters, allOrders]);

  const sortedAndFilteredOrders = useMemo(() => {
    const statusPriority = [
      "Open Order",
      "Printing",
      "Drying",
      "QC",
      "Ready for Packaging",
      "Delivered",
    ];

    return [...filteredOrders].sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      if (sortKey === "daysSinceOrder") {
        aValue = a.daysSinceOrder;
        bValue = b.daysSinceOrder;
      } else if (sortKey === "status") {
        aValue = statusPriority.indexOf(a.statusLeft);
        bValue = statusPriority.indexOf(b.statusLeft);
      } else {
        aValue = a[sortKey];
        bValue = b[sortKey];
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredOrders, sortKey, sortDirection]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" color="primary" variant="wave" />
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 xl:p-8 bg-white dark:bg-gray-950">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        📦 Order Overview Dashboard
      </h1>

      <div className="flex flex-wrap items-center justify-start gap-4 mb-4">
        <PresetManager
          filters={filters}
          setFilters={setFilters}
          sortKey={sortKey}
          setSortKey={setSortKey}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          setActivePresetName={setActivePresetName}
        />
        {activePresetName && (
          <div className="text-sm text-gray-700">
            🔖 <span className="font-bold">Active Preset:</span>{" "}
            <span className="font-semibold">{activePresetName}</span>
          </div>
        )}
      </div>

      <OrderTable
        data={sortedAndFilteredOrders}
        filters={filters}
        setFilters={setFilters}
        uniqueValues={uniqueValues}
        sortKey={sortKey}
        sortDirection={sortDirection}
        setSortKey={setSortKey}
        setSortDirection={setSortDirection}
        setActivePresetName={setActivePresetName}
      />
    </main>
  );
}
