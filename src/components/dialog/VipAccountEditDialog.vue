<script setup lang="ts">
import {ref, watch} from 'vue';
import Dialog from 'primevue/dialog';
import Image from 'primevue/image';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Textarea from 'primevue/textarea';
import {getCookieForBduss, getQrCode as getBDQrcode, unicastQrCode} from '@/services/login';
import {stringIsEmpty} from '@/utils/string-is-empty';
import {useMessage} from '@/hooks/useMessage';
import {addVipAccount, updateVipAccount} from '@/services/svip';

interface Props {
	type: 'new' | 'edit';
	cookie?: string;
	id?: number | undefined;
}

interface QrCode {
	url: string;
	sign: string;
	state: 'ScanComplete' | 'Scanning' | 'Wait';
}

const message = useMessage();
const props = defineProps<Props>();
const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void
	(e: 'operation:done', value: void): void
}>();
let controller: AbortController | undefined = undefined;
const cookieRef = ref<string>('');
const qrcode = ref<QrCode>({
	state: 'Wait',
	sign: '',
	url: ''
});
const show = ref(false);
const closeTask = () => {
	controller?.abort();
	controller = undefined;
	qrcode.value.url = '';
	qrcode.value.sign = '';
	qrcode.value.state = 'Wait';
};

const done = async (cookie: string) => {
	try {
		if (stringIsEmpty(cookie)) {
			message.error('Cookie 获取失败！');
			return;
		}
		if (props.type === 'new') {
			await addVipAccount(cookie);
			message.success('添加成功！');
		} else {
			if (props.id === undefined) {
				message.error('系统错误！');
				return;
			}
			await updateVipAccount(props.id);
			message.success('修改成功！');
		}
		closeDialog();
		emit('operation:done');
	} catch {}
};

const getAndSaveCookie = async (v: string) => {
	try {
		const {data: response} = await getCookieForBduss(v);
		if (response.data.cookie) {
			message.success('扫码登录成功！');
			qrcode.value.state = 'Wait';
			await done(response.data.cookie);
		}
	} catch {
		message.error('扫码登录失败！');
	}
};

const checkQrCode = async () => {
	try {
		controller = new AbortController();
		const {data: response} = await unicastQrCode(qrcode.value.sign, controller.signal);
		if (response.data?.bduss) {
			qrcode.value.state = 'ScanComplete';
			message.default('扫码成功，正在登录……');
			getAndSaveCookie(response.data?.bduss).then(undefined);
		} else {
			throw new Error();
		}
	} catch {
		checkQrCode().then(undefined);
	}
};

const getQrCode = async () => {
	const {data: response} = await getBDQrcode();
	qrcode.value.url = response.data.imgurl;
	qrcode.value.sign = response.data.sign;
	qrcode.value.state = 'Scanning';
	window.setTimeout(checkQrCode, 60);
};

const showDialog = () => {
	getQrCode();
	show.value = true;
};

const closeDialog = () => {
	closeTask();
	show.value = false;
};

const confirm = () => {
	if (stringIsEmpty(cookieRef.value)) {
		message.warn('请填写 Cookie !');
		return;
	}
	done(cookieRef.value);
};

defineExpose({
	showDialog,
	closeDialog
});

watch(show, (visible) => {
	if (visible) {
		cookieRef.value = props.cookie || '';
	}
});
</script>

<template>
	<Dialog v-model:visible="show" :closable="false" modal :header="`${type === 'new' ? '新建' : '编辑'}账号`"
	        :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
		<TabView>
			<TabPanel header="扫码登录">
				<div class="flex justify-content-center align-items-center flex-wrap">
					<Image :src="qrcode.url"/>
					<Divider/>
					<Button label="取消" class="m-2" @click="closeDialog"></Button>
					<Button label="确认登录" class="m-2" v-show="qrcode.state === 'ScanComplete'"></Button>
				</div>
			</TabPanel>
			<TabPanel header="手动登录">
				<Textarea placeholder="" v-model="cookieRef" :autoResize="true" rows="5" cols="55"/>
				<Divider/>
				<Button label="确定" class="m-2" @click="confirm"></Button>
			</TabPanel>
		</TabView>
	</Dialog>
</template>

<style scoped>

</style>