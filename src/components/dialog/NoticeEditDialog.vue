<script setup lang="ts">
import Dialog from 'primevue/dialog';
import {computed, ref, watch} from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import {stringIsEmpty} from '@/utils/string-is-empty';
import {useMessage} from '@/hooks/useMessage';
import {addNotice, updateNotice} from '@/services/notice';

interface Props {
	type: 'new' | 'edit';
	title: string;
	content: string;
	id?: number | undefined;
	modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
	(e: 'update:modelValue', value: boolean): void;
	(e: 'operation:done'): void;
}>();
const show = computed<boolean>({
	get: () => props.modelValue,
	set: v => emit('update:modelValue', v)
});
const titleRef = ref<string>('');
const contentRef = ref<string>('');
const message = useMessage();
const loading = ref(false);

const promiseDone = () => {
	loading.value = false;
	show.value = false;
	titleRef.value = '';
	contentRef.value = '';
};
const done = async () => {
	if (stringIsEmpty(titleRef.value) || stringIsEmpty(contentRef.value)) {
		message.warn('请输入完整！');
		return;
	}
	if (props.type === 'edit' && props.id === undefined) {
		show.value = false;
		message.warn('系统错误！');
		return;
	}
	loading.value = true;
	if (props.type === 'edit') {
		updateNotice(titleRef.value, contentRef.value, props.id!!)
			.then(() => message.success('修改成功！'))
			.finally(promiseDone);
	} else {
		addNotice(titleRef.value, contentRef.value)
			.then(() => message.success('添加成功！'))
			.finally(promiseDone);
	}
};


watch(show, (visible) => {
	if (visible) {
		titleRef.value = props.title;
		contentRef.value = props.content;
	} else {
		emit('operation:done');
	}
});

</script>

<template>
	<Dialog v-model:visible="show" modal :header="`${type === 'new' ? '新建' : '编辑'}公告`" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
		<div class="flex align-items-center gap-3 mb-5">
			<label for="email" class="font-semibold w-6rem">标题</label>
			<InputText class="flex-auto" autocomplete="off" type="text" v-model="titleRef" />
		</div>
		<div class="flex align-items-center gap-3 mb-5">
			<label for="email" class="font-semibold w-6rem">公告内容</label>
			<Textarea placeholder="" v-model="contentRef" :autoResize="true" rows="3" cols="55" />
		</div>
		<div class="flex justify-content-end gap-2">
			<Button type="button" label="取消" severity="secondary" @click="show = false" :loading="loading"></Button>
			<Button type="button" label="确认" @click="done" :loading="loading"></Button>
		</div>
	</Dialog>
</template>

<style scoped>

</style>