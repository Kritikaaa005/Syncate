export type CycleType = "short" | "medium" | "long";

export type CyclePredictionInput = {
  lastPeriodDate: string;
  cycleType: CycleType | string;
  periodDuration: number;
};

export type CyclePrediction = CyclePredictionInput & {
  cycleLength: number;
  nextPeriodStart: string;
  nextPeriodEnd: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
};
