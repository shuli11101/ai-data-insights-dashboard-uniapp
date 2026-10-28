<template>
	<!-- 单轮分析结果：按场景渲染技术栈 / JD 报告，返回按钮交给外层处理 -->
	<SkillPanel v-if="scene === 'skill'" :matchScore="matchScore" :abovePercent="abovePercent" :sections="sections"
		:salaryRange="salaryRange" :targetJob="targetJob" :salaryMedian="salaryMedian"
		:coreAdvantages="coreAdvantages" :skillGaps="skillGaps" :jobAdvice="jobAdvice" back-text="返回"
		@goBack="emit('back')" />

	<JdPanel v-else :jdBasicInfo="jdBasicInfo" :jdDuties="jdDuties" :knowledgeRequirements="knowledgeRequirements"
		:jdInterviewPrep="jdInterviewPrep" :jdHiddenInfo="jdHiddenInfo" back-text="返回" @goBack="emit('back')" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import JdPanel from '@/components/aiAnalyse/jdPanel.vue'
import SkillPanel from '@/components/aiAnalyse/skillPanel.vue'
import { parseSections, sectionEntries, sectionItems, sectionNumber, sectionText } from '@/utils/aiText'

const props = defineProps<{
	/** 分析场景：skill = 技术栈评估，jd = JD 匹配 */
	scene: 'skill' | 'jd'
	/** AI 原始输出（markdown 小节） */
	text: string
}>()

const emit = defineEmits<{
	(e: 'back'): void
}>()

const sections = computed(() => parseSections(props.text))

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

// ===== 技术栈评估 =====
const matchScore = computed(() => clampPercent(sectionNumber(sections.value, '匹配度评分')))
const abovePercent = computed(() => clampPercent(sectionNumber(sections.value, '超越比例')))
const salaryRange = computed(() => sectionText(sections.value, '薪资预估'))
const targetJob = computed(() => sectionText(sections.value, '目标岗位'))
const salaryMedian = computed(() => sectionText(sections.value, '市场中位数'))
const coreAdvantages = computed(() => sectionEntries(sections.value, '核心优势'))
const skillGaps = computed(() => sectionItems(sections.value, '待补充技能'))
const jobAdvice = computed(() => sectionItems(sections.value, '求职建议'))

// ===== JD 匹配 =====
const JD_BASIC_FIELDS = ['职位名称', '所属部门', '工作地点', '薪资范围']
const jdBasicInfo = computed(() =>
	JD_BASIC_FIELDS.map((label) => {
		const item = sectionItems(sections.value, '岗位基本信息').find((text) => text.startsWith(label))
		const value = item?.slice(label.length).replace(/^[：:]\s*/, '').trim()
		return { label, value: value || '未提及' }
	})
)

const JD_BASIC_DUTIES_FIELDS = ['日常做什么', '核心产出', '协作对象', '优先级判断']
const jdDuties = computed(() =>
	JD_BASIC_DUTIES_FIELDS.map((label) => {
		const item = sectionItems(sections.value, '岗位职责').find((text) => text.startsWith(label))
		const value = item?.slice(label.length).replace(/^[：:]\s*/, '').trim()
		return { label, value: value || '未提及' }
	})
)

const KNOWLEDGE_FIELDS = ['硬性要求', '软性要求']
const knowledgeRequirements = computed(() =>
	KNOWLEDGE_FIELDS.map((label) => {
		const item = sectionItems(sections.value, '认知要求').find((text) => text.startsWith(label)) || ''
		const value = item?.slice(label.length).replace(/^[：:]\s*/, '').trim().split('、') || []
		return { label, value: value || '未提及' }
	})
)

const splitPairs = (title: string) =>
	sectionItems(sections.value, title).map((text) => {
		const match = /^(.+?)[：:]\s*(.*)$/.exec(text.trim())
		return match ? { label: match[1]!, value: match[2]! } : { label: '', value: text }
	})

const jdHiddenInfo = computed(() => splitPairs('隐藏信息'))
const jdInterviewPrep = computed(() => splitPairs('面试准备方向'))
</script>
