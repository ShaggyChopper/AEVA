import { SUPPORTED_CURRENCIES } from '../constants';

// NOTE: In a real-world application, these rates would be fetched from a live API.
// For this project, we'll use static rates for demonstration purposes.
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 157.0,
  SEK: 10.45,
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const amountInUSD = amount / (EXCHANGE_RATES[fromCurrency] || 1);
  const convertedAmount = amountInUSD * (EXCHANGE_RATES[toCurrency] || 1);
  
  return convertedAmount;
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const symbol = SUPPORTED_CURRENCIES[currencyCode]?.symbol || currencyCode;
  return `${symbol}${amount.toFixed(2)}`;
};