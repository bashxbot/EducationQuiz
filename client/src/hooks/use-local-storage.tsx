import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: { validate?: (data: any) => T }
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      const parsed = JSON.parse(item)
      if (options?.validate) {
        return options.validate(parsed)
      }
      return parsed
    } catch (error) {
      console.log(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useLocalStorageState(key: string, defaultValue: string) {
  const [value, setValue] = useLocalStorage(key, defaultValue);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, setValue]);

  return [value, setValue] as const;
}