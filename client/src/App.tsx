import * as React from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import CurrencyConverter from "./components/CurrencyConverter";
import Footer from "./components/Footer";

function App() {
  const isDark = false;

  return (
    <LanguageProvider>
      <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-red-50 via-white to-pink-50 pb-20">
        <CurrencyConverter isDark={isDark} />
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;
