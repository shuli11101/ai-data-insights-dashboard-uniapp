import { http } from '@/utils/request'

interface JobPosition {
  id: number
  job_name: string
  company: string
  salary_min: number
  salary_max: number
  experience: string
  skill_tags: string[]
}

export interface PersonalInfo {
  education: string
  experience: string
  skills: string[]
  city: string
  currentSalary: number | undefined
  expectedSalary: number | undefined
}

// 获取岗位数据
export const getJobList = async (params: { page: number; size: number, city: string, experienceMin: string, experienceMax: string, salaryMin: string, salaryMax: string, keyword: string, jobName: string }) => {
  return (await http.get<{ list: JobPosition[], total: number }>('/home/jobList', { params })).data
}

// 岗位详情：后端返回 salary_min / salary_max，这里统一转成 camelCase
interface JobDetailRaw {
  id: number
  job_name: string
  company: string
  salary_min: number
  salary_max: number
  experience: string
  skill_tags: string[]
  city: string
  district: string
  publish_date: string
  created_at: string
}

export interface JobDetail extends Omit<JobDetailRaw, 'salary_min' | 'salary_max'> {
  salaryMin: number
  salaryMax: number
}

// 获取岗位详情，id 通过 query 参数传入
export const getJobDetail = async (id: number): Promise<JobDetail> => {
  const { salary_min, salary_max, ...rest } = (await http.get<JobDetailRaw>('/home/jobDetail', { params: { id } })).data
  return { ...rest, salaryMin: salary_min, salaryMax: salary_max }
}

// 获取薪资分布数据
export const getSalaryRange = async () => {
  return (await http.get<{ salary_range: string; jobCount: number }[]>('/home/salaryRange')).data
}

// 获取技术栈热度数据
export const getSkillTags = async () => {
  return (await http.get<{ skill_tag: string; hot_count: number }[]>('/home/skillTags')).data
}

// 获取地方岗位数量数据
export const getDistrict = async () => {
  return (await http.get<{ area_name: string; job_count: number }[]>('/home/district')).data
}

// 获取工作经验对应平均薪资数据
export const getExperienceSalary = async () => {
  return (await http.get<{ experience: string; avg_salary: number }[]>('/home/experienceSalary')).data
}

// 获取城市数据
export const getCity = async () => {
  return (await http.get<{ city: string }[]>('/home/city')).data
}

// 获取技术关键词
export const getKeywords = async () => {
  return (await http.get<{ skill: string }[]>('/home/keywords')).data
}

// 获取客户端 IP（浏览器读不到本机 IP，由服务端根据请求来源返回）
export const getClientIp = async () => {
  return (await http.get<{ ip: string }>('/ip')).data
}

// 判断当前 IP 是否已填写过问卷（服务端按请求来源判断，无需前端传 IP）
export const getSurveyStatus = async () => {
  return (await http.get<{ filled: boolean }>('/surveyStatus')).data
}

// 将用户基础信息存入数据库（ip 由服务端从请求中获取，无需前端传）
export const setPersonalInfo = async (body: PersonalInfo) => {
  return (await http.post<{ id: string }>('/setPersonalInfo', body)).data
}

// 获取当前 IP 已提交的个人信息，用于表单回显（未提交过返回 null）
export const getPersonal = async () => {
  return (await http.get<PersonalInfo | null>('/getPersonal')).data
}
