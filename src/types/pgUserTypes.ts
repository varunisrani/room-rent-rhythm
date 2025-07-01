export interface PGManage {
  id: string;
  name: string;
  password: string;
  pg_name: string | null;
}

export interface PGManageFormData {
  name: string;
  password: string;
  pg_name?: string;
}