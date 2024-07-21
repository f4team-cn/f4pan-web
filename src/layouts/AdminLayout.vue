<script setup lang="ts">
import {ref} from 'vue';
import type {MenuItem} from 'primevue/menuitem';
import Menu from 'primevue/menu';
import routes from '@/router/routes';

const tabItems: MenuItem[] = routes.filter(v => v.name === 'Admin').pop()?.children?.filter(v => v.meta).map(r => {
	return {
		label: r.meta!!.title as string,
		icon: r.meta!!.icon as string,
		route: `/dashboard/${r.path}`
	}
}) || [];
const menu = ref<Menu>();
const items = ref<MenuItem[]>([
	{
		label: '控制台',
		items: tabItems || []
	}
]);

const toggleMenu = (e: Event) => menu.value?.toggle(e);
</script>

<template>
	<div class="layout-toolbar">
		<button class="p-link layout-menu-button layout-toolbar-button" @click="toggleMenu">
			<i class="pi pi-bars"></i>
		</button>
		<Menu ref="menu" :popup="true" :model="items" id="layout-toolbar-menu">
			<template #item="{ item, props }">
				<router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
					<a :href="href" v-bind="props.action" @click="navigate">
						<span :class="item.icon"/>
						<span class="ml-2">{{ item.label }}</span>
					</a>
				</router-link>
				<a v-else :href="item.url" :target="item.target" v-bind="props.action">
					<span :class="item.icon"/>
					<span class="ml-2">{{ item.label }}</span>
				</a>
			</template>
		</Menu>
		<router-link to="/" class="layout-toolbar-logo ml-2">
			<span>F4Pan</span>
		</router-link>
	</div>
	<div class="layout-main-container">
		<div class="layout-main">
			<router-view v-slot="{ Component }">
				<transition name="fade">
					<keep-alive>
						<component :is="Component"/>
					</keep-alive>
				</transition>
			</router-view>
		</div>
	</div>
</template>
