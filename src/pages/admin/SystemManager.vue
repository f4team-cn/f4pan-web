<script setup lang="ts">
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Panel from 'primevue/panel';
import InputText from 'primevue/inputtext';
import Divider from 'primevue/divider';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import InputSwitch from 'primevue/inputswitch';
import RadioButton from 'primevue/radiobutton';
import {onMounted, ref} from 'vue';
import {
	addSystemConfig,
	deleteSystemConfig,
	getSystemConfigList,
	updateSystemConfig,
	UseSystemConfig
} from '@/services/system';
import type {SystemSetting} from '@/types';
import {useMessage} from '@/hooks/useMessage';
import {useConfirm} from 'primevue/useconfirm';

type Config = SystemSetting & { id: number | undefined; new: boolean };

const confirm = useConfirm();
const loading = ref(false);
const activeEditConfig = ref(0);
const configs = ref<Config[]>([]);
const message = useMessage();
onMounted(() => {
	setTimeout(async () => {
		try {
			message.default('正在加载……');
			const {data} = (await getSystemConfigList()).data;
			const cfg = data.map(v => {
				return {
					...v,
					is_active: Boolean(v.is_active),
					new: false
				};
			});
			configs.value.push(...cfg);
			message.clear();
		} catch {
		}
	}, 888);
});

const addConfig = () => {
	activeEditConfig.value = configs.value.length;
	configs.value.push({
		id: undefined,
		admin_password: '',
		fixed_key: '',
		is_active: false,
		key_last_time: '0',
		normal_cookie: '',
		notice_id: '0',
		parse_ua: '',
		real_url_last_time: '0',
		requires_key: 'none',
		new: true
	});
};

const save = async (item: Config) => {
	try {
		loading.value = true;
		message.default('正在保存……');
		let code;
		if (item.new || item.id == undefined) {
			const data = (await addSystemConfig(item)).data;
			const {id} = data.data!!;
			code = data.code;
			item.new = false;
			if (id) {
				item.id = id;
			}
		} else {
			code = (await updateSystemConfig(item, item.id)).data.code;
		}
		if (code === 1) {
			message.clear();
			message.success('保存成功！');
		}
	} catch (e) {
		console.error(e);
	}
	loading.value = false;
};

const changeActive = async (config: Config) => {
	if (config.is_active) {
		const index = configs.value.findIndex(v => v.id !== config.id && v.is_active);
		if (index > -1) {
			if (config.id === undefined) {
				config.is_active = false;
				message.warn('请先保存该配置后再启用！');
				return;
			}
			message.default('正在配置……');
			configs.value[index].is_active = false;
			config.is_active = true;
			try {
				await UseSystemConfig(config.id);
				message.success(`当前配置已设为主要配置，原配置：${index + 1} 已关闭。`);
			} catch {
				message.warn('启用失败！');
			}
		}
		return;
	}
	const res = configs.value.find(v => v.is_active);
	if (res === undefined) {
		config.is_active = true;
		message.warn('当前配置为主要配置，不能关闭。');
	}
};

const deleteConfig = (event: Event, config: Config, index: number) => {
	confirm.require({
		target: event.target as HTMLElement,
		message: '您要删除此配置吗？',
		icon: 'pi pi-info-circle',
		rejectClass: 'p-button-secondary p-button-outlined p-button-sm',
		acceptClass: 'p-button-danger p-button-sm',
		rejectLabel: '取消',
		acceptLabel: '确定',
		accept: async () => {
			if (config.new || config.id == undefined) {
				configs.value.splice(index, 1);
			} else {
				loading.value = true;
				try {
					await deleteSystemConfig(config.id);
					configs.value.splice(index, 1);
					message.success('删除成功！');
				} catch {
					message.warn('删除失败！');
				}
				loading.value = false;
			}
		},
		reject: () => {}
	});
};
</script>

<template>
	<div class="col-12">
		<Panel>
			<Accordion :active-index="activeEditConfig">
				<template v-for="(item, index) of configs">
					<AccordionTab :header="`配置-${index + 1}`">
						<div class="card p-fluid">
							<div class="field">
								<label for="require">解析密钥</label>
								<div class="grid">
									<div class="col-12 md:col-4">
										<div class="field-radiobutton mb-0">
											<RadioButton value="dynamic" v-model="item.requires_key"/>
											<label for="dynamic">动态密钥</label>
										</div>
									</div>
									<div class="col-12 md:col-4">
										<div class="field-radiobutton mb-0">
											<RadioButton value="fixed" v-model="item.requires_key"/>
											<label for="fixed">固定密钥</label>
										</div>
									</div>
									<div class="col-12 md:col-4">
										<div class="field-radiobutton mb-0">
											<RadioButton value="none" v-model="item.requires_key"/>
											<label for="none">无</label>
										</div>
									</div>
								</div>
							</div>
							<div class="field" v-if="item.requires_key === 'fixed'">
								<label for="fixed-key">固定密钥</label>
								<InputText type="text" v-model="item.fixed_key"/>
							</div>
							<div class="field">
								<label for="password">管理员密码</label>
								<InputText type="password" v-model="item.admin_password"/>
							</div>
							<div class="field">
								<label for="notice">公告ID</label>
								<InputText type="number" v-model="item.notice_id"/>
							</div>
							<div class="field">
								<label for="dynamic-key-timeout">动态密钥有效时长<code>(秒)</code></label>
								<InputText type="number" v-model="item.key_last_time"/>
							</div>
							<div class="field">
								<label for="real-url-timeout">真实链接存储时间<code>(秒)</code></label>
								<InputText type="number" v-model="item.real_url_last_time"/>
							</div>
							<div class="field">
								<label for="user-agent">解析 UA<code>(UA 中的产品标识必须为：netdisk)</code></label>
								<InputText type="text" v-model="item.parse_ua"/>
							</div>
							<div class="field">
								<label for="cookie">Cookie</label>
								<Textarea placeholder="" :autoResize="true" rows="3" cols="30"
								          v-model="item.normal_cookie"/>
							</div>
							<div class="field">
								<h5>启用</h5>
								<InputSwitch :disabled="loading" v-model="item.is_active" @change="changeActive(item)"/>
							</div>
							<Divider></Divider>
							<Button label="保存" :loading="loading" @click="save(item)"></Button>
							<Button class="mt-2" label="删除" :loading="loading" @click="deleteConfig($event, item, index)" severity="danger"></Button>
						</div>
					</AccordionTab>
				</template>
			</Accordion>
			<Divider></Divider>
			<Button label="添加新配置" @click="addConfig"></Button>
		</Panel>
	</div>
</template>

<style scoped>

</style>