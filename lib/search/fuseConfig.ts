import type { IFuseOptions, FuseOptionKey } from "fuse.js";

export const fuseKeys: FuseOptionKey<any>[] = [
  { name: "positionN", weight: 0.6 },
  { name: "companyN", weight: 0.3 },
  { name: "locationN", weight: 0.1 },
];

export const fuseOptions: IFuseOptions<any> = {
  includeScore: true,
  threshold: 0.32,
  distance: 100,
  keys: fuseKeys,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

