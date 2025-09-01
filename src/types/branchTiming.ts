export interface Branch {
  id: string;
  name: string;
  address?: string;
  city?: string;
}

export interface TimeSlot {
  label: string;
}

export interface DaySchedule {
  day: string;
  date: string;
  slots: TimeSlot[];
}

export interface BranchTimingResponse {
  data: DaySchedule[];
}
