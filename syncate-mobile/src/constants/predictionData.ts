// Destination: constants/predictionData.ts

export type CycleTypeOption = {
  id: string;
  label: string;
  detail: string;
};

export const CYCLE_TYPES: CycleTypeOption[] = [
  { id: "short", label: "Short", detail: "Less than 24 days" },
  { id: "medium", label: "Medium", detail: "24 – 35 days" },
  { id: "long", label: "Long", detail: "More than 35 days" },
];
