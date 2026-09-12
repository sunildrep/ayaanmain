// Central configuration for external app links — single source of truth.
// Do not hard-code Ayaan App URLs elsewhere; import from here.
export const AYAAN_APP_URL =
  process.env.NEXT_PUBLIC_AYAAN_APP_URL ||
  "https://play.google.com/store/apps/details?id=co.classplus.ayaan";

export const AYAAN_PRO_FITNESS_APP_URL =
  process.env.NEXT_PUBLIC_AYAAN_PRO_APP_URL ||
  "https://play.google.com/store/apps/details?id=com.user.ayaanprofitness";
