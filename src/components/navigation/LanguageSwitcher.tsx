
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <span className="sr-only">Zmień język</span>
          {currentLanguage.flag === '🇵🇱' ? (
            <div className="w-5 h-5 bg-white rounded-full overflow-hidden flex items-center justify-center">
              <div className="w-full h-2.5 bg-white"></div>
              <div className="w-full h-2.5 bg-red-600 absolute bottom-0"></div>
            </div>
          ) : (
            <div className="w-5 h-5 bg-blue-900 rounded-full overflow-hidden flex items-center justify-center relative">
              <div className="absolute w-5 h-[1px] bg-white left-0 top-1/2 transform -translate-y-1/2"></div>
              <div className="absolute h-5 w-[1px] bg-white left-1/2 top-0 transform -translate-x-1/2"></div>
              <div className="absolute w-3 h-[1px] bg-red-600 left-0 top-1/2 transform -translate-y-1/2 rotate-45 origin-center"></div>
              <div className="absolute h-3 w-[1px] bg-red-600 left-1/2 top-0 transform -translate-x-1/2 rotate-45 origin-center"></div>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="end">
        <div className="py-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`flex items-center w-full px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                i18n.language === lang.code ? 'bg-accent/50' : ''
              }`}
              onClick={() => changeLanguage(lang.code)}
            >
              <span className="mr-2 text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
