export type ContactFormFields = {
  name: string;
  email: string;
  company: string;
  services: string;
  budget: string;
  message: string;
};

export type ContactFormField = keyof ContactFormFields;

export type ContactStore = ContactFormFields & {
  setField: (field: ContactFormField, value: string) => void;
  reset: () => void;
};
