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
	averageScore?: number
}

/** 获取当前登录用户的基本信息 */
export const getUserProfile = async (): Promise<UserProfile> => {
	return (await http.get<UserProfile>('/user/profile')).data
}

/** 更新用户资料的请求体 */
export interface UpdateUserProfileParams {
	nickname: string
	avatar: string
	currentJob: string
	location: string
}

/** 更新当前登录用户的基本信息：PUT /user/profile */
export const updateUserProfile = async (body: UpdateUserProfileParams): Promise<UserProfile> => {
	return (await http.put<UserProfile>('/user/profile', body)).data
}

/**
 * 上传头像，返回可直接访问的图片地址
 * 注意：接口地址与字段名（file）需与后端确认
 */
export const uploadAvatar = async (filePath: string): Promise<{ url: string }> => {
	const res = await http.upload<{ url: string }>({
		url: '/user/avatar',
		filePath,
		name: 'file'
	})
	return res.data as { url: string }
}

/** 收藏职位（收藏数 +1），返回最新收藏数量 */
export const addFavorite = async (jobId: number): Promise<{ favoriteCount: number }> => {
	return (await http.post<{ favoriteCount: number }>('/user/favorite', { jobId })).data
}

/** 取消收藏：DELETE /user/favorite?jobId= */
export const removeFavorite = async (jobId: number): Promise<void> => {
	await http.delete('/user/favorite', { params: { jobId } })
}

/** 收藏职位列表项 */
export interface FavoriteJobItem {
	id: number
	company: string
	jobName: string
	city: string
	district: string
	/** 薪资下限（K） */
	salaryMin: number
	/** 薪资上限（K） */
	salaryMax: number
	experience: string
	skillTags: string[]
	/** 岗位发布时间 */
	publishDate: string
	/** 收藏时间 */
	favoriteTime: string
}

/** 获取当前用户的收藏职位列表，按收藏时间倒序：GET /user/favorite/list */
export const getFavoriteList = async (): Promise<{ list: FavoriteJobItem[]; total: number }> => {
	return (await http.get<{ list: FavoriteJobItem[]; total: number }>('/user/favorite/list')).data
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

/** 分析报告详情：报告正文 + 对应岗位信息 */
export interface MatchReportDetail {
	report: {
		id: number
		/** 综合匹配分（0-100） */
		score: number
		/** 报告正文（markdown 分节文本） */
		content: string
		createTime: string
		updateTime: string
	}
	job: {
		id: number
		jobName: string
		company: string
		city: string
		district: string
		/** 薪资下限（K） */
		salaryMin: number
		/** 薪资上限（K） */
		salaryMax: number
		experience: string
		skillTags: string[]
	}
}

/** 查看分析报告详情：GET /user/match-report/detail?jobId=，报告不存在时返回 null */
export const getMatchReportDetail = async (jobId: number): Promise<MatchReportDetail | null> => {
	try {
		return (
			await http.get<MatchReportDetail>('/user/match-report/detail', { params: { jobId } })
		).data
	} catch (error) {
		// 404 表示该岗位还没有报告
		const status = (error as { response?: { statusCode?: number } })?.response?.statusCode
		if (isLuchRequestError(error) && status === 404) {
			return null
		}
		throw error
	}
}

/** 分析报告列表项 */
export interface MatchReportItem {
	/** 报告 id */
	reportId: number
	/** 岗位 id，用于跳转报告详情 */
	jobId: number
	/** 岗位名称 */
	jobName: string
	/** 公司 */
	company: string
	/** 工作地点，如 深圳·南山区 */
	location: string
	/** 经验要求，如 3-4年经验 */
	experience: string
	/** 技能覆盖率（0-100） */
	skillCoverage: number
	/** 薪资偏差（%）：正数表示偏高，负数表示偏低 */
	salaryDeviation: number
	/** 综合匹配分（0-100） */
	score: number
	/** 报告生成时间 */
	saveTime: string
}

/** 获取当前用户的分析报告列表，按生成时间倒序：GET /user/match-report/list */
export const getMatchReportList = async (): Promise<{ list: MatchReportItem[]; total: number }> => {
	return (await http.get<{ list: MatchReportItem[]; total: number }>('/user/match-report/list')).data
}

/** 批量删除分析报告：DELETE /user/match-report，body { jobIds } */
export const deleteMatchReports = async (jobIds: number[]): Promise<void> => {
	// luch-request 的 delete() 快捷方法类型上不允许 data，用 request() 发 DELETE 才能带请求体
	await http.request({
		url: '/user/match-report',
		method: 'DELETE',
		data: { jobIds }
	})
}
