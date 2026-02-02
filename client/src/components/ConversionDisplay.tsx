import * as React from "react";
import { formatCurrency } from "../lib/formatter";

interface ConversionDisplayProps {
  result: number;
  currency: "EUR" | "JPY";
  isLoading: boolean;
  isDark: boolean;
  children?: React.ReactNode;
}

function ConversionDisplay({
  result,
  currency,
  isLoading,
  isDark,
  children,
}: ConversionDisplayProps) {
  if (isLoading) {
    return (
      <div className={`rounded-2xl p-6 text-center ${
        isDark 
          ? "bg-gradient-to-br from-slate-700 to-slate-600" 
          : "bg-gradient-to-br from-red-50 to-pink-50"
      }`}>
        <p className={isDark ? "text-slate-400" : "text-gray-500"}>Wechselkurs wird geladen...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-6 space-y-3 shadow-md ${
      isDark
        ? "bg-teal-700/60 border-2 border-teal-600/50"
        : "bg-[#D1F2EB] border-2 border-teal-300"
    }`}>
      <div className="text-center">
        <p className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          {formatCurrency(result, currency)}
        </p>
      </div>
      
      <div className={`pt-3 border-t-2 ${isDark ? "border-teal-600/50" : "border-teal-300"}`}>
        {children}
      </div>
    </div>
  );
}

export default ConversionDisplay;
