<script setup lang="ts">
    import {
        HomeIcon,
        CircleStackIcon,
        CodeBracketIcon,
        Cog8ToothIcon,
        RectangleStackIcon,
        WrenchScrewdriverIcon,
        PuzzlePieceIcon,
    } from "@heroicons/vue/24/outline"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { useNavigationStore } from "@Renderer/stores/useNavigationStore"
    import { useRouter } from "vue-router"

    import ProjectManager from "@Renderer/services/project/ProjectManager"

    const router = useRouter(),
        projectStore = useProjectStore(),
        navigationStore = useNavigationStore()

    const goToHome = async () => {
        // Close the project manager to avoid the schema checker 
        // from the current project running on the next project.
        await ProjectManager.close()

        router.push("/")
        navigationStore.clearActiveTab()
        
        projectStore.closeProject()
    }

    const setActiveTab = (tab: string) => {
        navigationStore.setActiveTab(tab)

        const element = document.activeElement as HTMLElement

        element.blur()
    }
</script>

<template>
    <nav class="w-20 h-full flex flex-col items-center justify-between bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-800">
        <div>
            <button
                title="Home"
                class="w-full h-12 flex justify-center items-center py-10 mt-4 text-slate-500 dark:text-slate-600 cursor-pointer hover:text-slate-600 dark:hover:text-slate-400 outline-none focus:!text-slate-800 dark:focus:!text-slate-400"
                @click="goToHome()"
            >
                <HomeIcon class="w-5 h-5 stroke-2" />
            </button>

            <RouterLink
                title="Schema Editor"
                @click="setActiveTab('schema')"
                :class="{
                    'text-red-500': navigationStore.activeTabIs('schema'),
                    'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 focus:!text-slate-800 dark:focus:!text-slate-400': navigationStore.activeTabIsNot('schema'),
                }"
                class="w-full h-12 flex justify-center items-center py-10 outline-none"
                as="button"
                to="/project/schema"
            >
                <CircleStackIcon class="w-9 h-9 stroke-1.5" />
            </RouterLink>

            <RouterLink
                title="Apps"
                @click="setActiveTab('apps')"
                :class="{
                    'text-red-500': navigationStore.activeTabIs('apps'),
                    'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 focus:!text-slate-800 dark:focus:!text-slate-400': navigationStore.activeTabIsNot('apps'),
                }"
                class="w-full h-12 flex justify-center items-center py-10 outline-none"
                as="button"
                to="/project/apps"
            >
                <RectangleStackIcon class="w-9 h-9 stroke-1.5" />
            </RouterLink>

            <RouterLink
                title="Soon..."
                @click="setActiveTab('bot')"
                :class="{
                    'text-red-500': navigationStore.activeTabIs('bot'),
                    'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 focus:!text-slate-800 dark:focus:!text-slate-400': navigationStore.activeTabIsNot('bot'),
                }"
                class="w-full h-12 flex justify-center items-center py-10 outline-none"
                as="button"
                to="/project/bot"
            >
                <svg class="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-width="0.1" fill="currentColor" d="M14.754 15a2.249 2.249 0 0 1 2.249 2.249v.575c0 .895-.32 1.76-.901 2.439C14.532 22.096 12.145 23 9 23c-3.146 0-5.532-.905-7.098-2.74a3.75 3.75 0 0 1-.899-2.434v-.578A2.249 2.249 0 0 1 3.253 15h11.501Zm0 1.5H3.252a.749.749 0 0 0-.749.749v.578c0 .535.192 1.053.54 1.46C4.295 20.756 6.261 21.502 9 21.502s4.706-.746 5.962-2.214a2.25 2.25 0 0 0 .54-1.463v-.575a.749.749 0 0 0-.748-.749Zm4.3-15.096a.75.75 0 0 1 1.023.279A12.693 12.693 0 0 1 21.75 8c0 2.254-.586 4.424-1.684 6.336a.75.75 0 1 1-1.3-.746A11.195 11.195 0 0 0 20.25 8c0-1.983-.513-3.89-1.475-5.573a.75.75 0 0 1 .279-1.023ZM9 3.004a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm6.588.396a.75.75 0 0 1 1.023.28A8.712 8.712 0 0 1 17.75 8c0 1.538-.398 3.02-1.144 4.328a.75.75 0 1 1-1.303-.743A7.214 7.214 0 0 0 16.25 8a7.213 7.213 0 0 0-.943-3.578.75.75 0 0 1 .281-1.022ZM9 4.505a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /></svg>
            </RouterLink>

            <RouterLink
                title="Files Queue"
                @click="setActiveTab('code-queue')"
                :class="{
                    'text-red-500': navigationStore.activeTabIs('code-queue'),
                    'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 focus:!text-slate-800 dark:focus:!text-slate-400': navigationStore.activeTabIsNot('code-queue'),
                }"
                class="w-full h-12 flex justify-center items-center py-10 relative outline-none"
                as="button"
                to="/project/code-queue"
            >
                <div v-show="projectStore.hasRenderableFilesWithConflict" class="absolute rounded-full w-3 h-3 bg-red-500 animate-pulse" style="left: 30px; bottom: 20px;"></div>
                <CodeBracketIcon class="w-9 h-9 stroke-1.5" />
            </RouterLink>
        </div>

        <div class="pb-4">
            <RouterLink
                title="Settings"
                @click="setActiveTab('settings')"
                :class="{
                    'text-red-500': navigationStore.activeTabIs('settings'),
                    'text-slate-500 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 focus:!text-slate-800 dark:focus:!text-slate-400': navigationStore.activeTabIsNot('settings'),
                }"
                class="w-full h-12 flex justify-center items-center py-6 relative outline-none"
                as="button"
                to="/project/settings"
            >
                <Cog8ToothIcon class="w-6 h-6 stroke-1.3" />
            </RouterLink>
            
            <RouterLink
                title="Tools"
                @click="setActiveTab('tools')"
                :class="{
                    'text-red-500': navigationStore.activeTabIs('tools'),
                    'text-slate-500 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 focus:!text-slate-800 dark:focus:!text-slate-400': navigationStore.activeTabIsNot('tools'),
                }"
                class="w-full h-12 flex justify-center items-center py-6 relative outline-none"
                as="button"
                to="/project/tools"
            >
                <WrenchScrewdriverIcon class="w-6 h-6 stroke-1.5" />
            </RouterLink>

            <RouterLink
                title="Plugins"
                @click="setActiveTab('plugins')"
                :class="{
                    'text-red-500': navigationStore.activeTabIs('plugins'),
                    'text-slate-500 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 focus:!text-slate-800 dark:focus:!text-slate-400': navigationStore.activeTabIsNot('plugins'),
                }"
                class="w-full h-12 flex justify-center items-center py-6 relative outline-none"
                as="button"
                to="/project/plugins"
            >
                <PuzzlePieceIcon class="w-6 h-6 stroke-1.3" />
            </RouterLink>
        </div>
    </nav>
</template>
