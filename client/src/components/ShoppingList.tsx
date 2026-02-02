import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { formatCurrency } from "../lib/formatter";
import { Trash2 } from "lucide-react";
import { getTranslation, type Language } from "../lib/translations";

interface ShoppingItem {
  id: string;
  amountJPY: number;
  amountEUR: number;
  timestamp: number;
  name?: string;
}

interface ShoppingListProps {
  items: ShoppingItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItemName: (id: string, name: string) => void;
  isDark: boolean;
  taxMode: "netto" | "zeikomi";
  language: Language;
}

const SHOPPING_LIST_KEY = "jpn-shopping-list";

function ShoppingList({ items, isOpen, onClose, onRemoveItem, onUpdateItemName, isDark, taxMode, language }: ShoppingListProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  React.useEffect(() => {
    try {
      localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving shopping list:", error);
    }
  }, [items]);

  const applyTax = (amount: number) => taxMode === "zeikomi" ? amount * 1.1 : amount;
  
  const totalJPY = items.reduce((sum, item) => sum + applyTax(item.amountJPY), 0);
  const totalEUR = items.reduce((sum, item) => sum + applyTax(item.amountEUR), 0);

  function handleStartEdit(item: ShoppingItem, index: number) {
    setEditingId(item.id);
    setEditValue(item.name || `${getTranslation(language, "item")} ${index + 1}`);
  }

  function handleSaveEdit(id: string) {
    if (editValue.trim()) {
      onUpdateItemName(id, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent, id: string) {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md ${
        isDark ? "bg-slate-800 border-red-900/30" : "bg-white border-red-100"
      }`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            {getTranslation(language, "yourShoppingList")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className={`text-center py-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <p className="text-lg">{getTranslation(language, "listEmpty")}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDark ? "bg-slate-700" : "bg-red-50"
                    }`}
                  >
                    <div className="flex-1">
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSaveEdit(item.id)}
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
                          autoFocus
                          className={`font-medium px-2 py-1 rounded border-2 w-full ${
                            isDark 
                              ? "bg-slate-600 text-white border-blue-500" 
                              : "bg-white text-gray-900 border-blue-400"
                          }`}
                        />
                      ) : (
                        <p 
                          onClick={() => handleStartEdit(item, index)}
                          className={`font-medium cursor-pointer hover:underline ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.name || `${getTranslation(language, "item")} ${index + 1}`}
                        </p>
                      )}
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {formatCurrency(applyTax(item.amountJPY), "JPY")} → {formatCurrency(applyTax(item.amountEUR), "EUR")}
                      </p>
                    </div>
                    <Button
                      onClick={() => onRemoveItem(item.id)}
                      variant="ghost"
                      size="icon"
                      className={`ml-2 ${
                        isDark 
                          ? "hover:bg-red-900/50 text-red-400" 
                          : "hover:bg-red-100 text-red-600"
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className={`border-t-2 pt-4 ${
                isDark ? "border-slate-600" : "border-red-200"
              }`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      {getTranslation(language, "totalJPY")}
                    </span>
                    <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {formatCurrency(totalJPY, "JPY")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      {getTranslation(language, "totalEUR")}
                    </span>
                    <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {formatCurrency(totalEUR, "EUR")}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShoppingList;
