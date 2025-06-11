export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: 'minimal' | 'moderate' | 'critical';
  labels: string[];
  assignedTo: { id: string; name: string }[];
  dueDate: string;
  section: TaskColumnType;
  createdBy: string;
  creationDate: string;
  lastUpdated: string;
  indicatorColor?: string;
};

export type TaskColumnType = 'assigned' | 'inProgress' | 'completed' | 'integration' | 'review' ; 