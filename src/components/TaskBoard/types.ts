export type Task = {
  id: string;
  title: string;
  description?: string;
};

export type TaskColumnType = 'assigned' | 'inProgress' | 'completed' | 'integration' | 'review' ; 