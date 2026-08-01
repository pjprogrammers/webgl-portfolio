import { create } from "zustand";
import type { ContactFormFields, ContactStore } from "./contact-store.types";

const initialFields: ContactFormFields = {
  name: "",
  email: "",
  company: "",
  services: "",
  budget: "",
  message: "",
};

export const useContactStore = create<ContactStore>((set) => ({
  ...initialFields,
  setField: (field, value) => set({ [field]: value }),
  reset: () => set({ ...initialFields }),
}));
