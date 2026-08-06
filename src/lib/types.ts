export type DailyLog = {
  id: string;
  user_id: string;
  log_date: string;
  weight_kg: number;
  physique_photo_path: string;
  menu_screenshot_path: string;
  ai_feedback: string | null;
  created_at: string;
};
