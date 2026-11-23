import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CURRENCIES, getActiveCurrency, money, convertPrice } from '../api.js';

const CurrencyContext = createContext({
  currency: CURRENCIES.GBP,
  selectedCountry: 'United Kingdom (GBP £)',
  changeCountry: () => {},
  format: (n) => money(n),
  convert: (n) => convertPrice(n),
  currencies: CURRENCIES
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => getActiveCurrency());
  const [selectedCountry, setSelectedCountry] = useState(() => {
    try {
      return localStorage.getItem('perfumezone_country') || 'United Kingdom (GBP £)';
    } catch {
      return 'United Kingdom (GBP £)';
    }
  });

  useEffect(() => {
    const handleCountryChange = (e) => {
      const countryStr = e?.detail || localStorage.getItem('perfumezone_country') || '';
      if (countryStr) setSelectedCountry(countryStr);
      setCurrency(getActiveCurrency());
    };

    window.addEventListener('pz:country-change', handleCountryChange);
    return () => window.removeEventListener('pz:country-change', handleCountryChange);
  }, []);

  const changeCountry = (countryStr) => {
    try {
      localStorage.setItem('perfumezone_country', countryStr);
    } catch {}
    setSelectedCountry(countryStr);
    const updated = getActiveCurrency();
    setCurrency(updated);
    window.dispatchEvent(new CustomEvent('pz:country-change', { detail: countryStr }));
  };

  const value = useMemo(
    () => ({
      currency,
      selectedCountry,
      changeCountry,
      format: (val) => money(val, currency),
      convert: (val) => convertPrice(val, currency),
      currencies: CURRENCIES
    }),
    [currency, selectedCountry]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
