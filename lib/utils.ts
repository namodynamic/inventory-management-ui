import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInventoryTrendData = (inventoryItems: InventoryItem[]) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const trendData = months.map((month, index) => {
    const monthlyItems = inventoryItems.filter(
      (item) =>
        new Date(item.last_updated || "").getMonth() === index &&
        new Date(item.last_updated || "").getFullYear() === currentYear
    );

    const totalStock = monthlyItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    return {
      month,
      stock: totalStock,
      available: totalStock,
      sold: 100,
    };
  });

  // total value for the current year
  const currentYearValue = inventoryItems
    .filter(
      (item) => new Date(item.last_updated || "").getFullYear() === currentYear
    )
    .reduce(
      (sum, item) => sum + Number(item.price || 0) * (item.quantity || 0),
      0
    );

  // Total value for the current month
  const currentMonthValue = inventoryItems
    .filter(
      (item) =>
        new Date(item.last_updated || "").getMonth() === currentMonth &&
        new Date(item.last_updated || "").getFullYear() === currentYear
    )
    .reduce(
      (sum, item) => sum + Number(item.price || 0) * (item.quantity || 0),
      0
    );

  return { trendData, currentYearValue, currentMonthValue };
};
