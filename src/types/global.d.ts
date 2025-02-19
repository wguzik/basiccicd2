declare global {
  interface Window {
    getWeather: () => Promise<void>;
    showError: (message: string) => void;
  }
}

export {}; 