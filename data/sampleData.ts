import { formatLocalDateKey } from "@/utils/dateKey";

export interface AppUsage {
  name: string;
  category: "Social" | "Productivity" | "Entertainment" | "Communication" | "Health" | "Other";
  minutes: number;
}

export interface CategoryUsage {
  category: string;
  minutes: number;
  color: string;
}

export interface HealthData {
  steps: number;
  sleepHours: number;
  sleepQuality: number;
  heartRateResting: number;
  heartRateAvg: number;
  activeMinutes: number;
  caloriesBurned: number;
  hydrationOz: number;
}

export interface CalendarEvent {
  title: string;
  category: "Work" | "Personal" | "Health" | "Social" | "Learning" | "Free";
  durationMinutes: number;
  startHour: number;
}

export interface CalendarCategory {
  category: string;
  minutes: number;
  color: string;
}

export interface DayData {
  date: string;
  totalScreenTimeMinutes: number;
  appUsage: AppUsage[];
  categoryUsage: CategoryUsage[];
  health: HealthData;
  events: CalendarEvent[];
  calendarCategories: CalendarCategory[];
}

const APP_COLORS: Record<string, string> = {
  Social: "#FF6B6B",
  Productivity: "#0066FF",
  Entertainment: "#7B61FF",
  Communication: "#00C67A",
  Health: "#FFB300",
  Other: "#6B7FA3",
};

const APP_COLORS_DARK: Record<string, string> = {
  Social: "#FF6B6B",
  Productivity: "#00CFFF",
  Entertainment: "#7B61FF",
  Communication: "#00E676",
  Health: "#FFB300",
  Other: "#7B9CC4",
};

export const CATEGORY_COLORS = APP_COLORS;
export const CATEGORY_COLORS_DARK = APP_COLORS_DARK;

export const CAL_COLORS: Record<string, string> = {
  Work: "#0066FF",
  Personal: "#FF6B6B",
  Health: "#00C67A",
  Social: "#FFB300",
  Learning: "#7B61FF",
  Free: "#6B7FA3",
};

export const CAL_COLORS_DARK: Record<string, string> = {
  Work: "#00CFFF",
  Personal: "#FF6B6B",
  Health: "#00E676",
  Social: "#FFB300",
  Learning: "#7B61FF",
  Free: "#7B9CC4",
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateDayData(dateStr: string, dayIndex: number): DayData {
  const r = (offset: number) => seededRandom(dayIndex * 37 + offset);

  const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;

  const social = Math.round((isWeekend ? 60 + r(1) * 80 : 25 + r(1) * 40));
  const productivity = Math.round((isWeekend ? 20 + r(2) * 30 : 60 + r(2) * 70));
  const entertainment = Math.round((isWeekend ? 50 + r(3) * 90 : 30 + r(3) * 50));
  const communication = Math.round((20 + r(4) * 40));
  const health = Math.round((10 + r(5) * 20));
  const other = Math.round((5 + r(6) * 15));

  const totalScreenTime = social + productivity + entertainment + communication + health + other;

  const rawApps: AppUsage[] = [
    { name: "Instagram", category: "Social", minutes: Math.round(social * 0.45) },
    { name: "TikTok", category: "Social", minutes: Math.round(social * 0.35) },
    { name: "Twitter / X", category: "Social", minutes: Math.round(social * 0.2) },
    { name: "Slack", category: "Productivity", minutes: Math.round(productivity * 0.4) },
    { name: "Google Docs", category: "Productivity", minutes: Math.round(productivity * 0.35) },
    { name: "Calendar", category: "Productivity", minutes: Math.round(productivity * 0.15) },
    { name: "Notes", category: "Productivity", minutes: Math.round(productivity * 0.1) },
    { name: "YouTube", category: "Entertainment", minutes: Math.round(entertainment * 0.55) },
    { name: "Netflix", category: "Entertainment", minutes: Math.round(entertainment * 0.35) },
    { name: "Spotify", category: "Entertainment", minutes: Math.round(entertainment * 0.1) },
    { name: "Messages", category: "Communication", minutes: Math.round(communication * 0.5) },
    { name: "Gmail", category: "Communication", minutes: Math.round(communication * 0.35) },
    { name: "WhatsApp", category: "Communication", minutes: Math.round(communication * 0.15) },
    { name: "Samsung Health", category: "Health", minutes: Math.round(health * 0.6) },
    { name: "Calm", category: "Health", minutes: Math.round(health * 0.4) },
    { name: "Chrome", category: "Other", minutes: Math.round(other * 0.7) },
    { name: "Settings", category: "Other", minutes: Math.round(other * 0.3) },
  ];
  const appUsage: AppUsage[] = rawApps.filter(a => a.minutes > 0).sort((a, b) => b.minutes - a.minutes);

  const categoryUsage: CategoryUsage[] = [
    { category: "Social", minutes: social, color: APP_COLORS.Social },
    { category: "Productivity", minutes: productivity, color: APP_COLORS.Productivity },
    { category: "Entertainment", minutes: entertainment, color: APP_COLORS.Entertainment },
    { category: "Communication", minutes: communication, color: APP_COLORS.Communication },
    { category: "Health", minutes: health, color: APP_COLORS.Health },
    { category: "Other", minutes: other, color: APP_COLORS.Other },
  ].sort((a, b) => b.minutes - a.minutes);

  const sleepHours = parseFloat((isWeekend ? 7.5 + r(10) * 2 : 6 + r(10) * 2).toFixed(1));
  const sleepQuality = Math.round(55 + r(11) * 40);
  const steps = Math.round((isWeekend ? 6000 + r(12) * 6000 : 4000 + r(12) * 8000));
  const heartRateResting = Math.round(58 + r(13) * 14);
  const heartRateAvg = Math.round(heartRateResting + 10 + r(14) * 20);
  const activeMinutes = Math.round((isWeekend ? 30 + r(15) * 60 : 20 + r(15) * 50));
  const caloriesBurned = Math.round(1800 + r(16) * 600);
  const hydrationOz = Math.round(40 + r(17) * 40);

  const healthData: HealthData = {
    steps,
    sleepHours,
    sleepQuality,
    heartRateResting,
    heartRateAvg,
    activeMinutes,
    caloriesBurned,
    hydrationOz,
  };

  const workMinutes = isWeekend ? Math.round(r(20) * 60) : Math.round(240 + r(20) * 180);
  const personalMinutes = Math.round(30 + r(21) * 60);
  const healthEventMinutes = Math.round(r(22) > 0.6 ? 30 + r(22) * 60 : 0);
  const socialEventMinutes = Math.round(isWeekend ? 60 + r(23) * 120 : r(23) * 60);
  const learningMinutes = Math.round(r(24) > 0.5 ? 30 + r(24) * 60 : 0);
  const freeMinutes = Math.round(60 + r(25) * 120);

  const events: CalendarEvent[] = [];
  if (workMinutes > 0) {
    events.push({ title: "Deep Work", category: "Work", durationMinutes: Math.round(workMinutes * 0.5), startHour: 9 });
    events.push({ title: "Team Standup", category: "Work", durationMinutes: 30, startHour: 10 });
    if (workMinutes > 180) {
      events.push({ title: "Project Review", category: "Work", durationMinutes: Math.round(workMinutes * 0.3), startHour: 14 });
    }
  }
  if (personalMinutes > 0) {
    events.push({ title: "Personal Time", category: "Personal", durationMinutes: personalMinutes, startHour: 7 });
  }
  if (healthEventMinutes > 0) {
    events.push({ title: isWeekend ? "Morning Run" : "Gym", category: "Health", durationMinutes: healthEventMinutes, startHour: isWeekend ? 8 : 6 });
  }
  if (socialEventMinutes > 0) {
    events.push({ title: isWeekend ? "Friends Brunch" : "Lunch", category: "Social", durationMinutes: socialEventMinutes, startHour: isWeekend ? 11 : 12 });
  }
  if (learningMinutes > 0) {
    events.push({ title: "Online Course", category: "Learning", durationMinutes: learningMinutes, startHour: 19 });
  }
  events.push({ title: "Wind Down", category: "Free", durationMinutes: freeMinutes, startHour: 21 });

  const calendarCategories: CalendarCategory[] = [
    { category: "Work", minutes: workMinutes, color: CAL_COLORS.Work },
    { category: "Personal", minutes: personalMinutes, color: CAL_COLORS.Personal },
    { category: "Health", minutes: healthEventMinutes, color: CAL_COLORS.Health },
    { category: "Social", minutes: socialEventMinutes, color: CAL_COLORS.Social },
    { category: "Learning", minutes: learningMinutes, color: CAL_COLORS.Learning },
    { category: "Free", minutes: freeMinutes, color: CAL_COLORS.Free },
  ].filter(c => c.minutes > 0).sort((a, b) => b.minutes - a.minutes);

  return {
    date: dateStr,
    totalScreenTimeMinutes: totalScreenTime,
    appUsage,
    categoryUsage,
    health: healthData,
    events,
    calendarCategories,
  };
}

function generateLast30Days(): DayData[] {
  const days: DayData[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatLocalDateKey(d);
    days.push(generateDayData(dateStr, 29 - i));
  }
  return days;
}

export const SAMPLE_DATA: DayData[] = generateLast30Days();

export function getToday(): DayData {
  return SAMPLE_DATA[SAMPLE_DATA.length - 1];
}

export function getDayByDate(dateStr: string): DayData | undefined {
  return SAMPLE_DATA.find(d => d.date === dateStr);
}

export function getLast7Days(): DayData[] {
  return SAMPLE_DATA.slice(-7);
}

export function getPrevious7Days(): DayData[] {
  return SAMPLE_DATA.slice(-14, -7);
}

export function getLast30Days(): DayData[] {
  return SAMPLE_DATA;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function isToday(dateStr: string): boolean {
  return dateStr === formatLocalDateKey();
}
