export interface Currency {
  code: string;
  name: string;
  symbol: string;
  region: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', region: 'United States' },
  { code: 'EUR', name: 'Euro', symbol: '€', region: 'Eurozone' },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£', region: 'United Kingdom' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', region: 'Japan' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', region: 'China' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$', region: 'Canada' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$', region: 'Australia' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: '$', region: 'Singapore' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', region: 'Switzerland' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$', region: 'Hong Kong' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', region: 'South Korea' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', region: 'Thailand' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', region: 'United Arab Emirates' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', region: 'Saudi Arabia' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$', region: 'New Zealand' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', region: 'India' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', region: 'Mexico' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', region: 'Turkey' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', region: 'Indonesia' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', region: 'Philippines' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', region: 'Malaysia' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', region: 'Vietnam' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', region: 'Qatar' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', region: 'Kuwait' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', region: 'Bahrain' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', region: 'Oman' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', region: 'Egypt' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', region: 'South Africa' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', region: 'Brazil' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', region: 'Argentina' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', region: 'Chile' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', region: 'Colombia' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', region: 'Peru' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', region: 'Denmark' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', region: 'Sweden' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', region: 'Norway' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', region: 'Poland' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', region: 'Czech Republic' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', region: 'Hungary' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', region: 'Romania' },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', region: 'Israel' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', region: 'Jordan' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', region: 'Pakistan' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', region: 'Bangladesh' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', region: 'Sri Lanka' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', region: 'Nepal' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', region: 'Cambodia' },
  { code: 'LAK', name: 'Laotian Kip', symbol: '₭', region: 'Laos' },
  { code: 'MNT', name: 'Mongolian Tugrik', symbol: '₮', region: 'Mongolia' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', region: 'Morocco' },
];

export function getFormattedCurrency(currency: Currency): string {
  // Using Code - Name formatting to guarantee uniform left-alignment.
  return `${currency.code} - ${currency.name} (${currency.symbol})`;
}
