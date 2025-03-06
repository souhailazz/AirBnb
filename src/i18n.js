import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: {
          "welcome": "Bienvenue"
          // Ajoutez d'autres traductions ici
        }
      },
      en: {
        translation: {
          "welcome": "Welcome"
          // Ajoutez d'autres traductions ici
        }
      }
    },
    lng: "fr", // langue par défaut
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
