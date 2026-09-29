import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface ShippingSettings {
  sameDayShippingEnabled: boolean;
  cutoffHour: number;
  customNotice: string;
}

export interface ShippingContextType {
  settings: ShippingSettings;
  isSameDayActiveNow: boolean;
  secondsUntilCutoff: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  formattedCountdown: string;
  updateSettings: (newSettings: Partial<ShippingSettings>, adminPin?: string) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: ShippingSettings = {
  sameDayShippingEnabled: true,
  cutoffHour: 16,
  customNotice: '',
};

function getPolandTime(): { hours: number; minutes: number; seconds: number } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('pl-PL', {
      timeZone: 'Europe/Warsaw',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    for (const p of parts) {
      if (p.type === 'hour') hours = parseInt(p.value, 10);
      if (p.type === 'minute') minutes = parseInt(p.value, 10);
      if (p.type === 'second') seconds = parseInt(p.value, 10);
    }
    return { hours, minutes, seconds };
  } catch {
    const now = new Date();
    return { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() };
  }
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined);

export const ShippingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ShippingSettings>(() => {
    try {
      const cached = localStorage.getItem('cc_shipping_settings');
      if (cached) return { ...defaultSettings, ...JSON.parse(cached) };
    } catch {}
    return defaultSettings;
  });

  const [polandTime, setPolandTime] = useState(getPolandTime);

  // Fetch from server on mount
  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/shipping-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          try {
            localStorage.setItem('cc_shipping_settings', JSON.stringify(data.settings));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Could not fetch shipping settings from server:', e);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Tick clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setPolandTime(getPolandTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate seconds until cutoffHour:00 today
  const cutoffSecondsTotal = settings.cutoffHour * 3600;
  const currentSecondsTotal = polandTime.hours * 3600 + polandTime.minutes * 60 + polandTime.seconds;
  const diff = cutoffSecondsTotal - currentSecondsTotal;

  const isSameDayActiveNow = settings.sameDayShippingEnabled && diff > 0;
  const secondsUntilCutoff = isSameDayActiveNow ? diff : 0;

  const hoursRemaining = Math.floor(secondsUntilCutoff / 3600);
  const minutesRemaining = Math.floor((secondsUntilCutoff % 3600) / 60);
  const secondsRemaining = secondsUntilCutoff % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedCountdown = `${pad(hoursRemaining)}:${pad(minutesRemaining)}:${pad(secondsRemaining)}`;

  const updateSettings = async (
    newSettings: Partial<ShippingSettings>,
    adminPin?: string
  ): Promise<boolean> => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem('cc_shipping_settings', JSON.stringify(updated));
    } catch {}

    const pin = adminPin || sessionStorage.getItem('ubb_admin_pin') || '';
    try {
      const res = await fetch('/api/shipping-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
          'x-admin-password': pin,
        },
        body: JSON.stringify(updated),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  return (
    <ShippingContext.Provider
      value={{
        settings,
        isSameDayActiveNow,
        secondsUntilCutoff,
        hoursRemaining,
        minutesRemaining,
        secondsRemaining,
        formattedCountdown,
        updateSettings,
        refreshSettings,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};

export const useShipping = (): ShippingContextType => {
  const ctx = useContext(ShippingContext);
  if (!ctx) {
    throw new Error('useShipping must be used within ShippingProvider');
  }
  return ctx;
};
