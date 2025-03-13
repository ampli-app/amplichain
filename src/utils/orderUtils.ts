
// Helper function to validate UUID format
export const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Funkcja do konwersji wartości na liczbę i zaokrąglenia do 2 miejsc po przecinku
export const formatAmount = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};
