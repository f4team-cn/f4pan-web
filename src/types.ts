export type LoginResult = {
	token: string
};

export type ParseKeyType = 'dynamic' | 'fixed' | 'none';

export type SystemConfigResult = Pick<SystemSetting, 'requires_key' | 'notice_id' | 'parse_ua' | 'is_active'>;

export type File = {
	filename: string;
	path: string;
	fs_id: string;
	isdir: string;
	size: number;
};

export type ShareInfo = {
	share_id: string;
	uk: string;
	seckey: string;
};

export type BaseResponse<T> = {
	code: number;
	message: string;
	data: T
};

export type RPCConfig = {
	host: string;
	port: string;
	token: string;
	basedir: string;
};

export type FileListResult = {
	list: File[],
	shareinfo: ShareInfo,
};

export type TreeFileInfo = {
	key: string;
	label: string;
	leaf: boolean;
	path: string;
	size: number;
	icon: string;
	fs_id: string;
};

export type ParsedFile = {
	id?: number;
	filename: string;
	link: string;
};

export type ParsedFileResult = {
	filename: string;
	filemd5: string;
	filesize: number;
	dlink: string;
	ua: string;
	use_cache: boolean;
	filefsid: string;
};

export type Notice = {
	id: number;
	title: string;
	content: string;
	add_time: number;
};

export type NoticeContent = Omit<Notice, 'id'>;

export type SystemSetting = {
	admin_password: string;
	requires_key: ParseKeyType;
	notice_id: string;
	key_last_time: string;
	fixed_key: string;
	real_url_last_time: string;
	parse_ua: string;
	normal_cookie: string;
	is_active: boolean;
};

export type SystemStatusResult = {
	total_parsing_traffic: number;
	total_parsing_count: number;
	spent_svip_count: number;
	last_updated: string;
	total_parsing_traffic_format: string;
	today_parsing_traffic_format: string;
};

export type VipAccount = {
	id: number;
	name: string;
	state: string;
	cookie: string;
	add_time: number;
	svip_end_time: number;
	vip_type: string;
};

export type QrCodeData = {
	imgurl: string;
	sign: string;
};

export type UnicastData = {
	bduss: string;
};

export type PHPExt = {
	pdo_mysql: boolean;
	redis: boolean;
	curl: boolean;
};

export type EnvironmentData = {
	php_version: string;
	ext: PHPExt
};

export type MySQLConfig = {
	hostname: string;
	port: string;
	username: string;
	password: string;
	database: string;
};

export type RedisConfig = {
	hostname: string;
	port: string;
	password: string;
};

export type ApiKey = {
	id: number;
	key: string;
	use_count: number;
};

// ===================== 工具

export type MakeOptional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

export function isValidKey(key: string | number | symbol , object: object): key is keyof typeof object {
	return key in object;
}

// ===================== 接口响应类型

export type LoginResponse = BaseResponse<LoginResult>;
export type SystemConfigResponse = BaseResponse<SystemConfigResult>;
export type FileListResponse = BaseResponse<FileListResult>;
export type UseApiKeyResponse = BaseResponse<string>;
export type ParseFileResponse = BaseResponse<ParsedFileResult>;
export type SystemStatusResponse = BaseResponse<SystemStatusResult>;

export type NoticeResponse = BaseResponse<Notice>;
export type NoticeListResponse = BaseResponse<Notice[]>;
export type AddNoticeResponse = MakeOptional<BaseResponse<NoticeContent>, 'data'>;
export type UpdateNoticeResponse = MakeOptional<BaseResponse<NoticeContent>, 'data'>;
export type DeleteNoticeResponse = BaseResponse<never>;
export type UseNoticeResponse = BaseResponse<never>;

export type SystemSettingListResponse = BaseResponse<(SystemSetting & { id: number })[]>;
export type AddSystemSettingResponse = MakeOptional<BaseResponse<SystemSetting & { id: number }>, 'data'>;
export type UpdateSystemSettingResponse = MakeOptional<BaseResponse<SystemSetting>, 'data'>;
export type DeleteSystemSettingResponse = BaseResponse<never>;
export type UseSystemSettingResponse = BaseResponse<never>;

export type AddVipAccountResponse = MakeOptional<BaseResponse<VipAccount>, 'data'>;
export type DeleteVipAccountResponse = BaseResponse<never>;
export type UpdateVipAccountResponse = BaseResponse<never>;
export type VipAccountListResponse = BaseResponse<(VipAccount & { can_use: boolean })[]>;

export type GenerateApiKeyResponse = BaseResponse<{ key: string }>;

export type GetQrCodeDataResponse = BaseResponse<QrCodeData>;
export type UnicastQrCodeDataResponse = MakeOptional<BaseResponse<UnicastData>, 'data'>;
export type GetCookieResponse = BaseResponse<{ cookie: string; }>;

export type CheckEnvironmentResponse = BaseResponse<EnvironmentData>;

export type TestConnectionResponse = BaseResponse<string | undefined>;

export type IPCountResponse = BaseResponse<{ ip_type: number, all_count: number }>;

export type ApiKeyListResponse = BaseResponse<ApiKey[]>;
export type DeleteApiKeyResponse = BaseResponse<never>;

// ====================== WebWorker 类型

export type WorkerTypeResponseType = 'done' | 'progress' | 'success' | 'error';
export type WorkerResponseBody = ParsedFileResult;

export type WorkerResponse = {
	type: WorkerTypeResponseType;
	message?: string;
	max?: number;
	n?: number;
	body?: WorkerResponseBody
};

export type WorkerRequest = {
	type: 'add';
	body: WorkerRequestBody[]
};

export type WorkerRequestBody = Pick<File, 'fs_id'> & ShareInfo & {
	short?: boolean;
	reqId: string;
	surl: string;
	pwd: string;
};
