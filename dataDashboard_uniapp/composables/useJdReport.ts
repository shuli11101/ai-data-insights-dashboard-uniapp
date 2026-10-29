import { computed, type ComputedRef } from 'vue'

import { sectionItems, type AISection } from '@/utils/aiText'

/**
 * JD 深度解读：把 AI 返回的分节文本整理成 jdPanel 需要的字段。
 * 详情页与 AI 分析页共用，避免各自维护一套解析规则。
 */
export function useJdReport(sections: ComputedRef<AISection[]>) {
	// 「字段名：值」类小节，按第一个冒号拆成标签与内容
	const splitPairs = (title: string) =>
		sectionItems(sections.value, title).map((text) => {
			const match = /^(.+?)[：:]\s*(.*)$/.exec(text.trim())
			return match ? { label: match[1]!, value: match[2]! } : { label: '', value: text }
		})

	// 按固定字段名从某个小节里取值，缺失时补「未提及」
	const pickFields = (title: string, labels: string[]) =>
		labels.map((label) => {
			const item = sectionItems(sections.value, title).find((text) => text.startsWith(label))
			const value = item?.slice(label.length).replace(/^[：:]\s*/, '').trim()
			return { label, value: value || '未提及' }
		})

	// 01 岗位基本信息
	const jdBasicInfo = computed(() =>
		pickFields('岗位基本信息', ['职位名称', '所属部门', '工作地点', '薪资范围'])
	)

	// 02 岗位职责
	const jdDuties = computed(() =>
		pickFields('岗位职责', ['日常做什么', '核心产出', '协作对象', '优先级判断'])
	)

	// 03 认知要求：内容按「、」拆成多个标签
	const knowledgeRequirements = computed(() =>
		['硬性要求', '软性要求'].map((label) => {
			const item = sectionItems(sections.value, '认知要求').find((text) => text.startsWith(label))
			const value = item?.slice(label.length).replace(/^[：:]\s*/, '').trim() ?? ''
			return { label, value: value ? value.split('、') : ['未提及'] }
		})
	)

	// 04 隐藏信息 / 05 面试准备方向：维度名由 AI 决定，不写死
	const jdHiddenInfo = computed(() => splitPairs('隐藏信息'))
	const jdInterviewPrep = computed(() => splitPairs('面试准备方向'))

	return { jdBasicInfo, jdDuties, knowledgeRequirements, jdHiddenInfo, jdInterviewPrep }
}
