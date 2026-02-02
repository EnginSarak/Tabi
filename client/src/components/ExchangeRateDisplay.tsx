import * as React from "react";
import { useState } from "react";
import { formatRate } from "../lib/formatter";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X, Lock } from "lucide-react";
import { getTranslation, type Language } from "../lib/translations";

interface ExchangeRateDisplayProps {
  rate: number;
  isManual: boolean;
  onManualRateChange: (rate: number | null) => void;
  isDark: boolean;
  language: Language;
}

function ExchangeRateDisplay({
  rate,
  isManual,
  onManualRateChange,
  isDark,
  language,
}: ExchangeRateDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  function handleEditClick() {
    setIsEditing(true);
    setEditValue(rate.toFixed(2));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // Allow numbers and decimal point
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setEditValue(value);
    }
  }

  function handleSave() {
    const newRate = parseFloat(editValue);
    if (newRate > 0) {
      onManualRateChange(newRate);
      setIsEditing(false);
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setEditValue("");
  }

  function handleReset() {
    onManualRateChange(null);
    setIsEditing(false);
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${isDark ? "text-red-300" : "text-red-700"}`}>
          {getTranslation(language, "rate")}: 1 € =
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className={`h-7 w-24 text-xs px-2 ${
            isDark
              ? "bg-slate-700 border-slate-600 text-white"
              : "bg-white border-red-300 text-gray-900"
          }`}
          autoFocus
        />
        <span className={`text-xs font-medium ${isDark ? "text-red-300" : "text-red-700"}`}>
          ¥
        </span>
        <Button
          onClick={handleSave}
          size="sm"
          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
        >
          ✓
        </Button>
        <Button
          onClick={handleCancel}
          size="sm"
          variant="ghost"
          className={`h-7 px-2 text-xs ${
            isDark ? "hover:bg-slate-700 text-gray-400" : "hover:bg-red-100 text-gray-600"
          }`}
        >
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={handleEditClick}
        className={`text-xs text-center font-medium transition-colors cursor-pointer hover:underline ${
          isManual
            ? isDark
              ? "text-blue-400"
              : "text-blue-600"
            : isDark
            ? "text-red-300"
            : "text-red-700"
        }`}
      >
        {isManual && <Lock className="inline h-3 w-3 mr-1" />}
        {getTranslation(language, "rate")}: 1 € = {formatRate(rate)} ¥
      </button>
      {isManual && (
        <Button
          onClick={handleReset}
          size="sm"
          variant="ghost"
          className={`h-6 w-6 p-0 ${
            isDark
              ? "hover:bg-slate-700 text-gray-400"
              : "hover:bg-red-100 text-gray-600"
          }`}
          title={getTranslation(language, "resetRate")}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export default ExchangeRateDisplay;
