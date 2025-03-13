
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount);
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const formatPaymentId = (id: string) => {
  // Jeśli ID jest dłuższe niż 12 znaków, pokazuj tylko pierwsze 6 i ostatnie 4
  if (id && id.length > 12) {
    return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
  }
  return id;
};
