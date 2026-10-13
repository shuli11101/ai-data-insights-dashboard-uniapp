import { createLuchRequest, isLuchRequestError } from 'luch-request'

// 后端统一响应结构：真实业务数据在 data 字段里
interface ApiResult<T> {
	code: number
	message: string
	data: T
}

// 接口基础地址（后端已开启 CORS，前端可跨域直接访问）
const baseURL = 'http://127.0.0.1:3000/api'

// 全局唯一的请求实例：集中配置超时、请求头与拦截器
export const http = createLuchRequest({
	baseURL,
	timeout: 10000,
	header: {
		'Content-Type': 'application/json'
	}
})

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
			console.error(`[request] ${error.code}: ${error.message}`)
		}
		return Promise.reject(error)
	}
)
