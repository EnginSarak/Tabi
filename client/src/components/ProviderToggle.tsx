import * as React from "react";
import { Button } from "./ui/button";
import { getTranslation, type Language } from "../lib/translations";

interface ProviderToggleProps {
  provider: "mastercard" | "visa";
  onProviderChange: (provider: "mastercard" | "visa") => void;
  isDark: boolean;
  language: Language;
}

function ProviderToggle({ provider, onProviderChange, isDark, language }: ProviderToggleProps) {
  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        {getTranslation(language, "cardProvider")}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => onProviderChange("mastercard")}
          className={`h-14 rounded-2xl font-bold text-base transition-all shadow-md ${
            provider === "mastercard"
              ? "bg-gradient-to-br from-red-600 via-orange-500 to-orange-600 text-white scale-105 shadow-xl ring-2 ring-orange-400"
              : isDark
                ? "bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-red-400 hover:bg-slate-600"
                : "bg-white text-gray-700 border-2 border-red-200 hover:border-red-400 hover:bg-red-50"
          }`}
        >
          Mastercard
        </Button>
        <Button
          onClick={() => onProviderChange("visa")}
          className={`h-14 rounded-2xl font-bold text-base transition-all shadow-md ${
            provider === "visa"
              ? "bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 text-white scale-105 shadow-xl ring-2 ring-blue-400"
              : isDark
                ? "bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-blue-400 hover:bg-slate-600"
                : "bg-white text-gray-700 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          Visa
        </Button>
      </div>
    </div>
  );
}

export default ProviderToggle;
