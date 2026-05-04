export type EasingFn = ((t: number) => number) & {
  readonly easingName: string;
};

export type ParametricEasing<P extends object> = EasingFn & {
  readonly defaults: Readonly<P>;
  with(params: Partial<P>): EasingFn;
};
