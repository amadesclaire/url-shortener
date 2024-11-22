export type URLRecord = {
  id: string; // UUID
  url: URL;
  shortcode: string; // min 1 max 6
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  accessCount: number;
};

export type URLRecordSlim = Omit<URLRecord, "accessCount">;
