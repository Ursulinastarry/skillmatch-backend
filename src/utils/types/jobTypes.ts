// types/job.ts
export type Job = {
    id: number
    title: string
    description: string
    location: string
    salary_range: string
    skills: string[]
    createdAt: Date
    updatedAt: Date
  }
  
  export type JobRequest = {
    params: any
    id: number
    title: string
    description: string
    location: string
    salary_range: string
    skills: string[]
  }
  