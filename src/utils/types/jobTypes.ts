// types/job.ts
export type Job = {
    id: string
    title: string
    description: string
    location: string
    salary_range: string
    skills: string[]
    createdAt: Date
    updatedAt: Date
  }
  
  export interface JobRequest extends Request {
    user?: {
      user_id: number;
      role_id: number;
    };
    params: {
      id: string;
    };
  }
  