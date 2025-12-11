import { ProjectInput, BaseValues } from "./calculator-types";

// Simple base64 encoder for state sharing via URL
export function encodeState(inputs: ProjectInput, sliderValues: Record<string, number>, baseValues?: BaseValues): string {
  try {
    const state = { i: inputs, s: sliderValues, b: baseValues };
    return btoa(JSON.stringify(state));
  } catch (e) {
    console.error("Failed to encode state", e);
    return "";
  }
}

export function decodeState(hash: string): { inputs: ProjectInput; sliderValues: Record<string, number>; baseValues?: BaseValues } | null {
  try {
    if (!hash) return null;
    const json = atob(hash);
    const state = JSON.parse(json);
    if (state.i && state.s) {
      return { inputs: state.i, sliderValues: state.s, baseValues: state.b };
    }
    return null;
  } catch (e) {
    console.error("Failed to decode state", e);
    return null;
  }
}
