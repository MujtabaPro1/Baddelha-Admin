export interface Branch {
  id: string;
  name: string;
  enName?: string;
  address?: string;
  city?: string;
  is_active?: boolean;
}

export interface TimeSlot {
  id?: string;
  label: string;
  startHour: number;
  startMinute: number;
  capacity: number;
  isActive: boolean;
}

export interface DaySchedule {
  id?: string;
  day: string;
  isActive: boolean;
  slots: TimeSlot[];
}

export interface PublicHoliday {
  id: string;
  name: string;
  day: number;
  month: number;
  year: number | null;
  isActive: boolean;
}
