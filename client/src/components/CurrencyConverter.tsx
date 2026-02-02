import * as React from "react";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ProviderToggle from "./ProviderToggle";
import TaxToggle from "./TaxToggle";
import ConversionDisplay from "./ConversionDisplay";
import ExchangeRateDisplay from "./ExchangeRateDisplay";
import ShoppingList from "./ShoppingList";
import { fetchExchangeRate, getCachedRate } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import { getTranslation } from "../lib/translations";
import { ShoppingCart, Plus, Minus } from "lucide-react";

type Provider = "mastercard" | "visa";
type Direction = "eur-jpy" | "jpy-eur";
type TaxMode = "netto" | "zeikomi";

interface ShoppingItem {
  id: string;
  amountJPY: number;
  amountEUR: number;
  timestamp: number;
  name?: string;
}

interface CurrencyConverterProps {
  isDark: boolean;
}

function CurrencyConverter({ isDark }: CurrencyConverterProps) {
  const { language, setLanguage } = useLanguage();
  const [provider, setProvider] = useState<Provider>("mastercard");
  const [direction, setDirection] = useState<Direction>("jpy-eur");
  const [taxMode, setTaxMode] = useState<TaxMode>("netto");
  const [inputValue, setInputValue] = useState<string>("");
  const [baseRate, setBaseRate] = useState<number | null>(null);
  const [manualRate, setManualRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem("jpn-shopping-list");
      if (saved) {
        console.log("Loaded shopping list from localStorage");
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading shopping list:", error);
    }
    return [];
  });
  const [isListOpen, setIsListOpen] = useState<boolean>(false);

  function toggleLanguage() {
    setLanguage(language === "en" ? "de" : "en");
  }

  useEffect(() => {
    loadExchangeRate();
  }, []);

  async function loadExchangeRate() {
    const cachedData = getCachedRate();
    
    if (cachedData) {
      console.log("Instant loading from cache");
      setBaseRate(cachedData.rate);
      setLastUpdated(cachedData.timestamp);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    const freshData = await fetchExchangeRate();
    if (freshData) {
      console.log("Updated with fresh data from network");
      setBaseRate(freshData.rate);
      setLastUpdated(freshData.timestamp);
    } else if (!cachedData) {
      console.log("Network failed and no cache available");
    } else {
      console.log("Network failed, using cached data");
    }
    
    setIsLoading(false);
  }

  function handleManualRateChange(rate: number | null) {
    setManualRate(rate);
  }

  function getAdjustedRate(): number {
    // Use manual rate if set, otherwise use base rate
    const effectiveRate = manualRate !== null ? manualRate : baseRate;
    if (!effectiveRate) return 0;
    
    // If manual rate is set, use it directly without provider adjustments
    if (manualRate !== null) {
      return manualRate;
    }
    
    // Apply provider markup to base rate
    if (provider === "mastercard") {
      return effectiveRate / 1.0045;
    } else {
      return effectiveRate / 1.0055;
    }
  }

  function calculateConversion(): number {
    const rate = getAdjustedRate();
    if (!rate) return 0;

    // For EUR input, simply replace comma with period
    // For JPY input, remove thousand separators (dots) first
    const amount = direction === "eur-jpy" 
      ? parseFloat(inputValue.replace(",", ".")) || 0
      : parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;

    if (direction === "eur-jpy") {
      return amount * rate;
    } else {
      return amount / rate;
    }
  }

  function handleSwitch() {
    setDirection(direction === "eur-jpy" ? "jpy-eur" : "eur-jpy");
    // Value is preserved, no need to reset inputValue
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    
    // For EUR input, allow decimals (both comma and period)
    if (direction === "eur-jpy") {
      // Replace period with comma for consistency
      value = value.replace(".", ",");
      // Allow only numbers and comma (max one comma for decimals)
      const isValid = value === "" || /^[0-9]+,?[0-9]{0,2}$/.test(value);
      if (isValid) {
        setInputValue(value);
      }
    } else {
      // For JPY input, keep existing integer-only logic
      // Remove all dots first (to handle existing formatting)
      value = value.replace(/\./g, "");
      // Allow only numbers and comma
      const isValid = value === "" || /^[0-9,]*$/.test(value);
      if (isValid) {
        // Add thousand separators (dots)
        const numericValue = value.replace(/,/g, "");
        const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setInputValue(formatted || value);
      }
    }
  }

  function handleAddToList() {
    const inputAmount = parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) || 0;
    if (inputAmount === 0) return;

    const rate = getAdjustedRate();
    let amountJPY = 0;
    let amountEUR = 0;

    if (direction === "jpy-eur") {
      amountJPY = inputAmount;
      amountEUR = inputAmount / rate;
    } else {
      amountEUR = inputAmount;
      amountJPY = inputAmount * rate;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      amountJPY,
      amountEUR,
      timestamp: Date.now(),
    };

    setShoppingItems([...shoppingItems, newItem]);
    setInputValue("");
  }

  function handleRemoveLastItem() {
    if (shoppingItems.length === 0) return;
    setShoppingItems(shoppingItems.slice(0, -1));
  }

  function handleRemoveItem(id: string) {
    setShoppingItems(shoppingItems.filter(item => item.id !== id));
  }

  function handleUpdateItemName(id: string, name: string) {
    setShoppingItems(shoppingItems.map(item => 
      item.id === id ? { ...item, name } : item
    ));
  }

  function handleOpenList() {
    setIsListOpen(true);
  }

  function handleCloseList() {
    setIsListOpen(false);
  }

  const baseResult = calculateConversion();
  const result = taxMode === "zeikomi" ? baseResult * 1.1 : baseResult;
  const inputCurrency = direction === "eur-jpy" ? "EUR" : "JPY";
  const outputCurrency = direction === "eur-jpy" ? "JPY" : "EUR";

  return (
    <div className="flex items-center justify-center min-h-screen p-4 pb-safe">
      <div className="w-full max-w-md">
        <Card className={`backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden ${
          isDark ? "bg-slate-800/95 border-2 border-red-900/30" : "bg-white/95 border-2 border-red-100"
        }`}>
          {/* Header */}
          <div className={`p-6 text-white relative ${
            isDark 
              ? "bg-gradient-to-r from-red-900 via-red-800 to-red-900" 
              : "bg-gradient-to-r from-red-600 via-red-500 to-pink-500"
          }`}>
            <div className="flex justify-between items-start mb-2">
              <Button
                onClick={toggleLanguage}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 font-bold text-sm px-3 py-1 h-8"
              >
                {language === "en" ? "DE" : "EN"}
              </Button>
              <Button
                onClick={handleOpenList}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 relative p-2"
              >
                <ShoppingCart className="h-6 w-6" />
                {shoppingItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {shoppingItems.length}
                  </span>
                )}
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-center mb-1 tracking-wide">
              {getTranslation(language, "appTitle")}
            </h1>
            <p className="text-xs text-center text-white/90 font-medium">
              {lastUpdated ? `${getTranslation(language, "updated")}: ${lastUpdated}` : getTranslation(language, "loading")}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Provider Toggle */}
            <ProviderToggle provider={provider} onProviderChange={setProvider} isDark={isDark} language={language} />

            {/* Tax Mode Toggle */}
            <TaxToggle taxMode={taxMode} onTaxModeChange={setTaxMode} isDark={isDark} language={language} />

            {/* Input Section */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {getTranslation(language, "amountIn")} {inputCurrency}
              </label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="decimal"
                  step={direction === "eur-jpy" ? "0.01" : "1"}
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={direction === "eur-jpy" ? "0,00" : "0"}
                  className={`text-3xl h-16 rounded-2xl border-2 focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all px-4 ${
                    isDark 
                      ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" 
                      : "bg-white border-red-200 text-gray-900"
                  }`}
                  disabled={isLoading}
                />
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xl font-medium ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}>
                  {inputCurrency === "EUR" ? "€" : "¥"}
                </span>
              </div>
            </div>

            {/* Conversion Display */}
            <ConversionDisplay
              result={result}
              currency={outputCurrency}
              isLoading={isLoading}
              isDark={isDark}
            >
              <ExchangeRateDisplay
                rate={getAdjustedRate()}
                isManual={manualRate !== null}
                onManualRateChange={handleManualRateChange}
                isDark={isDark}
                language={language}
              />
            </ConversionDisplay>

            {/* Add/Remove Buttons - Horizontal Layout Below Result */}
            <div className="flex gap-3">
              <Button
                onClick={handleRemoveLastItem}
                disabled={shoppingItems.length === 0}
                className={`flex-1 h-14 rounded-2xl font-semibold text-lg shadow-lg transition-all ring-2 ${
                  shoppingItems.length === 0
                    ? isDark
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed ring-slate-600/50"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed ring-gray-400/50"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white ring-red-400/50"
                }`}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <Button
                onClick={handleAddToList}
                disabled={!inputValue || parseFloat(inputValue.replace(/\./g, "").replace(",", ".")) === 0}
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ring-2 ring-green-400/50"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>

            {/* Switch Direction Button - Full Width at Bottom */}
            <Button
              onClick={handleSwitch}
              className="w-full h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 text-white font-bold text-base shadow-md hover:from-cyan-400 hover:via-blue-400 hover:to-blue-500 hover:shadow-xl active:scale-95 transition-all ring-2 ring-blue-400/50"
            >
              {getTranslation(language, "switchDirection")}
            </Button>
          </div>
        </Card>

        <ShoppingList
          items={shoppingItems}
          isOpen={isListOpen}
          onClose={handleCloseList}
          onRemoveItem={handleRemoveItem}
          onUpdateItemName={handleUpdateItemName}
          isDark={isDark}
          taxMode={taxMode}
          language={language}
        />
      </div>
    </div>
  );
}

export default CurrencyConverter;
