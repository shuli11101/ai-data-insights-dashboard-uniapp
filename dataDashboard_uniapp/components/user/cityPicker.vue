<template>
	<view class="city-picker">
		<!-- 触发区：默认胶囊（搜索页样式），其他页面可用 trigger 插槽换成自己的触发器 -->
		<slot name="trigger" :selected="modelValue" :open="open" :toggle="toggle">
			<view class="chip" :class="{ 'is-active': !!modelValue }" @click="toggle">
				<text class="chip-text">{{ modelValue || '城市选择' }}</text>
				<view class="chip-caret" :class="{ 'is-open': open }"></view>
			</view>
		</slot>

		<template v-if="open">
			<!-- 点面板外收起 -->
			<view class="city-mask" @click="open = false"></view>

			<view class="city-panel">
				<!-- 热门城市 -->
				<view class="city-hot">
					<view class="city-hot-header">
						<text class="city-hot-title">热门城市</text>
						<text class="city-hot-reset" @click="reset">重置</text>
					</view>
					<view class="city-hot-tags">
						<text class="city-tag" :class="{ 'is-selected': modelValue === item }"
							v-for="item in hotCities" :key="item" @click="select(item)">{{ item }}</text>
					</view>
				</view>

				<!-- 全部城市：左侧限高滚动，右侧字母索引 -->
				<view class="city-body">
					<scroll-view class="city-scroll" scroll-y :scroll-into-view="scrollTo">
						<view class="city-group" v-for="group in groups" :key="group.letter" :id="'city-' + group.letter">
							<text class="city-group-letter">{{ group.letter }}</text>
							<view class="city-group-list">
								<text class="city-item" :class="{ 'is-selected': modelValue === item }"
									v-for="item in group.cities" :key="item" @click="select(item)">{{ item }}</text>
							</view>
						</view>
					</scroll-view>

					<view class="city-index">
						<text class="city-index-item" :class="{ 'is-active': letter === activeLetter }"
							v-for="letter in letters" :key="letter" @click="onLetter(letter)">{{ letter }}</text>
					</view>
				</view>
			</view>
		</template>
	</view>
</template>

<script setup lang="ts">
import { getCityListAsync } from '@/api/searchList'
import { cityInitials, cityShortNames } from '@/utils/cityInitials'
import { computed, nextTick, onMounted, ref } from 'vue'

const props = withDefaults(
	defineProps<{
		/** 当前选中的城市，空串表示未选择 */
		modelValue: string
		/** 热门城市 */
		hotCities?: string[]
	}>(),
	{
		hotCities: () => ['北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '南京']
	}
)

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
}>()

/** 按首字母分组的城市 */
interface CityGroup {
	letter: string
	cities: string[]
}

const open = ref(false)
const groups = ref<CityGroup[]>([])
const letters = computed(() => groups.value.map((group) => group.letter))

// 待滚动的分组 id 与当前高亮的字母
const scrollTo = ref('')
const activeLetter = ref('')

// 城市列表：先按首字母分组，再按字母排序
const loadCities = async () => {
	try {
		const cities = await getCityListAsync()
		const grouped = new Map<string, string[]>()

		cities
			// 过滤「河南省-省直辖县级行政区划」这类省级占位行
			.filter(({ name }) => !name.includes('-'))
			.forEach(({ name }) => {
				const letter = cityInitials[name] ?? '#'
				const group = grouped.get(letter) ?? []
				group.push(cityShortNames[name] ?? name.replace(/市$/, ''))
				grouped.set(letter, group)
			})

		groups.value = [...grouped]
			.map(([letter, list]) => ({ letter, cities: list }))
			.sort((a, b) => a.letter.localeCompare(b.letter))
	} catch (error) {
		console.error('[cityPicker] 获取城市列表失败', error)
	}
}

onMounted(loadCities)

const toggle = () => {
	open.value = !open.value
}

// 选中城市：回传并收起
const select = (city: string) => {
	emit('update:modelValue', city)
	open.value = false
}

// 重置：清空选中
const reset = () => {
	emit('update:modelValue', '')
	open.value = false
}

// 点字母：滚动到对应分组并高亮（先清空再赋值，连点同一个字母也能重新定位）
const onLetter = (letter: string) => {
	scrollTo.value = ''
	nextTick(() => {
		scrollTo.value = `city-${letter}`
		activeLetter.value = letter
	})
}
</script>

<style lang="scss" scoped>
.city-picker {
	position: relative;
	display: block;
}

/* ===== 默认触发器：胶囊 ===== */
.chip {
	display: inline-flex;
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

/* 点空白处收起 */
.city-mask {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 1;
}

/* ===== 城市面板 ===== */
.city-panel {
	position: absolute;
	top: 100%;
	left: 0;
	z-index: 2;
	box-sizing: border-box;
	width: 620rpx;
	margin-top: 16rpx;
	padding: 24rpx;
	background-color: #ffffff;
	border-radius: 24rpx;
	box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.12);

	/* 热门城市 */
	.city-hot-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.city-hot-title,
	.city-hot-reset {
		font-size: 24rpx;
		line-height: 1;
		color: #a3a3a3;
	}

	.city-hot-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-top: 16rpx;
	}

	.city-tag {
		padding: 12rpx 28rpx;
		font-size: 26rpx;
		line-height: 1;
		color: #525252;
		background-color: #f5f5f5;
		border-radius: 999rpx;

		&.is-selected {
			font-weight: 700;
			color: #ffffff;
			background-color: #0a0a0a;
		}
	}

	/* 全部城市：左侧列表限高滚动，右侧字母索引固定 */
	.city-body {
		display: flex;
		height: 560rpx;
		margin-top: 24rpx;
	}

	.city-scroll {
		flex: 1;
		min-width: 0;
		height: 100%;
	}

	.city-group {
		margin-bottom: 16rpx;

		.city-group-letter {
			display: block;
			font-size: 24rpx;
			line-height: 1.6;
			color: #a3a3a3;
		}

		.city-group-list {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
		}
	}

	/* 城市胶囊：一行三个 */
	.city-item {
		box-sizing: border-box;
		width: calc((100% - 24rpx) / 3);
		padding: 14rpx 4rpx;
		font-size: 26rpx;
		line-height: 1;
		text-align: center;
		color: #525252;
		background-color: #f5f5f5;
		border-radius: 12rpx;

		&.is-selected {
			font-weight: 700;
			color: #ffffff;
			background-color: #0a0a0a;
		}
	}

	/* 右侧字母索引：等分撑满滚动区高度 */
	.city-index {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
		width: 40rpx;
		padding-left: 8rpx;

		.city-index-item {
			font-size: 20rpx;
			line-height: 1;
			color: #a3a3a3;

			&.is-active {
				font-weight: 700;
				color: #2563eb;
			}
		}
	}
}
</style>
