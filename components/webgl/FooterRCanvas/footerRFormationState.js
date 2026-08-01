import { particleScrollState } from "./particleScrollState.js";

/** Compatibilidad: `progress` mapea a `rFormation`. */
export const footerRFormationState = {
  get progress() {
    return particleScrollState.rFormation;
  },
  set progress(value) {
    particleScrollState.rFormation = value;
  },
};
