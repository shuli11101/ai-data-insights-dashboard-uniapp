<template>
	<view class="search-list" :style="{ paddingTop: statusBarHeight + 'px' }">

		<!-- ===== 顶部：返回 + 搜索框 ===== -->
		<view class="top-bar">
			<image class="back-btn" src="/static/icon/aiAnalyse/back.svg" mode="aspectFit" @click="onBack" />
			<view class="search-box">
				<view class="search-icon"></view>
				<input class="search-input" v-model="keyword" type="text" confirm-type="search" placeholder="搜索岗位、公司"
					placeholder-class="search-placeholder" />
				<!-- 关键词非空时显示清除按钮 -->
				<view class="search-clear" v-if="keyword" @click="keyword = ''"></view>
			</view>
			<text @click="onSearch(keyword)" class="search-action">搜索</text>
		</view>

		<!-- ===== 筛选条件：四个独立下拉框 ===== -->
		<view class="filter-area">
			<view class="filters">
				<!-- 城市选择：热门城市 + 字母分组，组件内部自带下拉面板 -->
				<view class="dropdown">
					<cityPicker :model-value="city" @update:modelValue="onCityChange" />
				</view>

				<!-- 经验下拉：面板比 chip 宽得多，所以放在筛选行下（见下方），chip 这里只做触发器 -->
				<view class="dropdown">
					<view class="chip" :class="{ 'is-active': experienceActive }"
						@click="toggleFilter(experienceFilter.id)">
						<text class="chip-text">{{ experienceText === UNLIMITED ? '经验' : experienceText }}</text>
						<view class="chip-caret" :class="{ 'is-open': openId === experienceFilter.id }"></view>
					</view>
				</view>

				<!-- 薪资下拉：输入最低 / 最高薪资，单位 K -->
				<view class="dropdown">
					<view class="chip" :class="{ 'is-active': salaryActive }" @click="toggleFilter(salaryFilter.id)">
						<text class="chip-text">{{ salaryText === UNLIMITED ? '薪资' : salaryText }}</text>
						<view class="chip-caret" :class="{ 'is-open': openId === salaryFilter.id }"></view>
					</view>

					<view class="filter-panel filter-panel--salary" v-if="openId === salaryFilter.id">
						<view class="panel-header">
							<text class="panel-title">{{ salaryFilter.label }}</text>
						</view>

						<view class="salary-inputs">
							<input class="salary-input" type="number" v-model="salaryMin" placeholder="最低"
								placeholder-class="salary-placeholder" />
							<text class="salary-separator">-</text>
							<input class="salary-input" type="number" v-model="salaryMax" placeholder="最高"
								placeholder-class="salary-placeholder" />
							<text class="salary-unit">K</text>
						</view>

						<view class="panel-actions">
							<button class="panel-btn" @click="resetSalaryFilter()">重置</button>
							<button class="panel-btn panel-btn--primary" @click="confirmFilter()">确认</button>
						</view>
					</view>
				</view>

				<!-- 学历下拉: 暂无筛选条件 -->
				<view class="dropdown">
					<view class="chip" :class="{ 'is-active': educationFilter.selected !== UNLIMITED }"
						@click="toggleFilter(educationFilter.id)">
						<text class="chip-text">{{ educationFilter.selected === UNLIMITED ? '学历' :
							educationFilter.selected }}</text>
						<view class="chip-caret" :class="{ 'is-open': openId === educationFilter.id }"></view>
					</view>

					<view class="filter-panel filter-panel--education" v-if="openId === educationFilter.id">
						<view class="filter-option" :class="{ 'is-selected': option === educationFilter.selected }"
							v-for="option in educationFilter.options" :key="option"
							@click="selectOption(educationFilter, option)">
							<text class="filter-option-text">{{ option }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 经验面板：双滑块选年限范围，锚在筛选行左侧，宽度不受窄 chip 限制 -->
			<view class="filter-panel filter-panel--range" v-if="openId === experienceFilter.id">
				<view class="panel-header">
					<text class="panel-title">{{ experienceFilter.label }}</text>
				</view>

				<!-- 轨道：拖动两个把手圈出年限区间，10 表示「10 年以上」 -->
				<view id="experience-track" class="range-track" @touchstart="onRangeStart"
					@touchmove.stop.prevent="onRangeMove">
					<view class="range-fill" :style="{
						left: percentOf(experienceMin),
						width: percentOf(experienceMax - experienceMin)
					}"></view>
					<view class="range-thumb" :style="{ left: percentOf(experienceMin) }"></view>
					<view class="range-thumb" :style="{ left: percentOf(experienceMax) }"></view>
				</view>

				<view class="range-scale">
					<text class="range-scale-text">0 年</text>
					<text class="range-scale-text">{{ EXPERIENCE_MAX }} 年以上</text>
				</view>

				<view class="panel-actions">
					<button class="panel-btn" @click="resetExperienceFilter()">重置</button>
					<button class="panel-btn panel-btn--primary" @click="confirmFilter()">确认</button>
				</view>
			</view>
		</view>

		<!-- 筛选展开时的遮罩：点空白处收起 -->
		<view class="filter-mask" v-if="openId !== null" @click="openId = null"></view>

		<!-- ===== 结果数量 ===== -->
		<view class="result-count">
			<text class="result-count-text">找到 {{ pagination.total }} 个相关岗位</text>
		</view>

		<!-- ===== 岗位列表 ===== -->
		<view class="jobs">
			<view class="job-card" v-for="item in jobList" :key="item.id" @click="toDetail(item)">
				<!-- 岗位名称 + 薪资 -->
				<view class="card-head">
					<text class="job-title">{{ item.job_name }}</text>
					<text class="job-salary">{{ item.salary_min }} - {{ item.salary_max }}</text>
				</view>

				<!-- 公司信息 -->
				<text class="job-company">{{ item.company }}</text>

				<!-- 技能标签 -->
				<view class="job-tags">
					<text class="tag" v-if="!item.isDescription" v-for="tag in item.skill_tags" :key="tag">{{ tag
					}}</text>
					<text class="tag" v-else>{{ item.skill_tags[0] }}</text>
				</view>

				<view class="divider"></view>

				<!-- 工作地点 + 发布时间 -->
				<view class="card-foot">
					<view class="pin"></view>
					<text class="job-address">{{ item.company }}</text>
					<text class="job-time">{{ item.experience }}</text>
				</view>
			</view>
		</view>

		<!-- ===== 已全部加载 ===== -->
		<view class="load-end" v-if="finished && jobList.length">已经到底啦~</view>
	</view>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { useJobList } from '@/utils/useJobList'
import cityPicker from '@/components/user/cityPicker.vue'

// 状态栏高度：自定义导航栏用它做顶部留白（H5 端没有状态栏，取 12px 保底）
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 12

// 首页通过 URL 参数传来的搜索关键词
const keyword = ref('')

/** 胶囊选项筛选：学历 */
interface OptionFilter {
	id: number
	label: string
	type: 'education'
	selected: string
	options: string[]
}

/** 岗位卡片 */
interface JobCard {
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

// 「不限」视为未筛选：选中它时 chip 不显示深色态
const UNLIMITED = '不限'

// ===== 筛选值：变量名与 /home/jobList 的参数一致，直接透传给接口 =====
// 城市：接口要「市」前面的短名，空串表示不筛选
const city = ref('')
// 经验年限区间：0 ~ EXPERIENCE_MAX，取到 EXPERIENCE_MAX 表示「10 年以上」
const EXPERIENCE_MAX = 10
const experienceMin = ref(0)
const experienceMax = ref(EXPERIENCE_MAX)
// 薪资区间：单位 K，空串表示该端不限
const salaryMin = ref('')
const salaryMax = ref('')

// 选中城市：组件回传短名，选中后立即重新查询
const onCityChange = (value: string) => {
	city.value = value
	getList()
}

// 经验下拉：双滑块选年限范围，默认全范围（即不限）
interface ExperienceFilter {
	id: number
	label: string
	type: 'experience'
}
const experienceFilter = reactive<ExperienceFilter>({
	id: 2,
	label: '经验',
	type: 'experience'
})

// chip 上的范围文案：全范围显示「不限」
const experienceText = computed(() => {
	const min = experienceMin.value
	const max = experienceMax.value
	if (min === 0 && max === EXPERIENCE_MAX) return UNLIMITED
	if (min === max) return `${min} 年`
	return max === EXPERIENCE_MAX ? `${min} 年以上` : `${min}-${max} 年`
})

// 是否已筛选：拖到两端视为未筛选
const experienceActive = computed(() => experienceMin.value > 0 || experienceMax.value < EXPERIENCE_MAX)

// 年限换算成百分比：给把手和选中段定位用
const percentOf = (year: number) => `${(year / EXPERIENCE_MAX) * 100}%`

// 轨道的位置与宽度：展开面板后量一次，用于把触摸坐标换算成年限
interface RangeTrack {
	left: number
	width: number
}
const rangeTrack = ref<RangeTrack>({ left: 0, width: 0 })

// 当前拖动的把手
const draggingThumb = ref<'min' | 'max'>('min')

// 面板是 v-if 渲染的，展开后再量轨道
// 当前展开的下拉框 id：默认展开城市，方便先看静态设计
const openId = ref<number | null>(null)
watch(openId, () => {
	nextTick(() => {
		uni.createSelectorQuery()
			.select('#experience-track')
			.boundingClientRect((rect) => {
				// 单节点查询也可能返回数组，这里只取单个节点的结果
				if (!rect || Array.isArray(rect)) return
				rangeTrack.value = { left: rect.left ?? 0, width: rect.width ?? 0 }
			})
			.exec()
	})
})

// 触摸位置 → 年限刻度
const yearFromTouch = (event: TouchEvent) => {
	const { left, width } = rangeTrack.value
	if (!width) return experienceMin.value
	const ratio = (event.touches[0].clientX - left) / width
	return Math.min(EXPERIENCE_MAX, Math.max(0, Math.round(ratio * EXPERIENCE_MAX)))
}

// 按下：离触点更近的那个把手跟随手指
const onRangeStart = (event: TouchEvent) => {
	const year = yearFromTouch(event)
	draggingThumb.value =
		Math.abs(year - experienceMin.value) <= Math.abs(year - experienceMax.value) ? 'min' : 'max'
	moveThumb(year)
}

// 拖动：把手跟手，且两个把手不允许交叉
const onRangeMove = (event: TouchEvent) => moveThumb(yearFromTouch(event))

const moveThumb = (year: number) => {
	if (draggingThumb.value === 'min') {
		experienceMin.value = Math.min(year, experienceMax.value)
	} else {
		experienceMax.value = Math.max(year, experienceMin.value)
	}
}

// 重置经验筛选
const resetExperienceFilter = () => {
	experienceMin.value = 0
	experienceMax.value = EXPERIENCE_MAX
}

// 确认：收起键盘和面板，并按最新筛选条件重新查询
const confirmFilter = () => {
	uni.hideKeyboard()
	openId.value = null
	getList()
}

// 薪资下拉：两个数字输入框，单位 K
interface SalaryFilter {
	id: number
	label: string
	type: 'salary'
}
const salaryFilter = reactive<SalaryFilter>({
	id: 3,
	label: '薪资',
	type: 'salary'
})

// chip 上的薪资文案：两端都空显示「不限」
const salaryText = computed(() => {
	const min = salaryMin.value
	const max = salaryMax.value
	if (!min && !max) return UNLIMITED
	if (min && max) return `${min}-${max}K`
	return min ? `${min}K 以上` : `${max}K 以下`
})

// 是否已筛选：任一端填了数字就算
const salaryActive = computed(() => !!salaryMin.value || !!salaryMax.value)

// 重置薪资筛选
const resetSalaryFilter = () => {
	salaryMin.value = ''
	salaryMax.value = ''
}

// 学历下拉
const educationFilter = reactive<OptionFilter>({
	id: 4,
	label: '学历',
	type: 'education',
	selected: UNLIMITED,
	options: [UNLIMITED, '大专', '本科', '硕士', '博士']
})



// 点 chip：展开对应下拉面板，再点同一个则收起
const toggleFilter = (id: number) => {
	openId.value = openId.value === id ? null : id
}

// 选中学历选项：只改本地状态，不触发查询
const selectOption = (filter: OptionFilter, option: string) => {
	filter.selected = option
}

// 静态数据：岗位列表
const jobList = ref<JobCard[]>([])

// 获取岗位，整理数据
// 筛选值的变量名与接口参数一致，直接透传；「不限」转成空串表示不筛选
const { list, pagination, finished, refresh, loadMore } = useJobList(() => ({
	// 关键词同时作为岗位名条件
	keyword: keyword.value,
	jobName: keyword.value,
	city: city.value === UNLIMITED ? '' : city.value,
	experienceMin: String(experienceMin.value),
	experienceMax: String(experienceMax.value),
	salaryMin: salaryMin.value,
	salaryMax: salaryMax.value
}))
const getList = async () => {
	await refresh()
	// console.log("获取岗位，整理数据", list.value)
	jobList.value = list.value
}

onLoad((options) => {
	// 根据关键词获取岗位列表
	keyword.value = decodeURIComponent(options?.keyword ?? '')
	jobList.value = []
	getList()
})

// 返回搜索页（首页）
// 有上一页直接返回；用 URL 直接打开本页时无上一页，兜底切换回首页 tab
const onBack = () => {
	if (getCurrentPages().length > 1) {
		uni.navigateBack()
	} else {
		uni.switchTab({ url: '/pages/home/index' })
	}
}

// 浮层里点了搜索：换关键词后在本页重新查询
const onSearch = (kw: string) => {
	keyword.value = kw
	getList()
}

// 进入岗位详情
const toDetail = (item: JobCard) => {
	uni.navigateTo({ url: '/pages/detail/index?id=' + item.id })
}

// 下滑加载更多岗位
onReachBottom(() => {
	loadMore()
})
</script>

<style lang="scss">
/* 搜索框占位符：placeholder-class 需为独立类名，不能嵌套在页面根类里 */
.search-placeholder {
	font-size: 28rpx;
	color: #9aa0a6;
}

/* 薪资输入框占位符：同上 */
.salary-placeholder {
	font-size: 26rpx;
	color: #9aa0a6;
}

.search-list {
	box-sizing: border-box;
	min-height: 100vh;
	padding: 0 40rpx 40rpx;
	font-family: Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;

	/* ===== 顶部：返回 + 搜索框 ===== */
	.top-bar {
		/* 提升层级：展开筛选面板时不被遮罩压暗 */
		position: relative;
		z-index: 12;
		display: flex;
		align-items: center;
		margin-top: 24rpx;

		.back-btn {
			flex-shrink: 0;
			width: 64rpx;
			height: 64rpx;
			margin-right: 12rpx;
		}

		.search-box {
			display: flex;
			align-items: center;
			box-sizing: border-box;
			flex: 1;
			min-width: 0;
			height: 76rpx;
			padding: 0 24rpx;
			background-color: #f5f5f5;
			border-radius: 38rpx;

			/* 放大镜：圆 + 45° 手柄 */
			.search-icon {
				position: relative;
				flex-shrink: 0;
				width: 18rpx;
				height: 18rpx;
				border: 3rpx solid #737373;
				border-radius: 50%;

				&::after {
					content: '';
					position: absolute;
					right: -6rpx;
					bottom: -5rpx;
					width: 9rpx;
					height: 3rpx;
					background-color: #737373;
					border-radius: 3rpx;
					transform: rotate(45deg);
				}
			}

			.search-input {
				flex: 1;
				min-width: 0;
				margin-left: 20rpx;
				font-size: 28rpx;
				color: #0a0a0a;
			}

			/* 清除按钮：两条 45° 线拼成 × */
			.search-clear {
				position: relative;
				flex-shrink: 0;
				width: 26rpx;
				height: 26rpx;
				margin-left: 16rpx;

				&::before,
				&::after {
					content: '';
					position: absolute;
					top: 50%;
					left: 50%;
					width: 26rpx;
					height: 3rpx;
					background-color: #a3a3a3;
					border-radius: 3rpx;
				}

				&::before {
					transform: translate(-50%, -50%) rotate(45deg);
				}

				&::after {
					transform: translate(-50%, -50%) rotate(-45deg);
				}
			}
		}

		/* 搜索按钮：与搜索框同排的文字按钮 */
		.search-action {
			flex-shrink: 0;
			margin-left: 20rpx;
			font-size: 28rpx;
			line-height: 1;
			color: #0a0a0a;
		}
	}

	/* ===== 筛选条件 ===== */
	/* 包裹层：让下拉面板相对筛选行定位，并保证整体在遮罩之上 */
	.filter-area {
		position: relative;
		z-index: 12;
		margin-top: 24rpx;

		.filters {
			display: flex;
			justify-content: space-around;
			gap: 16rpx;

			/* 每个下拉框：作为自身面板的定位容器 */
			.dropdown {
				position: relative;
				display: flex;
			}

			.chip {
				display: flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
				height: 60rpx;
				padding: 0 28rpx;
				background-color: #f5f5f5;
				border-radius: 999rpx;

				.chip-text {
					font-size: 26rpx;
					font-weight: 700;
					line-height: 1;
					color: #525252;
				}

				/* 下拉箭头：旋转 45° 的直角边框 */
				.chip-caret {
					width: 12rpx;
					height: 12rpx;
					margin-left: 12rpx;
					margin-bottom: 5rpx;
					border-right: 3rpx solid #525252;
					border-bottom: 3rpx solid #525252;
					transform: rotate(45deg);

					/* 面板展开时箭头翻转为朝上 */
					&.is-open {
						margin-top: 5rpx;
						margin-bottom: 0;
						transform: rotate(-135deg);
					}
				}

				/* 已选中：深色底 + 白字 */
				&.is-active {
					background-color: #0a0a0a;

					.chip-text {
						color: #ffffff;
					}

					.chip-caret {
						border-color: #ffffff;
					}
				}
			}
		}

		/* 下拉面板：绝对定位于各自触发器下方，不挤动列表 */
		.filter-panel {
			position: absolute;
			top: 100%;
			/* 默认水平居中于自己的 chip */
			left: 50%;
			width: 400rpx;
			transform: translateX(-50%);
			display: flex;
			flex-wrap: wrap;
			gap: 16rpx;
			box-sizing: border-box;
			margin-top: 16rpx;
			padding: 24rpx;
			background-color: #ffffff;
			border-radius: 24rpx;
			box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.12);

			/* 选项：等分三列的胶囊 */
			.filter-option {
				display: flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
				width: calc((100% - 32rpx) / 3);
				height: 64rpx;
				padding: 0 8rpx;
				background-color: #f5f5f5;
				border-radius: 12rpx;

				.filter-option-text {
					font-size: 26rpx;
					line-height: 1;
					color: #525252;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				/* 选中态与 chip 保持一致 */
				&.is-selected {
					background-color: #0a0a0a;

					.filter-option-text {
						font-weight: 700;
						color: #ffffff;
					}
				}
			}
		}

		/* 宽面板（经验）：左对齐，宽度和筛选行接近，居中会因为 chip 偏左而出屏 */
		.filter-panel--range {
			left: 0;
			width: 620rpx;
			transform: none;
		}

		/* 学历面板：位于筛选行最右侧，右对齐避免超出屏幕 */
		.filter-panel--education {
			left: auto;
			right: 0;
			transform: none;
		}

		/* 面板标题行：经验 / 薪资面板共用 */
		.panel-header {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.panel-title {
				font-size: 24rpx;
				line-height: 1;
				color: #a3a3a3;
			}
		}

		/* 底部操作：重置 + 确认两个等宽胶囊按钮，经验 / 薪资面板共用 */
		.panel-actions {
			display: flex;
			gap: 20rpx;
			margin-top: 40rpx;

			/* 覆盖 uni button 的默认边框与背景 */
			.panel-btn {
				flex: 1;
				height: 68rpx;
				padding: 0;
				font-size: 26rpx;
				font-weight: 700;
				line-height: 68rpx;
				color: #525252;
				background-color: #f5f5f5;
				border: none;
				border-radius: 999rpx;

				&::after {
					border: none;
				}

				&--primary {
					color: #ffffff;
					background-color: #2e63e8;
				}
			}
		}

		/* 经验面板：标题 + 双滑块轨道 + 两端刻度 + 底部操作按钮 */
		.filter-panel--range {
			display: block;
			padding: 32rpx;

			/* 轨道：上下留白撑出触摸区域，中线画未选中部分 */
			.range-track {
				position: relative;
				height: 80rpx;
				margin-top: 24rpx;

				&::before {
					position: absolute;
					top: 50%;
					right: 0;
					left: 0;
					height: 8rpx;
					margin-top: -4rpx;
					background-color: #f5f5f5;
					border-radius: 4rpx;
					content: '';
				}

				/* 已选中的年限区间 */
				.range-fill {
					position: absolute;
					top: 50%;
					height: 8rpx;
					margin-top: -4rpx;
					background-color: #2e63e8;
					border-radius: 4rpx;
				}

				/* 把手：left 是百分比刻度，左移自身半径让圆心正好落在刻度上 */
				.range-thumb {
					position: absolute;
					top: 50%;
					box-sizing: border-box;
					width: 40rpx;
					height: 40rpx;
					margin: -20rpx 0 0 -20rpx;
					background-color: #ffffff;
					border: 4rpx solid #2e63e8;
					border-radius: 50%;
					box-shadow: 0 2rpx 8rpx rgba(46, 99, 232, 0.3);
				}
			}

			.range-scale {
				display: flex;
				justify-content: space-between;
				margin-top: 8rpx;

				.range-scale-text {
					font-size: 22rpx;
					line-height: 1;
					color: #a3a3a3;
				}
			}
		}

		/* 薪资面板：标题 + 最低 / 最高两个数字输入框 + 单位 */
		.filter-panel--salary {
			display: block;

			.salary-inputs {
				display: flex;
				align-items: center;
				margin-top: 24rpx;

				.salary-input {
					flex: 1;
					box-sizing: border-box;
					height: 68rpx;
					padding: 0 16rpx;
					font-size: 26rpx;
					line-height: 68rpx;
					text-align: center;
					color: #0a0a0a;
					background-color: #f5f5f5;
					border-radius: 12rpx;
				}

				.salary-separator {
					margin: 0 16rpx;
					font-size: 26rpx;
					line-height: 1;
					color: #a3a3a3;
				}

				.salary-unit {
					margin-left: 16rpx;
					font-size: 26rpx;
					line-height: 1;
					color: #a3a3a3;
				}
			}
		}
	}

	/* 展开筛选时的遮罩：压暗下方内容，点空白处收起 */
	.filter-mask {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 11;
		background-color: rgba(0, 0, 0, 0.25);
	}

	/* ===== 结果数量 ===== */
	.result-count {
		margin-top: 24rpx;

		.result-count-text {
			font-size: 24rpx;
			line-height: 1;
			color: #a3a3a3;
		}
	}

	/* ===== 岗位列表 ===== */
	.jobs {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		margin-top: 18rpx;

		.job-card {
			box-sizing: border-box;
			padding: 20rpx 32rpx 14rpx;
			background-color: #ffffff;
			border: 1px solid #e5e5e5;
			border-radius: 24rpx;

			/* 岗位名称 + 薪资 */
			.card-head {
				display: flex;
				align-items: center;
				justify-content: space-between;
				height: 38rpx;

				.job-title {
					flex: 1;
					min-width: 0;
					font-size: 32rpx;
					font-weight: 700;
					line-height: 1.2;
					color: #0a0a0a;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.job-salary {
					flex-shrink: 0;
					margin-left: 16rpx;
					font-size: 30rpx;
					font-weight: 700;
					line-height: 1.2;
					color: #0a0a0a;
				}
			}

			.job-company {
				display: block;
				margin-top: 8rpx;
				font-size: 25rpx;
				line-height: 1.2;
				color: #737373;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			/* 技能标签：浅灰小胶囊 */
			.job-tags {
				display: flex;
				flex-wrap: nowrap;
				gap: 16rpx;
				margin-top: 16rpx;
				overflow: hidden;
				height: 44rpx;

				.tag {
					display: flex;
					align-items: center;
					flex-shrink: 0;
					padding: 0 20rpx;
					font-size: 22rpx;
					line-height: 1;
					color: #525252;
					background-color: #f5f5f5;
					border-radius: 22rpx;
				}
			}

			.divider {
				height: 2rpx;
				margin-top: 16rpx;
				background-color: #f5f5f5;
			}

			/* 工作地点 + 发布时间 */
			.card-foot {
				display: flex;
				align-items: center;
				margin-top: 6rpx;
				height: 30rpx;

				.pin {
					flex-shrink: 0;
					width: 10rpx;
					height: 10rpx;
					margin-right: 10rpx;
					background-color: #737373;
					border-radius: 50%;
				}

				.job-address {
					flex: 1;
					min-width: 0;
					font-size: 24rpx;
					line-height: 1.2;
					color: #737373;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.job-time {
					flex-shrink: 0;
					margin-left: 16rpx;
					font-size: 22rpx;
					line-height: 1;
					color: #a3a3a3;
				}
			}
		}
	}

	/* ===== 已全部加载：到底提示 ===== */
	.load-end {
		margin-top: 32rpx;
		font-size: 24rpx;
		line-height: 1;
		text-align: center;
		color: #a3a3a3;
	}
}
</style>
