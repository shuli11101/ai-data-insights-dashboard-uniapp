<template>
	<view class="personal-page">
		<!-- ===== 顶部导航 ===== -->
		<view class="appbar" :style="{ marginTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack"></view>
			<text class="appbar-title">求职意向</text>
		</view>

		<!-- ===== 意向表单纸 ===== -->
		<view class="sheet">
			<!-- 引导提示 -->
			<view class="guide">
				<view class="guide-icon"></view>
				<view class="guide-text">
					<text class="guide-title">填写后，推荐会更贴近你的期望</text>
					<text class="guide-desc">城市、技术栈与薪资都会参与岗位排序</text>
				</view>
			</view>

			<!-- 基本意向 -->
			<view class="group">
				<text class="group-label">基本意向</text>

				<!-- 职位名称 -->
				<view class="text-row">
					<image class="text-row-icon" src="/static/icon/user/edit.svg" mode="aspectFit" />
					<text class="text-row-title">职位名称</text>
					<input class="text-row-input" v-model="jobTitle" maxlength="30" placeholder="如：前端开发工程师"
						placeholder-style="color:#a1acb3;font-size:25rpx;text-align:right" />
				</view>

				<view class="row-divider"></view>

				<choicePicker v-model="jobStatus" title="求职状态" icon="/static/icon/user/activity.svg"
					:options="JOB_STATUS_OPTIONS" />

				<view class="row-divider"></view>

				<experienceRange v-model:min="experienceMin" v-model:max="experienceMax" title="工作经验"
					icon="/static/icon/user/briefcase.svg" />

				<view class="row-divider"></view>

				<!-- 意向城市：与搜索页一致的热门城市 + 字母分组面板 -->
				<cityPicker v-model="city">
					<template #trigger="{ selected, toggle }">
						<view class="city-row" @click="toggle">
							<image class="city-row-icon" src="/static/icon/user/pin.svg" mode="aspectFit" />
							<text class="city-row-title">意向城市</text>
							<text class="city-row-value" :class="{ 'is-placeholder': !selected }">
								{{ selected || '请选择' }}
							</text>
							<view class="city-row-arrow"></view>
						</view>
					</template>
				</cityPicker>

				<view class="row-divider"></view>

				<choicePicker v-model="education" title="学历" icon="/static/icon/user/graduation.svg"
					:options="EDUCATION_OPTIONS" />
			</view>

			<!-- 技术栈 -->
			<view class="group">
				<view class="group-head">
					<text class="group-label">技术栈</text>
					<text class="group-note">最多 {{ SKILL_MAX }} 项</text>
				</view>

				<view class="stack-tags">
					<view class="stack-tag" v-for="skill in skills" :key="skill">
						<text class="stack-tag-text">{{ skill }}</text>
						<view class="stack-tag-close" @click="removeSkill(skill)"></view>
					</view>
				</view>

				<!-- 展开搜索与可选技术栈 -->
				<view class="stack-add" @click="skillPanelOpen = !skillPanelOpen">
					<view class="stack-add-icon">
						<view class="plus-line plus-line--h"></view>
						<view class="plus-line plus-line--v"></view>
					</view>
					<text class="stack-add-text">{{ skillPanelOpen ? '收起技术栈' : '添加技术栈' }}</text>
					<text class="stack-add-note">支持自定义</text>
				</view>

				<view class="skill-panel" v-if="skillPanelOpen">
					<view class="skill-search">
						<view class="skill-search-icon"></view>
						<input class="skill-search-input" v-model="skillKeyword" placeholder="搜索技术栈"
							placeholder-style="color:#a1acb3;font-size:26rpx" />
						<view class="skill-search-clear" v-if="skillKeyword" @click="skillKeyword = ''"></view>
					</view>

					<scroll-view class="skill-options" scroll-y>
						<view class="skill-option-list">
							<text class="skill-option" :class="{ 'is-selected': skills.includes(skill) }"
								v-for="skill in filteredSkills" :key="skill" @click="toggleSkill(skill)">{{ skill
								}}</text>
						</view>
					</scroll-view>

					<!-- 搜索无匹配时，可把输入内容作为自定义技术栈 -->
					<view class="skill-custom" v-if="canAddCustom" @click="toggleSkill(skillKeyword.trim())">
						<text class="skill-custom-text">添加自定义：「{{ skillKeyword.trim() }}」</text>
					</view>
				</view>
			</view>

			<!-- 薪资情况 -->
			<view class="group">
				<view class="group-head">
					<text class="group-label">薪资情况</text>
					<text class="group-note">均为税前</text>
				</view>

				<!-- 月薪 / 年薪切换 -->
				<view class="segmented">
					<view class="segment" :class="{ 'segment--active': salaryMode === 'month' }"
						@click="salaryMode = 'month'">月薪
					</view>
					<view class="segment" :class="{ 'segment--active': salaryMode === 'year' }"
						@click="salaryMode = 'year'">年薪
					</view>
				</view>

				<salaryPicker v-model="currentSalary" title="当前薪资" :mode="salaryMode" />

				<view class="row-divider row-divider--full"></view>

				<salaryPicker v-model="expectedSalary" title="期望薪资" :mode="salaryMode" />

				<text class="salary-hint" v-if="salaryHint">{{ salaryHint }}</text>
			</view>
		</view>

		<!-- ===== 固定保存栏 ===== -->
		<view class="save-bar">
			<view class="save-btn" @click="saveJobIntent()">
				<text class="save-text">保存求职意向</text>
			</view>

			<view class="privacy-note">
				<image class="privacy-icon" src="/static/icon/user/lock.svg" mode="aspectFit" />
				<text class="privacy-text">求职意向仅用于岗位匹配，不会公开</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { getKeywords, getPersonal, setPersonalInfo } from '@/api/server'
import choicePicker from '@/components/user/choicePicker.vue'
import cityPicker from '@/components/user/cityPicker.vue'
import experienceRange from '@/components/user/experienceRange.vue'
import salaryPicker, { nearestSalaryOption, type SalarySelection } from '@/components/user/salaryPicker.vue'
import { getErrorMessage } from '@/utils/request'
import { computed, onMounted, ref } from 'vue'

// 自定义导航栏需自行避开状态栏
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight ?? 0

// 职位名称与求职状态
const jobTitle = ref('')
const JOB_STATUS_OPTIONS = ['求职中', '在职', '离职']
const jobStatus = ref(JOB_STATUS_OPTIONS[0])

// 基本意向：工作经验用滑块选择区间，0~10 年
const EXPERIENCE_MAX = 10
const experienceMin = ref(0)
const experienceMax = ref(EXPERIENCE_MAX)
const city = ref('')
const education = ref('')

// 学历选项：与搜索页一致
const EDUCATION_OPTIONS = ['不限', '大专', '本科', '硕士', '博士']

// ===== 技术栈 =====
const SKILL_MAX = 8
// 已选技术栈
const skills = ref<string[]>([])
// 可选技术栈（接口返回）
const skillOptions = ref<string[]>([])
const skillKeyword = ref('')
const skillPanelOpen = ref(false)

// 搜索过滤：忽略大小写
const filteredSkills = computed(() => {
	const keyword = skillKeyword.value.trim().toLowerCase()
	if (!keyword) return skillOptions.value
	return skillOptions.value.filter((skill) => skill.toLowerCase().includes(keyword))
})

// 输入内容不在列表里时，允许添加为自定义技术栈
const canAddCustom = computed(() => {
	const keyword = skillKeyword.value.trim()
	return !!keyword && !skillOptions.value.includes(keyword)
})

// 技术栈候选列表
const loadSkillOptions = async () => {
	try {
		const res = await getKeywords()
		skillOptions.value = res.map(({ skill }) => skill)
	} catch (error) {
		console.error('[personal] 获取技术栈列表失败', error)
	}
}

// 选中 / 取消选中技术栈
const toggleSkill = (skill: string) => {
	if (skills.value.includes(skill)) {
		removeSkill(skill)
		return
	}
	if (skills.value.length >= SKILL_MAX) {
		uni.showToast({ title: `最多选择 ${SKILL_MAX} 项`, icon: 'none' })
		return
	}
	skills.value = [...skills.value, skill]
}

const removeSkill = (skill: string) => {
	skills.value = skills.value.filter((item) => item !== skill)
}

// ===== 薪资 =====
// 展示模式：月薪直接显示 K，年薪按月薪 × 薪数换算成万
const salaryMode = ref<'month' | 'year'>('month')
const currentSalary = ref<SalarySelection>({ salary: 1, months: 12 })
const expectedSalary = ref<SalarySelection>({ salary: 1, months: 12 })

// 月薪 × 薪数 → 万（20K × 14 = 28 万）
const toWan = (value: number) => Number((value / 10).toFixed(1))

// 期望年薪提示：年薪模式下重复，不再展示
const salaryHint = computed(() => {
	if (salaryMode.value === 'year') return ''
	const { salary, months } = expectedSalary.value
	return `按 ${months} 薪计算，期望年薪包约 ${toWan(salary * months)} 万`
})

// 把接口返回的经验文案还原成滑块区间，兼容「3-5 年」「3 年以上」「3 年」
const parseExperience = (value: string) => {
	const nums = (value.match(/\d+/g) ?? []).map(Number)
	if (!nums.length) {
		experienceMin.value = 0
		experienceMax.value = EXPERIENCE_MAX
		return
	}
	experienceMin.value = Math.min(nums[0], EXPERIENCE_MAX)
	experienceMax.value = value.includes('以上')
		? EXPERIENCE_MAX
		: Math.min(nums[1] ?? nums[0], EXPERIENCE_MAX)
}

// 工作经验：提交格式与后端一致（如 3-5年 / 3年以上 / 不限）
const experienceLabel = computed(() => {
	const min = experienceMin.value
	const max = experienceMax.value
	if (min === 0 && max === EXPERIENCE_MAX) return '不限'
	if (min === max) return `${min}年`
	return max === EXPERIENCE_MAX ? `${min}年以上` : `${min}-${max}年`
})

// 把后端返回的月薪（元）对齐到 picker 档位
const toSalarySelection = (yuan: number): SalarySelection => {
	return { salary: nearestSalaryOption(yuan / 1000), months: 12 }
}

// 查询偏好设置：字段名与后端返回一致
const loadPersonalInfo = async () => {
	try {
		const res = await getPersonal()

		if (!res) return

		// education / experience / skills / city / currentSalary / expectedSalary
		education.value = res.education ?? ''
		city.value = res.city ?? ''
		skills.value = res.skills ?? []
		if (res.jobTitle != null) jobTitle.value = res.jobTitle
		if (res.jobStatus != null) jobStatus.value = res.jobStatus
		parseExperience(res.experience ?? '')
		if (res.currentSalary != null) {
			currentSalary.value = toSalarySelection(res.currentSalary)
		}
		if (res.expectedSalary != null) {
			expectedSalary.value = toSalarySelection(res.expectedSalary)
		}
	} catch (error) {
		console.error('[personal] 获取偏好设置失败', error)
	}
}

onMounted(() => {
	loadPersonalInfo()
	loadSkillOptions()
})

// 保存求职意向：POST /api/setPersonalInfo
const saveJobIntent = async () => {
	try {
		const res = await setPersonalInfo({
			city: city.value,
			jobTitle: jobTitle.value.trim(),
			experience: experienceLabel.value,
			education: education.value,
			skills: skills.value,
			// 后端按「元」存储，picker 里是 K
			currentSalary: currentSalary.value.salary * 1000,
			expectedSalary: expectedSalary.value.salary * 1000,
			jobStatus: jobStatus.value
		})
		console.log(res)
		uni.showToast({ title: '保存成功', icon: 'success' })
	} catch (error) {
		console.error('[personal] 保存求职意向失败', error)
		uni.showToast({ title: getErrorMessage(error, '保存失败，请稍后重试'), icon: 'none' })
	}
}

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.personal-page {
	box-sizing: border-box;
	width: 100%;
	min-height: 100vh;
	padding: 32rpx 0 calc(220rpx + env(safe-area-inset-bottom));

	// ===== 顶部导航 =====
	.appbar {
		position: relative;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		height: 88rpx;
		padding: 0 40rpx;

		/* 返回：白色圆钮 + 描边箭头 */
		.back {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			box-sizing: border-box;
			width: 74rpx;
			height: 74rpx;
			background-color: #ffffff;
			border: 2rpx solid #d8e2e3;
			border-radius: 50%;

			&::after {
				content: '';
				width: 18rpx;
				height: 18rpx;
				border-left: 3rpx solid #3d4b54;
				border-bottom: 3rpx solid #3d4b54;
				transform: rotate(45deg);
			}
		}

		.appbar-title {
			position: absolute;
			left: 50%;
			font-size: 30rpx;
			font-weight: 600;
			line-height: 1;
			letter-spacing: -0.4rpx;
			color: #17252b;
			transform: translateX(-50%);
		}
	}

	// ===== 表单纸 =====
	.sheet {
		box-sizing: border-box;
		margin-top: 24rpx;
		padding: 28rpx 40rpx 40rpx;
		background-color: #ffffff;
		border-radius: 44rpx 44rpx 0 0;
	}

	// ===== 引导提示 =====
	.guide {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		padding: 20rpx 28rpx;
		background-color: #f1f9f7;
		border-radius: 24rpx;

		.guide-icon {
			position: relative;
			flex-shrink: 0;
			box-sizing: border-box;
			width: 28rpx;
			height: 28rpx;
			border: 2rpx solid #487c77;
			border-radius: 50%;

			&::after {
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				width: 8rpx;
				height: 8rpx;
				margin: -4rpx 0 0 -4rpx;
				background-color: #487c77;
				border-radius: 50%;
			}
		}

		.guide-text {
			min-width: 0;
			margin-left: 16rpx;
		}

		.guide-title {
			display: block;
			font-size: 23rpx;
			font-weight: 600;
			line-height: 1.3;
			color: #17252b;
		}

		.guide-desc {
			display: block;
			margin-top: 4rpx;
			font-size: 20rpx;
			line-height: 1.3;
			color: #65747c;
		}
	}

	// ===== 分组 =====
	.group {
		margin-top: 44rpx;

		&:first-of-type {
			margin-top: 36rpx;
		}
	}

	.group-label {
		display: block;
		font-size: 24rpx;
		font-weight: 600;
		line-height: 1.2;
		letter-spacing: 0.4rpx;
		color: #78868f;
	}

	.group-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.group-note {
		font-size: 21rpx;
		line-height: 1.2;
		color: #8a979e;
	}

	// ===== 意向城市触发器（cityPicker 的 trigger 插槽） =====
	.city-row {
		display: flex;
		align-items: center;
		height: 112rpx;
	}

	.city-row-icon {
		flex-shrink: 0;
		width: 30rpx;
		height: 30rpx;
	}

	.city-row-title {
		flex: 1;
		min-width: 0;
		margin-left: 20rpx;
		font-size: 27rpx;
		line-height: 1.2;
		color: #3d4b54;
	}

	.city-row-value {
		flex-shrink: 0;
		margin-left: 16rpx;
		font-size: 25rpx;
		font-weight: 500;
		line-height: 1.2;
		color: #3d4b54;

		// 未选择时用浅色提示
		&.is-placeholder {
			font-weight: 400;
			color: #a1acb3;
		}
	}

	.city-row-arrow {
		flex-shrink: 0;
		width: 12rpx;
		height: 12rpx;
		margin-left: 14rpx;
		border-top: 2rpx solid #9aa6ac;
		border-right: 2rpx solid #9aa6ac;
		transform: rotate(45deg);
	}

	// ===== 职位名称输入行 =====
	.text-row {
		display: flex;
		align-items: center;
		height: 112rpx;
	}

	.text-row-icon {
		flex-shrink: 0;
		width: 30rpx;
		height: 30rpx;
	}

	.text-row-title {
		flex-shrink: 0;
		margin-left: 20rpx;
		font-size: 27rpx;
		line-height: 1.2;
		color: #3d4b54;
	}

	.text-row-input {
		flex: 1;
		min-width: 0;
		height: 100%;
		margin-left: 16rpx;
		font-size: 25rpx;
		text-align: right;
		color: #3d4b54;
	}

	// ===== 列表行 =====
	.row-divider {
		height: 2rpx;
		margin-left: 50rpx;
		background-color: #edf2f2;

		&--full {
			margin-left: 0;
		}
	}

	// ===== 技术栈 =====
	.stack-tags {
		display: flex;
		flex-wrap: wrap;
		column-gap: 12rpx;
		row-gap: 14rpx;
		margin-top: 18rpx;

		.stack-tag {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			height: 60rpx;
			padding: 0 20rpx;
			background-color: #f1f9f7;
			border-radius: 14rpx;

			.stack-tag-text {
				font-size: 23rpx;
				line-height: 1;
				color: #3d4b54;
			}

			/* 关闭：两条 45° 细线组成的叉 */
			.stack-tag-close {
				position: relative;
				width: 16rpx;
				height: 16rpx;
				margin-left: 12rpx;

				&::before,
				&::after {
					content: '';
					position: absolute;
					top: 50%;
					left: 0;
					width: 16rpx;
					height: 2rpx;
					background-color: #7b8d89;
					border-radius: 1rpx;
				}

				&::before {
					transform: rotate(45deg);
				}

				&::after {
					transform: rotate(-45deg);
				}
			}
		}
	}

	.stack-add {
		display: flex;
		align-items: center;
		margin-top: 24rpx;

		.stack-add-icon {
			position: relative;
			flex-shrink: 0;
			box-sizing: border-box;
			width: 48rpx;
			height: 48rpx;
			background-color: #f1f9f7;
			border-radius: 50%;

			.plus-line {
				position: absolute;
				top: 50%;
				left: 50%;
				background-color: #007c77;
				border-radius: 1rpx;
				transform: translate(-50%, -50%);

				&--h {
					width: 20rpx;
					height: 2rpx;
				}

				&--v {
					width: 2rpx;
					height: 20rpx;
				}
			}
		}

		.stack-add-text {
			margin-left: 16rpx;
			font-size: 25rpx;
			font-weight: 500;
			line-height: 1;
			color: #007c77;
		}

		.stack-add-note {
			margin-left: auto;
			font-size: 21rpx;
			line-height: 1;
			color: #8a979e;
		}
	}

	// ===== 技术栈选择面板 =====
	.skill-panel {
		margin-top: 24rpx;
		padding: 20rpx;
		background-color: #f8fbfa;
		border: 2rpx solid #e3ebec;
		border-radius: 20rpx;

		.skill-search {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			height: 76rpx;
			padding: 0 24rpx;
			background-color: #ffffff;
			border: 2rpx solid #d8e2e3;
			border-radius: 16rpx;
		}

		// 放大镜：圆 + 手柄
		.skill-search-icon {
			position: relative;
			flex-shrink: 0;
			width: 24rpx;
			height: 24rpx;
			border: 3rpx solid #9aa6ac;
			border-radius: 50%;

			&::after {
				content: '';
				position: absolute;
				right: -8rpx;
				bottom: -4rpx;
				width: 10rpx;
				height: 3rpx;
				background-color: #9aa6ac;
				border-radius: 2rpx;
				transform: rotate(45deg);
			}
		}

		.skill-search-input {
			flex: 1;
			min-width: 0;
			height: 100%;
			margin-left: 16rpx;
			font-size: 26rpx;
			color: #17252b;
		}

		.skill-search-clear {
			position: relative;
			flex-shrink: 0;
			width: 24rpx;
			height: 24rpx;

			&::before,
			&::after {
				content: '';
				position: absolute;
				top: 50%;
				left: 0;
				width: 24rpx;
				height: 2rpx;
				background-color: #a1acb3;
			}

			&::before {
				transform: rotate(45deg);
			}

			&::after {
				transform: rotate(-45deg);
			}
		}

		.skill-options {
			height: 380rpx;
			margin-top: 20rpx;
		}

		.skill-option-list {
			display: flex;
			flex-wrap: wrap;
			gap: 14rpx;
		}

		// 可选技术栈：宽度随文字自适应，一行排多个
		.skill-option {
			padding: 14rpx 22rpx;
			font-size: 24rpx;
			line-height: 1;
			color: #3d4b54;
			background-color: #ffffff;
			border: 2rpx solid #e3ebec;
			border-radius: 12rpx;

			&.is-selected {
				font-weight: 600;
				color: #007c77;
				background-color: #e8f7f4;
				border-color: #b9e2dc;
			}
		}

		// 自定义技术栈入口
		.skill-custom {
			display: flex;
			align-items: center;
			margin-top: 18rpx;
			padding: 16rpx 20rpx;
			background-color: #ffffff;
			border: 2rpx dashed #b9e2dc;
			border-radius: 12rpx;

			.skill-custom-text {
				font-size: 24rpx;
				line-height: 1.2;
				color: #007c77;
			}
		}
	}

	// ===== 薪资情况 =====
	.segmented {
		display: flex;
		box-sizing: border-box;
		width: 280rpx;
		height: 68rpx;
		margin-top: 18rpx;
		padding: 6rpx;
		background-color: #f2f7f6;
		border-radius: 20rpx;

		.segment {
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			font-size: 24rpx;
			line-height: 1;
			color: #78868f;
			border-radius: 16rpx;
		}

		.segment--active {
			font-weight: 600;
			color: #17252b;
			background-color: #ffffff;
			border: 2rpx solid #d8e4e3;
		}
	}

	// 薪资行：组件根节点承接间距
	.salary-picker {
		margin-top: 12rpx;
	}

	.salary-hint {
		display: block;
		margin-top: 8rpx;
		font-size: 21rpx;
		line-height: 1.4;
		color: #8a979e;
	}

	// ===== 固定保存栏 =====
	.save-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		box-sizing: border-box;
		padding: 24rpx 40rpx calc(24rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		border-top: 2rpx solid #e3ebec;

		.save-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 92rpx;
			background-image: linear-gradient(180deg, #007c77 0%, #00746f 100%);
			border-radius: 24rpx;

			.save-text {
				font-size: 30rpx;
				font-weight: 600;
				line-height: 1;
				letter-spacing: 0.6rpx;
				color: #ffffff;
			}
		}

		.privacy-note {
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 20rpx;

			.privacy-icon {
				width: 24rpx;
				height: 24rpx;
				margin-right: 10rpx;
			}

			.privacy-text {
				font-size: 20rpx;
				line-height: 1.2;
				color: #8a979e;
			}
		}
	}
}
</style>
