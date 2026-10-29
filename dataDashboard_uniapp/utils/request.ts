import { createLuchRequest, isLuchRequestError } from 'luch-request'

// 后端统一响应结构：真实业务数据在 data 字段里
interface ApiResult<T> {
	code: number
	message: string
	data: T
}

// 接口基础地址（后端已开启 CORS，前端可跨域直接访问）
const baseURL = 'http://127.0.0.1:3000/api'

// 后端返回的相对文件路径（如 /uploads/a.png）要拼到服务地址上，而不是当前页面域名
const fileOrigin = baseURL.replace(/\/api\/?$/, '')

/** 把后端返回的头像等文件地址补全成可直接访问的绝对地址 */
export const resolveFileUrl = (url?: string | null) => {
	if (!url) return ''
	// 已经是完整地址或本地临时文件，原样返回
	if (/^(https?:|data:|blob:|file:)/i.test(url)) return url
	return `${fileOrigin}${url.startsWith('/') ? '' : '/'}${url}`
}

// 全局唯一的请求实例：集中配置超时、请求头与拦截器
export const http = createLuchRequest({
	baseURL,
	timeout: 10000,
	header: {
		'Content-Type': 'application/json'
	}
})

// 请求拦截器：本地存有 token 时，自动在请求头带上 Authorization
http.interceptors.request.use(
	(config) => {
		const token = uni.getStorageSync('token') as string
		if (token) {
			config.header = {
				...config.header,
				Authorization: `Bearer ${token}`
			}
		}
		return config
	},
	(error) => Promise.reject(error)
)

// 响应拦截器：统一解包后端响应结构，并收敛请求错误
http.interceptors.response.use(
	(response) => {
		// 把真实数据换到 response.data，业务层直接取 res.data（即 { list, total } 这类数据）
		response.data = (response.data as ApiResult<unknown>).data
		return response
	},
	(error) => {
		// 网络异常、超时、HTTP 状态非 2xx 等都会进入这里
		if (isLuchRequestError(error)) {
			// 打印后端返回的业务错误体，便于排查（如 409 { code, message }）
			const body = (error.response as { data?: unknown } | undefined)?.data
			console.error(`[request] ${error.code}: ${error.message}`, body)
		}
		return Promise.reject(error)
	}
)

/** 从请求错误中取出后端返回的 message（luch-request 把响应体放在 error.response.data） */
export const getErrorMessage = (error: unknown, fallback = '请求失败，请稍后重试') => {
	if (!isLuchRequestError(error)) return fallback
	const body = (error.response as { data?: { message?: string } } | undefined)?.data
	return body?.message || fallback
}
