import * as React from "react";
import { Button } from "./ui/button";
import { getTranslation, type Language } from "../lib/translations";

interface TaxToggleProps {
  taxMode: "netto" | "zeikomi";
  onTaxModeChange: (mode: "netto" | "zeikomi") => void;
  isDark: boolean;
  language: Language;
}

function TaxToggle({ taxMode, onTaxModeChange, isDark, language }: TaxToggleProps) {
  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        {getTranslation(language, "taxAdjustment")}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => onTaxModeChange("netto")}
          className={`h-14 rounded-2xl font-semibold text-base transition-all shadow-md ${
            taxMode === "netto"
              ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white scale-105 shadow-xl ring-2 ring-pink-300"
              : isDark
                ? "bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-pink-400 hover:bg-slate-600"
                : "bg-white text-gray-700 border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50"
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-xs">{getTranslation(language, "netto")}</span>
            <span className="text-[10px] opacity-80">税抜 - Zeinuki</span>
          </div>
        </Button>
        <Button
          onClick={() => onTaxModeChange("zeikomi")}
          className={`h-14 rounded-2xl font-semibold text-base transition-all shadow-md ${
            taxMode === "zeikomi"
              ? "bg-gradient-to-br from-rose-600 to-red-600 text-white scale-105 shadow-xl ring-2 ring-rose-300"
              : isDark
                ? "bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-rose-400 hover:bg-slate-600"
                : "bg-white text-gray-700 border-2 border-rose-200 hover:border-rose-400 hover:bg-rose-50"
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-xs">{getTranslation(language, "tax")}</span>
            <span className="text-[10px] opacity-80">税込 - Zeikomi</span>
          </div>
        </Button>
      </div>
    </div>
  );
}

export default TaxToggle;
