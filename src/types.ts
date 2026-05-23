export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string; // YYYY-MM-DD
};

export type CycleRecord = {
  date: string; // YYYY-MM-DD
  status: 'none' | 'light' | 'medium' | 'heavy';
  symptoms: string[];
  notes: string;
};

export type Photo = {
  id: string;
  dataUrl: string;
  createdAt: number;
  caption?: string;
};

export type AppState = {
  anniversaryDate: string | null;
  todos: Todo[];
  cycleRecords: Record<string, CycleRecord>;
  photos: Photo[];
};
