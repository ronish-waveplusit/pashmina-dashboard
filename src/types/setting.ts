export interface Setting {
  id: number;
  key: string;
  value: string | null;
  group: string;
  /** Branding rows expose the uploaded file URL here rather than in `value`. */
  logo?: string | null;
  favicon?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SettingPayload {
  key: string;
  value: string;
  group: string;
}
