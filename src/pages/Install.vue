<script setup lang="ts">
import Stepper, {type StepperChangeEvent} from 'primevue/stepper';
import StepperPanel from 'primevue/stepperpanel';
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import Image from 'primevue/image';
import ProgressBar from 'primevue/progressbar';
import Message from 'primevue/message';
import Divider from 'primevue/divider';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import {computed, reactive, ref} from 'vue';
import {useMessage} from '@/hooks/useMessage';
import {checkEnvironment, testMySqlConnection, testRedisConnection, install as doInstall} from '@/services/install';
import {stringIsEmpty} from '@/utils/string-is-empty';
import {isValidKey, type MySQLConfig, type RedisConfig, type SystemSetting} from '@/types';
import RadioButton from 'primevue/radiobutton';
import Textarea from 'primevue/textarea';

type InstallSystemConfig = Omit<SystemSetting, 'notice_id' | 'is_active'>;
type ConnectionState = 'open' | 'close' | 'wait';
type CallBack = (event: Event) => void;

const installing = ref(false);
const installed = ref(false);
const message = useMessage();
const loading = ref(false);
const connectionStates = reactive<Record<'mysql' | 'redis', ConnectionState>>({
	mysql: 'wait',
	redis: 'wait'
});
const environment = ref([
	{
		name: 'PHP',
		require: '>=8.0',
		has: true
	}, {
		name: 'PDO_Mysql',
		require: '无限制',
		has: false
	}, {
		name: 'PHP-Redis',
		require: '无限制',
		has: false
	}, {
		name: 'PHP-Curl',
		require: '无限制',
		has: false
	}
]);
const mysqlConfig = reactive<MySQLConfig>({
	hostname: 'localhost',
	port: '3306',
	username: '',
	password: '',
	database: ''
});
const redisConfig = reactive<RedisConfig>({
	hostname: 'localhost',
	port: '6379',
	password: ''
});
const hasEnvironment = computed<boolean>({
	get: () => {
		return environment.value.filter(v => !v.has).length === 0;
	},
	set: (v: boolean) => {
	}
});
const systemConfig = reactive<InstallSystemConfig>({
	admin_password: '',
	fixed_key: '',
	key_last_time: '300',
	normal_cookie: '',
	parse_ua: 'netdisk;',
	real_url_last_time: '1800',
	requires_key: 'dynamic'
});

const install = (prev: CallBack, event: Event) => {
	const strings = buildInstallQuery();
	message.default('开始安装……');
	installing.value = true;
	doInstall(strings).then(() => {
		installed.value = true;
		message.success('安装成功！');
	}).catch(() => {
		prev(event);
		message.warn('安装失败，请检查环境配置是否正确！');
	}).finally(() => installing.value = false);
};

const checkEnv = async () => {
	try {
		loading.value = true;
		message.default('正在检查环境……');
		const {data: response} = await checkEnvironment();
		const {data} = response;
		environment.value[1].has = data.ext.pdo_mysql;
		environment.value[2].has = data.ext.redis;
		environment.value[3].has = data.ext.curl;
		message.success('环境检查成功！');
	} catch {
		message.warn('环境检查失败！');
	} finally {
		loading.value = false;
	}
};

const stepChange = (event: StepperChangeEvent) => {
	if (event.index === 1) {
		checkEnv();
	}
};

const confirmEnvConfig = (next: CallBack, prev: CallBack, event: Event) => {
	if (stringIsEmpty(mysqlConfig.hostname) || stringIsEmpty(mysqlConfig.port) || stringIsEmpty(mysqlConfig.database) || stringIsEmpty(mysqlConfig.username) || mysqlConfig.port === '0') {
		message.warn('请正确填写 MySQL 数据库信息！');
		return;
	}
	if (stringIsEmpty(redisConfig.hostname) || stringIsEmpty(redisConfig.port) || redisConfig.port === '0') {
		message.warn('请正确填写 Redis 数据库信息！');
		return;
	}
	if (connectionStates.mysql !== 'open' || connectionStates.redis !== 'open') {
		message.warn('请先确保 MySQL 和 Redis 能连接，请点击测试连接按钮！');
		return;
	}
	const filter = Object.entries(systemConfig).filter(([key]) => key !== 'fixed_key').filter(([_, value]) => stringIsEmpty(value));
	if (filter.length !== 0) {
		message.warn('请正确填写 F4Pan 系统信息！');
		return;
	}
	if (systemConfig.requires_key === 'fixed' && stringIsEmpty(systemConfig.fixed_key)) {
		message.warn('密钥模式为 固定 时，固定密钥不能为空！');
		return;
	}
	next(event);
	setTimeout(() => install(prev, event), 500);
};

const buildInstallQuery = () => {
	const query: Record<string, string> = {
		...systemConfig
	};
	for (let key in mysqlConfig) {
		if (isValidKey(key, mysqlConfig)) {
			query[`db_${key}`] = mysqlConfig[key] as string;
		}
	}
	for (let key in redisConfig) {
		if (isValidKey(key, redisConfig)) {
			// 对不起 我的问题
			query[`redis_${key}`] = redisConfig[key] || '';
		}
	}
	return query;
};

const testMySql = async () => {
	if (stringIsEmpty(mysqlConfig.hostname) || stringIsEmpty(mysqlConfig.port) || stringIsEmpty(mysqlConfig.database) || stringIsEmpty(mysqlConfig.username) || mysqlConfig.port === '0') {
		message.warn('请正确填写 MySQL 数据库信息！');
		return;
	}
	try {
		loading.value = true;
		await testMySqlConnection(mysqlConfig);
		message.success('测试连接成功！');
		connectionStates.mysql = 'open';
	} catch {
		message.error('测试连接失败！');
		connectionStates.mysql = 'close';
	} finally {
		loading.value = false;
	}
};

const testRedis = async () => {
	if (stringIsEmpty(redisConfig.hostname) || stringIsEmpty(redisConfig.port) || redisConfig.port === '0') {
		message.warn('请正确填写 Redis 数据库信息！');
		return;
	}
	try {
		loading.value = true;
		await testRedisConnection(redisConfig);
		message.success('测试连接成功！');
		connectionStates.redis = 'open';
	} catch {
		message.error('测试连接失败！');
		connectionStates.redis = 'close';
	} finally {
		loading.value = false;
	}
};
</script>

<template>
	<div class="main-container">
		<div class="main">
			<Panel header="安装程序 - F4Pan">
				<div class="card flex justify-content-center">
					<Stepper linear @step-change="stepChange" orientation="vertical">
						<template #start>
							<div class="flex justify-content-center align-items-center">
								<Image src="https://www.f4team.cn/logo/logo-hdpi.png" width="120"/>
							</div>
						</template>
						<StepperPanel header="介绍">
							<template #content="{ nextCallback }">
								<div
									class="flex flex-column border-2 border-dashed surface-border border-round surface-ground px-3 py-3 flex-auto font-medium">
									<p class="par">欢迎使用 <code>F4Pan</code>
										安装程序，你在安装本程序前，应先阅读我们的<a
											href="https://github.com/f4team-cn/f4pan"
											target="_blank">开源协议及免责声明</a>，以防制造不必要的麻烦。
										当你点击 <code>下一步</code> 按钮时，则代表你已经阅读并同意了我们的条款！
									</p>
								</div>
								<div class="flex pt-4 justify-content-end">
									<Button label="下一步" icon="pi pi-arrow-right" iconPos="right"
									        @click="nextCallback" :disabled="loading"/>
								</div>
							</template>
						</StepperPanel>
						<StepperPanel header="环境检查">
							<template #content="{ prevCallback, nextCallback }">
								<div
									class="flex flex-column border-2 border-dashed surface-border border-round surface-ground flex-auto px-3 py-3">
									<Message :closable="false">为了确保安装能正常进行，本程序需要以下环境。</Message>
									<Divider/>
									<div class="flex-grow-1 overflow-y-auto">
										<DataTable :value="environment" class="h-full">
											<Column field="name" header="程序"/>
											<Column field="require" header="要求"/>
											<Column header="是否满足">
												<template #body="{ data }">
													<Tag severity="success" value="满足" v-if="data.has"></Tag>
													<Tag severity="warning" value="不满足" v-else></Tag>
												</template>
											</Column>
										</DataTable>
									</div>
									<Divider/>
									<div class="flex justify-content-end">
										<Button severity="info" label="重新检查" :loading="loading"
										        @click="checkEnv"></Button>
									</div>
								</div>
								<div class="flex pt-4 justify-content-between">
									<Button label="上一步" severity="secondary" icon="pi pi-arrow-left"
									        @click="prevCallback"/>
									<Button label="下一步" icon="pi pi-arrow-right" iconPos="right" :loading="loading"
									        :disabled="!hasEnvironment" @click="nextCallback"/>
								</div>
							</template>
						</StepperPanel>
						<StepperPanel header="环境配置">
							<template #content="{ prevCallback, nextCallback }">
								<div
									class="flex flex-column border-2 border-dashed surface-border border-round surface-ground flex-auto font-medium px-3 py-3">
									<Divider align="left" type="solid">
										<strong>MySQL</strong>
									</Divider>
									<div class="p-fluid">
										<div class="formgrid grid">
											<div class="field col">
												<label for="host">主机</label>
												<InputText type="text" v-model="mysqlConfig.hostname"/>
											</div>
											<div class="field col">
												<label for="port">端口</label>
												<InputText type="number" v-model="mysqlConfig.port"/>
											</div>
										</div>
										<div class="field">
											<label for="database">数据库名</label>
											<InputText type="text" v-model="mysqlConfig.database"/>
										</div>
										<div class="field">
											<label for="username">用户名</label>
											<InputText type="text" v-model="mysqlConfig.username"/>
										</div>
										<div class="field">
											<label for="password">密码</label>
											<InputText type="password" v-model="mysqlConfig.password"/>
										</div>
									</div>
									<div class="flex justify-content-start align-items-center">
										<Button label="测试连接" style="max-height: 34px;" @click="testMySql"></Button>
										<Message :closable="false" class="ml-2"
										         :severity="connectionStates.mysql === 'open' ? 'success' : (connectionStates.mysql === 'close' ? 'error' : 'contrast')">
											连接状态：{{
												connectionStates.mysql === 'open' ? '成功' : (connectionStates.mysql === 'close' ? '失败' : '未知')
											}}
										</Message>
									</div>
									<Divider align="left" type="solid">
										<strong>Redis</strong>
									</Divider>
									<div class="p-fluid">
										<div class="formgrid grid">
											<div class="field col">
												<label for="host">主机</label>
												<InputText type="text" v-model="redisConfig.hostname"/>
											</div>
											<div class="field col">
												<label for="port">端口</label>
												<InputText type="number" v-model="redisConfig.port"/>
											</div>
										</div>
										<div class="field">
											<label for="password">密码</label>
											<InputText type="password" v-model="redisConfig.password"/>
										</div>
									</div>
									<div class="flex justify-content-start align-items-center">
										<Button label="测试连接" style="max-height: 34px;" @click="testRedis"></Button>
										<Message :closable="false" class="ml-2"
										         :severity="connectionStates.redis === 'open' ? 'success' : (connectionStates.redis === 'close' ? 'error' : 'contrast')">
											连接状态：{{
												connectionStates.redis === 'open' ? '成功' : (connectionStates.redis === 'close' ? '失败' : '未知')
											}}
										</Message>
									</div>
									<Divider align="left" type="solid">
										<strong>F4Pan</strong>
									</Divider>
									<div class="p-fluid">
										<div class="field">
											<label for="require">解析密钥</label>
											<div class="grid">
												<div class="col-12 md:col-4">
													<div class="field-radiobutton mb-0">
														<RadioButton value="dynamic"
														             v-model="systemConfig.requires_key"/>
														<label for="dynamic">动态密钥</label>
													</div>
												</div>
												<div class="col-12 md:col-4">
													<div class="field-radiobutton mb-0">
														<RadioButton value="fixed" v-model="systemConfig.requires_key"/>
														<label for="fixed">固定密钥</label>
													</div>
												</div>
												<div class="col-12 md:col-4">
													<div class="field-radiobutton mb-0">
														<RadioButton value="none" v-model="systemConfig.requires_key"/>
														<label for="none">无</label>
													</div>
												</div>
											</div>
										</div>
										<div class="field" v-if="systemConfig.requires_key === 'fixed'">
											<label for="fixed-key">固定密钥</label>
											<InputText type="text" v-model="systemConfig.fixed_key"/>
										</div>
										<div class="field">
											<label for="password">管理员密码</label>
											<InputText type="password" v-model="systemConfig.admin_password"/>
										</div>
										<div class="field">
											<label for="dynamic-key-timeout">动态密钥有效时长<code>(秒)</code></label>
											<InputText type="number" v-model="systemConfig.key_last_time"/>
										</div>
										<div class="field">
											<label for="real-url-timeout">真实链接存储时间<code>(秒)</code></label>
											<InputText type="number" v-model="systemConfig.real_url_last_time"/>
										</div>
										<div class="field">
											<label for="user-agent">解析 UA<code>(UA 中的产品标识必须为：netdisk)</code></label>
											<InputText type="text" v-model="systemConfig.parse_ua"/>
										</div>
										<div class="field">
											<label for="cookie">Cookie</label>
											<Textarea placeholder="" :autoResize="true" rows="3" cols="30"
											          v-model="systemConfig.normal_cookie"/>
										</div>
									</div>
								</div>
								<div class="flex pt-4 justify-content-between">
									<Button label="上一步" severity="secondary" icon="pi pi-arrow-left"
									        @click="prevCallback"/>
									<Button label="下一步" icon="pi pi-arrow-right" iconPos="right" :loading="loading"
									        @click="confirmEnvConfig(nextCallback, prevCallback, $event)"/>
								</div>
							</template>
						</StepperPanel>
						<StepperPanel header="开始安装">
							<template #content="{ prevCallback }">
								<ProgressBar :value="100" :mode="installing ? 'indeterminate' : 'determinate'"
								             style="height: 15px"></ProgressBar>
								<div class="flex flex-column mt-2" v-if="installed">
									<div class="border-2 border-dashed surface-border border-round surface-ground font-medium px-3 py-3">
										<div class="flex justify-content-center align-items-center">
											<Message :closable="false">安装成功
												<template #messageicon>
													<i class="pi pi-check mx-2"></i>
												</template>
											</Message>
										</div>
										<Divider />
										<p class="par">系统安装成功，你现在可以<a href="/" class="mx-2"><strong>点击此处</strong></a>跳转前台。在使用本程序的过程的，仍要遵从开源协议以及国家法律法规！</p>
									</div>
								</div>
								<div class="flex pt-4 justify-content-start">
									<Button label="上一步" severity="secondary" icon="pi pi-arrow-left"
									        :disabled="installing || installed"
									        @click="prevCallback"/>
								</div>
							</template>
						</StepperPanel>
					</Stepper>
				</div>
			</Panel>
		</div>
	</div>
</template>

<style scoped>
.p-stepper {
	flex-basis: 50rem;
}

.par {
	text-indent: 2rem;
}
</style>