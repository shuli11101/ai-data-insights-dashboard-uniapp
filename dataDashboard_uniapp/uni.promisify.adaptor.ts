// 把 uni 的 success/fail 回调风格 API 转成 Promise（Vue2 项目在 main 中引入）
uni.addInterceptor({
	returnValue(res: any) {
		if (!(!!res && (typeof res === 'object' || typeof res === 'function') && typeof res.then === 'function')) {
			return res
		}
		return new Promise((resolve, reject) => {
			res.then((result: any) => {
				if (!result) return resolve(result)
				return result[0] ? reject(result[0]) : resolve(result[1])
			})
		})
	}
})
