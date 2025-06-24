
import { useState, useEffect } from "react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    chat?: any;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: any;
  BackButton: any;
  SettingsButton: any;
  HapticFeedback: any;
  showAlert: (message: string) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  showPopup: (params: any, callback?: (buttonId: string) => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we're running inside Telegram
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      
      // Get user data
      if (tg.initDataUnsafe.user) {
        setUser(tg.initDataUnsafe.user);
      }
      
      // Configure the app
      tg.ready();
      tg.expand();
      
      // Set theme colors
      tg.headerColor = '#0f172a';
      tg.backgroundColor = '#0f172a';
      
      setIsReady(true);
    } else {
      // Fallback for development/testing outside Telegram
      console.warn('Telegram WebApp not available. Running in fallback mode.');
      setIsReady(true);
    }
  }, []);

  return {
    webApp,
    user,
    isReady,
    isTelegramEnvironment: !!window.Telegram?.WebApp,
  };
};
