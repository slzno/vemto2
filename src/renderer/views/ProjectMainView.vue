<script setup lang="ts">
    import { RouterView } from "vue-router"
    import ProjectNavbar from "@Renderer/views/components/ProjectNavbar.vue"
    import { onMounted, onUnmounted, ref } from "vue"
    import HandleProjectDatabase from "@Renderer/services/HandleProjectDatabase"
    import {
        CommandLineIcon,
        FolderIcon,
        PlayIcon,
        ShieldExclamationIcon,
    } from "@heroicons/vue/24/outline"
    import SequentialGenerator from "@Renderer/codegen/sequential/SequentialGenerator"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { useAppStore } from "@Renderer/stores/useAppStore"
    import UiLoading from "@Renderer/components/ui/UiLoading.vue"
    import Alert from "@Renderer/components/utils/Alert"
    import Main from "@Renderer/services/wrappers/Main"
    import SchemaBuilder from "@Renderer/services/schema/SchemaBuilder"
    import ErrorsDialog from "./components/ProjectMain/ErrorsDialog.vue"
    import { useErrorsStore } from "@Renderer/stores/useErrorsStore"

    const canShow = ref(false),
        projectStore = useProjectStore(),
        errorsStore = useErrorsStore(),
        appStore = useAppStore(),
        errorsDialog = ref(null)

    let sourceCheckerTimeout = null

    onMounted(async () => {
        handleKeyInputs()

        await HandleProjectDatabase.populate(() => {
            canShow.value = true

            checkSourceChanges()
        })
    })

    onUnmounted(() => {
        if (sourceCheckerTimeout) clearTimeout(sourceCheckerTimeout)
    })

    const handleKeyInputs = () => {
        document.addEventListener("keydown", (e) => {
            if (e.key === "F5") generateCode()
            if (e.key === "F6") openProjectFolder()
            if (e.key === "F7") openProjectOnTerminal()
        })
    }

    /**
     * Checks for source changes every 750ms.
     * Take care before changing the methods below.
     */
    const checkSourceChanges = async () => {
        if (sourceCheckerTimeout) clearTimeout(sourceCheckerTimeout)

        if (projectStore.projectIsEmpty) {
            scheduleNextCheck() // Schedule the next check if the current project is empty.
            return
        }

        const schemaBuilder = new SchemaBuilder(projectStore.project)

        await schemaBuilder.checkSchemaChanges()

        scheduleNextCheck() // Schedule the next check after the current one finishes.
    }

    const scheduleNextCheck = () => {
        sourceCheckerTimeout = setTimeout(checkSourceChanges, 750)
    }

    const generateCode = async () => {
        if (projectStore.project.hasSchemaChanges()) {
            Alert.warning(
                "There are schema changes that need to be applied before generating code"
            )
            return
        }

        appStore.startGeneratingCode()

        try {
            await new SequentialGenerator(projectStore.project).run()

            setTimeout(() => {
                appStore.finishGeneratingCode()
                const elapsedTime = SequentialGenerator.getElapsedTimeInSeconds()
                
                Alert.success(
                    `Code generated successfully in ${elapsedTime} seconds`,
                    2000
                )
            }, 500)
        } catch (error) {
            appStore.finishGeneratingCode()
            throw error
        }
    }

    const openProjectFolder = () => {
        Main.API.openProjectFolder("/")
    }

    const openProjectOnTerminal = () => {
        Main.API.openProjectFolderOnTerminal("/")
    }
</script>

<template>
    <div class="h-full flex">
        <ProjectNavbar />

        <!-- Content -->
        <div v-if="canShow" class="flex-1">
            <RouterView />

            <div
                class="fixed flex justify-end bottom-0 right-0 z-50 w-[194px]"
            >
                <ErrorsDialog ref="errorsDialog" />

                <div class="p-2 bg-slate-900 rounded-l-full">
                    <div
                        class="py-2 px-5 rounded-full shadow bg-slate-850 border border-slate-700 flex space-x-2"
                    >
                        <div>
                            <button
                                class="flex text-slate-300 outline-none focus:text-red-500 cursor-pointer hover:text-red-500"
                                title="Generate Code (F5)"
                                @click="generateCode()"
                            >
                                <div
                                    v-if="appStore.isGenerating"
                                    class="w-7 h-7 stroke-1"
                                >
                                    <UiLoading />
                                </div>
                                <PlayIcon v-else class="w-7 h-7 stroke-1" />
                            </button>
                        </div>
                        <button
                            class="flex text-slate-300 outline-none focus:text-red-500 cursor-pointer hover:text-red-500"
                            title="Open Project Folder (F6)"
                            @click="openProjectFolder()"
                        >
                            <FolderIcon class="w-7 h-7 stroke-1" />
                        </button>
                        <button
                            class="flex text-slate-300 outline-none focus:text-red-500 cursor-pointer hover:text-red-500"
                            title="Open Project on Command Line (F7)"
                            @click="openProjectOnTerminal()"
                        >
                            <CommandLineIcon class="w-7 h-7 stroke-1" />
                        </button>
                        <div
                            @click="errorsDialog.toggle()"
                            class="relative cursor-pointer"
                        >
                            <!-- Errors alert animation -->
                            <div
                                v-show="errorsStore.hasErrors"
                                class="absolute rounded-full w-3 h-3 bg-red-600 animate-ping"
                                style="left: 25px; bottom: 20px"
                            ></div>
                            <ShieldExclamationIcon
                                :class="{
                                    'text-red-500': errorsStore.hasErrors,
                                    'text-slate-300': !errorsStore.hasErrors,
                                }"
                                class="w-7 h-7 stroke-1 hover:text-red-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
