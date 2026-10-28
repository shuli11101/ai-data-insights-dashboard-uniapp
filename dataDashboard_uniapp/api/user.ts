import { http } from '@/utils/request'
import { isLuchRequestError } from 'luch-request'

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

/** 收藏职位（收藏数 +1），返回最新收藏数量 */
export const addFavorite = async (jobId: number): Promise<{ favoriteCount: number }> => {
	return (await http.post<{ favoriteCount: number }>('/user/favorite', { jobId })).data
}

/** 取消收藏：DELETE /user/favorite?jobId= */
export const removeFavorite = async (jobId: number): Promise<void> => {
	await http.delete('/user/favorite', { params: { jobId } })
}

/** 保存岗位匹配报告，分数由服务端从正文解析 */
export const saveMatchReport = async (jobId: number, content: string): Promise<{ score: number }> => {
	return (await http.post<{ score: number }>('/user/match-report', { jobId, content })).data
}

/** 已保存的匹配报告 */
export interface MatchReport {
	score: number
	content: string
	updateTime: string
}

/** 查询某个岗位已保存的匹配报告，未保存过返回 null */
export const getMatchReport = async (jobId: number): Promise<MatchReport | null> => {
	try {
		return (await http.get<MatchReport>('/user/match-report', { params: { jobId } })).data
	} catch (error) {
		// 404 表示还没有保存过，不当作错误
		const status = (error as { response?: { statusCode?: number } })?.response?.statusCode
		if (isLuchRequestError(error) && status === 404) {
			return null
		}
		throw error
	}
}
