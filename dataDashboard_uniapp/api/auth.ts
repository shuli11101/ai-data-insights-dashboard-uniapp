import { http } from '@/utils/request'

/** 注册参数：手机号、短信验证码、密码 */
export interface RegisterParams {
	phone: string
	code: string
	password: string
}

/** 注册成功返回的业务数据 */
export interface RegisterResult {
	/** 登录令牌，后续请求放在 Authorization 头里 */
	token: string
}

/** 登录参数：手机号、密码 */
export interface LoginParams {
	phone: string
	password: string
}

/** 登录成功返回的业务数据 */
export interface LoginResult {
	/** 登录令牌，后续请求放在 Authorization 头里 */
	token: string
}

/**
 * 登录
 * 接口：POST /api/auth/login
 */
export const login = async (params: LoginParams): Promise<LoginResult> => {
	return (
		await http.request<LoginResult>({
			url: '/auth/login',
			method: 'POST',
			data: {
				phone: params.phone,
				password: params.password
			}
		})
	).data
}

/**
 * 注册账号
 * 接口：POST /api/auth/register
 * 注意：http 实例的 baseURL 已包含 /api，这里只写 /auth/register
 * 参数放在 data 里，以 JSON 请求体提交
 */
export const register = async (params: RegisterParams): Promise<RegisterResult> => {
	return (
		await http.request<RegisterResult>({
			url: '/auth/register',
			method: 'POST',
			data: {
				phone: params.phone,
				code: params.code,
				password: params.password
			}
		})
	).data
}
