/**
 * 登录态工具
 * 统一维护「是否登录」的判断口径，避免各页面自己读 storage 造成不一致
 */

/** 本地是否已登录：以登录成功时写入的 token 为准 */
export const isLoggedIn = (): boolean => !!uni.getStorageSync('token')

/**
 * 跳转登录页
 * 先提示「请先登录」，稍作停留再跳转，避免提示被页面切换打断
 * 用 redirectTo 替换当前页面，未登录用户返回时不会再次落回受限页面
 */
export const redirectToLogin = (): void => {
	uni.showToast({ title: '请先登录', icon: 'none', duration: 1200 })
	// 延迟跳转，让用户能看清提示文案
	setTimeout(() => {
		uni.redirectTo({ url: '/pages/login/index' })
	}, 800)
}
