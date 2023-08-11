<script setup lang="ts">
    import { RouterView } from "vue-router"
    import ProjectNavbar from "@Renderer/views/components/ProjectNavbar.vue"
    import { onMounted, ref } from "vue"
    import HandleProjectDatabase from "@Renderer/services/HandleProjectDatabase"
    import { ArrowTopRightOnSquareIcon, CommandLineIcon, FolderIcon, PlayIcon, ShieldExclamationIcon } from "@heroicons/vue/24/outline"
    import SequentialGenerator from "@Renderer/codegen/sequential/SequentialGenerator"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { useAppStore } from "@Renderer/stores/useAppStore"
    import UiLoading from "@Renderer/components/ui/UiLoading.vue"
    import Alert from "@Renderer/components/utils/Alert"
    import Main from "@Renderer/services/wrappers/Main"

    const canShow = ref(false),
        projectStore = useProjectStore(),
        appStore = useAppStore()

    onMounted(async () => {
        await HandleProjectDatabase.populate(() => canShow.value = true)

        document.addEventListener("keydown", (e) => {
            if (e.key === "F5") generateCode()
            if (e.key === "F6") openProjectFolder()
            if (e.key === "F7") openProjectOnTerminal()
        })

    })

    const generateCode = async () => {
        appStore.startGeneratingCode()
        
        try {
            await new SequentialGenerator().run(projectStore.project)

            setTimeout(() => {
                appStore.finishGeneratingCode()
                const elapsedTime = SequentialGenerator.getElapsedTimeInSeconds()
                Alert.success(`Code generated successfully in ${elapsedTime} seconds`, 2000)
            }, 500)
        } catch (error) {
            appStore.finishGeneratingCode()
            throw error
        }
    }

    const openProjectFolder = () => {
        Main.API.openProjectFolder('/')
    }

    const openProjectOnTerminal = () => {
        Main.API.openProjectFolderOnTerminal('/')
    }
</script>

<template>
    <div class="h-full flex">
        <ProjectNavbar />

        <!-- Content -->
        <div v-if="canShow" class="flex-1">
            <RouterView />

            <div class="fixed flex justify-end bottom-0 p-2 z-50" style="width: calc(100% - 5rem)">
                <div class="py-2 px-5 rounded-full shadow bg-slate-800 border border-slate-600 flex space-x-2">
                    <div>
                        <button class="flex text-slate-300 cursor-pointer hover:text-red-500" title="Generate Code (F5)" @click="generateCode()">
                            <div v-if="appStore.isGenerating" class="w-6 h-6">
                                <UiLoading />
                            </div>
                            <PlayIcon v-else class="w-6 h-6" />
                        </button>
                    </div>
                    <button class="flex text-slate-300 cursor-pointer hover:text-red-500" title="Open Project Folder (F6)" @click="openProjectFolder()">
                        <FolderIcon class="w-6 h-6"/>
                    </button>
                    <button class="flex text-slate-300 cursor-pointer hover:text-red-500" title="Open Project on Command Line (F7)" @click="openProjectOnTerminal()">
                        <CommandLineIcon class="w-6 h-6" />
                    </button>
                    <ShieldExclamationIcon class="w-6 h-6 text-slate-300 cursor-pointer hover:text-red-500" />
                    <ArrowTopRightOnSquareIcon class="w-6 h-6 text-slate-300 cursor-pointer hover:text-red-500" />
                </div>
            </div>
        </div>
    </div>
</template>
