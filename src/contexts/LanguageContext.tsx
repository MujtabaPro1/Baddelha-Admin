import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

type TranslationKeys = 
  | 'content.moderation'
  | 'content.items'
  | 'content.select'
  | 'button.edit'
  | 'button.save'
  | 'button.saving'
  | 'button.cancel'
  | 'last.updated'
  | 'language'
  | 'success.saved'
  | 'error.save';

type TranslationsType = {
  [key in Language]: {
    [key in TranslationKeys]: string;
  }
};

const translations: TranslationsType = {
  en: {
    'content.moderation': 'Content Moderation',
    'content.items': 'Content Items',
    'content.select': 'Select a content item from the sidebar to view or edit',
    'button.edit': 'Edit',
    'button.save': 'Save',
    'button.saving': 'Saving...',
    'button.cancel': 'Cancel',
    'last.updated': 'Last updated',
    'language': 'Language',
    'success.saved': 'has been updated successfully',
    'error.save': 'Failed to save content. Please try again.',
  },
  ar: {
    'content.moderation': 'إدارة المحتوى',
    'content.items': 'عناصر المحتوى',
    'content.select': 'حدد عنصر محتوى من الشريط الجانبي للعرض أو التحرير',
    'button.edit': 'تحرير',
    'button.save': 'حفظ',
    'button.saving': 'جاري الحفظ...',
    'button.cancel': 'إلغاء',
    'last.updated': 'آخر تحديث',
    'language': 'اللغة',
    'success.saved': 'تم تحديثه بنجاح',
    'error.save': 'فشل في حفظ المحتوى. يرجى المحاولة مرة أخرى.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
