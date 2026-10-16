import { http } from '@/utils/request'

// 获取城市列表
export const getCityListAsync = async () => {
  return (await http.get<{ name: string }[]>('/home/cityList')).data
}
