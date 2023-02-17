<script setup lang="ts">
    import {
        HomeIcon,
        CircleStackIcon,
        CodeBracketIcon,
        Cog8ToothIcon,
    } from "@heroicons/vue/24/outline"
    
    import { computed } from "vue"
    import { useRoute } from "vue-router"

    const route = useRoute(),
        activeRoute = computed(() => route.path)
</script>

<template>
    <nav class="w-20 h-full bg-white dark:bg-slate-900 border-r-2 border-slate-100 dark:border-slate-800">
        <ul>
            <RouterLink
                class="w-full h-12 flex justify-center items-center py-10 text-slate-400 dark:text-slate-600"
                as="li"
                to="/"
            >
                <HomeIcon class="w-5 h-5 stroke-2" />
            </RouterLink>

            <RouterLink
                :class="{
                    'text-red-500': activeRoute === '/project/schema',
                    'text-slate-400 dark:text-slate-600 hover:text-red-500': activeRoute !== '/project/schema',
                }"
                class="w-full h-12 flex justify-center items-center py-10"
                as="li"
                to="/project/schema"
            >
                <CircleStackIcon class="w-9 h-9 stroke-2" />
            </RouterLink>

            <RouterLink
                :class="{
                    'text-red-500': activeRoute === '/project/code-queue',
                    'text-slate-400 dark:text-slate-600 hover:text-red-500': activeRoute !== '/project/code-queue',
                }"
                class="w-full h-12 flex justify-center items-center py-10"
                as="li"
                to="/project/code-queue"
            >
                <CodeBracketIcon class="w-9 h-9 stroke-2" />
            </RouterLink>

            <li
                class="w-full h-12 flex justify-center items-center py-10 text-slate-400 dark:text-slate-600 hover:text-slate-800"
            >
                <Cog8ToothIcon class="w-9 h-9 stroke-2" />
            </li>
        </ul>
    </nav>
</template>
