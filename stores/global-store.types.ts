export type GlobalStore = {
  fontsLoaded: boolean;
  setFontsLoaded: (value: boolean) => void;

  canScroll: boolean;
  setCanScroll: (value: boolean) => void;

  isLoading: boolean;
  setIsLoading: (value: boolean) => void;

  showContactForm: boolean;
  setShowContactForm: (value: boolean) => void;
  closeContactFormIfOpen: () => void;
};
