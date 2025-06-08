export interface File {
  id: string;
  name: string;
  size: string;
  type: 'excel' | 'png' | 'docx' | 'pdf' | 'pptx'; // Example file types
} 