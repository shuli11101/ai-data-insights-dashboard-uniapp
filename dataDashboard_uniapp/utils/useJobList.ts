// 岗位列表：按关键词搜索


import { reactive, ref } from 'vue'

import { getJobList } from '@/api/server'

// 列表展示用的岗位项：接口字段 + 页面需要的派生字段
export interface JobRow {
	id: number
	job_name: string
	company: string
	salary_min: number
	salary_max: number
	experience: string
	skill_tags: string[]
	// 有超长标签，卡片上只显示「查看详情」
	isDescription: boolean
}

// 筛选条件：除分页外的请求参数，未指定的按空串提交
export type JobFilters = Partial<Omit<Parameters<typeof getJobList>[0], 'page' | 'size'>>

/**
 * 岗位列表：统一封装分页、加载状态与上拉加载逻辑，供各页面复用
 * @param getFilters 每次请求前取一次筛选条件，保证用的是页面最新的值
 */
export const useJobList = (getFilters: () => JobFilters = () => ({})) => {
	const list = ref<JobRow[]>([])
	const pagination = reactive({ page: 1, size: 10, total: 0 })

	// 是否还有下一页、是否正在请求
	const finished = ref(false)
	const loading = ref(false)

	// 拉取当前页：按 pagination.page 请求，并把新一页追加到列表后面
	const fetchList = async () => {
		if (loading.value || finished.value) return
		loading.value = true
		try {
			const res = await getJobList({
				page: pagination.page,
				size: pagination.size,
				jobName: '',
				city: '',
				experienceMin: '',
				experienceMax: '',
				salaryMin: '',
				salaryMax: '',
				keyword: '',
				...getFilters()
			})
			// 只追加新的一页，保留已加载的数据
			list.value.push(
				...res.list.map(item => ({
					...item,
					// 经验为空时统一显示为「无需经验」
					experience: item.experience || '无需经验',
					isDescription: item.skill_tags.some(tag => tag.length >= 10)
				}))
			)
			pagination.total = res.total
			// 已加载条数达到总数，说明没有更多了
			if (list.value.length >= res.total) finished.value = true
		} finally {
			loading.value = false
		}
	}

	// 首次加载 / 筛选条件变化后重新加载：回到第 1 页并清空已有数据
	const refresh = () => {
		pagination.page = 1
		pagination.total = 0
		list.value = []
		finished.value = false
		return fetchList()
	}

	// 划到底部时加载下一页
	const loadMore = () => {
		if (loading.value || finished.value) return
		pagination.page++
		return fetchList()
	}

	return { list, pagination, loading, finished, refresh, loadMore }
}
