export interface Setting {
  id: number;
  key: string;
  value: string | null;
  group: string;
  created_at?: string;
  updated_at?: string;
}

export interface SettingPayload {
  key: string;
  value: string;
  group: string;
}
