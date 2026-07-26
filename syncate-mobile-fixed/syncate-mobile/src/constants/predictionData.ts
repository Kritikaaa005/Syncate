// Destination: constants/predictionData.ts

export type CycleTypeOption = {
  id: string;
  labelKey: string;
  detailKey: string;
};

export const CYCLE_TYPES: CycleTypeOption[] = [
  { id: "short", labelKey: "cycle_type_short_label", detailKey: "cycle_type_short_detail" },
  { id: "medium", labelKey: "cycle_type_medium_label", detailKey: "cycle_type_medium_detail" },
  { id: "long", labelKey: "cycle_type_long_label", detailKey: "cycle_type_long_detail" },
];
