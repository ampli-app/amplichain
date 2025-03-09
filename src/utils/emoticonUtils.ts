
// Funkcja konwertująca emotikony tekstowe na emoji
export const convertEmoticons = (text: string): string => {
  if (!text) return '';
  
  const emoticonMap: Record<string, string> = {
    ':)': '😊',
    ':-)': '😊',
    ':D': '😃',
    ':-D': '😃',
    ';)': '😉',
    ';-)': '😉',
    ':(': '☹️',
    ':-(': '☹️',
    ':P': '😛',
    ':-P': '😛',
    ':p': '😛',
    ':-p': '😛',
    ':*': '😘',
    ':-*': '😘',
    '<3': '❤️',
    ':O': '😮',
    ':o': '😮',
    ':-O': '😮',
    ':-o': '😮',
    ':|': '😐',
    ':-|': '😐',
    ':S': '😖',
    ':s': '😖',
    ':-S': '😖',
    ':-s': '😖',
    '>:(': '😠',
    '>:-(': '😠',
    'xD': '😆',
    'XD': '😆',
    ':/': '😕',
    ':-/': '😕',
    ':3': '😺',
    '^_^': '😄',
    '^.^': '😄',
    '^-^': '😄',
    'O.o': '😳',
    'o.O': '😳',
    'O_o': '😳',
    'o_O': '😳',
    '-_-': '😒',
  };
  
  // Zamień wszystkie emotikony na emoji
  let convertedText = text;
  for (const [emoticon, emoji] of Object.entries(emoticonMap)) {
    // Używamy wyrażenia regularnego, aby uniknąć zastępowania części słów
    // Szukamy emotikona otoczonego spacjami lub na początku/końcu tekstu
    const regex = new RegExp(`(^|\\s)${emoticon.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")}(?=\\s|$)`, 'g');
    convertedText = convertedText.replace(regex, `$1${emoji}`);
  }
  
  return convertedText;
};

// Funkcja konwertująca emotikony w czasie rzeczywistym podczas wpisywania
export const convertEmoticonOnInput = (text: string, position: number): { text: string, newPosition: number } => {
  if (!text) return { text: '', newPosition: 0 };
  
  const emoticonMap: Record<string, string> = {
    ':)': '😊',
    ':-)': '😊',
    ':D': '😃',
    ':-D': '😃',
    ';)': '😉',
    ';-)': '😉',
    ':(': '☹️',
    ':-(': '☹️',
    ':P': '😛',
    ':-P': '😛',
    ':p': '😛',
    ':-p': '😛',
    ':*': '😘',
    ':-*': '😘',
    '<3': '❤️',
    ':O': '😮',
    ':o': '😮',
    ':-O': '😮',
    ':-o': '😮',
    ':|': '😐',
    ':-|': '😐',
    ':S': '😖',
    ':s': '😖',
    ':-S': '😖',
    ':-s': '😖',
    '>:(': '😠',
    '>:-(': '😠',
    'xD': '😆',
    'XD': '😆',
    ':/': '😕',
    ':-/': '😕',
    ':3': '😺',
    '^_^': '😄',
    '^.^': '😄',
    '^-^': '😄',
    'O.o': '😳',
    'o.O': '😳',
    'O_o': '😳',
    'o_O': '😳',
    '-_-': '😒',
  };
  
  // Sprawdź, czy ostatnio wpisany znak zakończył emotikon
  let convertedText = text;
  let positionOffset = 0;
  
  for (const [emoticon, emoji] of Object.entries(emoticonMap)) {
    // Sprawdź, czy przed aktualną pozycją kursora znajduje się emotikon
    const beforeCursor = text.substring(0, position);
    
    // Szukamy emotikona otoczonego spacjami lub na początku tekstu
    const pattern = `(^|\\s)${emoticon.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")}$`;
    const regex = new RegExp(pattern);
    
    if (regex.test(beforeCursor)) {
      // Określamy długość emotikona i jego pozycję w tekście
      const match = beforeCursor.match(regex);
      if (match) {
        const matchStart = match.index! + (match[1] ? match[1].length : 0);
        const matchEnd = beforeCursor.length;
        
        // Zamieniamy emotikon na emoji
        convertedText = 
          beforeCursor.substring(0, matchStart) + 
          (match[1] ? match[1] : '') + emoji + 
          text.substring(position);
        
        // Aktualizujemy pozycję kursora
        positionOffset = (emoji.length - (matchEnd - matchStart));
        break;
      }
    }
  }
  
  return { 
    text: convertedText, 
    newPosition: position + positionOffset 
  };
};
