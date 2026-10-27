import { http } from '@/utils/request'

/** 用户基本信息（与 GET /api/user/profile 返回一致） */
export interface UserProfile {
	id: number
	/** 手机号 */
	phone: string
	/** 昵称 */
	nickname: string
	/** 头像地址，空串表示没有，前端用昵称首字兜底 */
	avatar: string
	/** 当前职位 */
	currentJob: string
	/** 所在城市 */
	location: string
	/** 工作经验，如「3-5年」 */
	experience: string
	/** 分析报告数量 */
	reportCount: number
	/** 收藏职位数量 */
	favoriteCount: number
	/** 求职状态：后端暂未返回，返回后可直接展示 */
	jobStatus?: string
	/** 平均匹配度（0-100）：后端暂未返回 */
	avgMatch?: number
}

/** 获取当前登录用户的基本信息 */
export const getUserProfile = async (): Promise<UserProfile> => {
	return (await http.get<UserProfile>('/user/profile')).data
}
