<script setup lang="ts">
    import { RouterView } from "vue-router"
    import ProjectNavbar from "@Renderer/views/components/ProjectNavbar.vue"
    import { onMounted, onUnmounted, ref, Ref } from "vue"
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
    import UiConfirm from "@Renderer/components/ui/UiConfirm.vue"
    import UiWarning from "@Renderer/components/ui/UiWarning.vue"
    import UiInfo from "@Renderer/components/ui/UiInfo.vue"
    import LicenseModal from "./components/System/LicenseModal.vue"
    import LicenseHandler from "@Renderer/services/LicenseHandler"

    const canShow = ref(false),
        projectStore = useProjectStore(),
        errorsStore = useErrorsStore(),
        appStore = useAppStore(),
        errorsDialog = ref(null),
        confirmDialog = ref(null),
        aiConfirmDialog = ref(null),
        licenseModal = ref(null),
        licenseModalWarningMessage = ref(""),
        confirmDialogMessage = ref(""),
        confirmDialogTitle = ref(""),
        confirmDialogOptions = ref({}) as Ref<any>

    let sourceCheckerTimeout = null

    onMounted(async () => {
        handleKeyInputs()
        setupLicenseModal()
        setupDefaultConfirmDialog()

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

    const setupLicenseModal = () => {
        const licenseHandler = new LicenseHandler()

        window.licenseIsActive = () => {
            return licenseHandler.isActive()
        }

        window.showLicenseModal = async (warningMessage = "") => {
            licenseModalWarningMessage.value = warningMessage || "You are trying to use a feature that requires a license. Please enter your e-mail and license key to activate it."

            await licenseModal.value.show()
        }
    }

    const setupDefaultConfirmDialog = () => {
        window.projectConfirm = async (
            message: string = "Are you sure?", 
            title: string = "Confirm",
            options: any = {}
        ): Promise<boolean> => {
            confirmDialogTitle.value = title
            confirmDialogMessage.value = message
            confirmDialogOptions.value = options

            const confirmed = await confirmDialog.value.confirm()
            return confirmed
        }

        window.aiConfirm = async (): Promise<boolean> => {
            const storageKey = `doNotShowAiConfirm_${projectStore.project.id}`

            if(window.localStorage.getItem(storageKey)) return true

            const confirmed = await aiConfirmDialog.value.confirm()
            if(!confirmed) return false
            
            if(confirmed.doNotShowAgain) {
                window.localStorage.setItem(storageKey, 'true')
            }

            return true
        }
    }

    const generateCode = async () => {
        console.log('Will generate')
        const currentTablesCount = projectStore.project.tables.length

        if(!window.licenseIsActive() && currentTablesCount >= 12) {
            window.showLicenseModal("You've hit the limit of 12 tables for the Free License. Please activate your license to generate code.")
            return
        }

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

    const openURL = (url: string) => {
        Main.API.openURL(url)
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

            <LicenseModal
                ref="licenseModal" 
                show-warning
                :warning-message="licenseModalWarningMessage"
            />

            <UiConfirm ref="confirmDialog" :title="confirmDialogTitle">
                <div v-html="confirmDialogMessage"></div>
                <div class="mt-2" v-if="confirmDialogOptions.alertMessage">
                    <UiWarning>
                        {{ confirmDialogOptions.alertMessage }}
                    </UiWarning>
                </div>
                <div class="mt-2" v-if="confirmDialogOptions.infoMessage">
                    <UiInfo>
                        {{ confirmDialogOptions.infoMessage }}
                    </UiInfo>
                </div>
            </UiConfirm>

            <UiConfirm 
                ref="aiConfirmDialog" 
                title="Confirm AI Usage"
                :options="{
                    'doNotShowAgain': {
                        'label': 'I confirm, please do not show this again',
                        'value': false
                    }
                }"
            >
                <div>
                    <UiInfo>
                        To use AI features, it may be necessary to send the project's schema or specific sections of code (only the necessary to run a specific task, for example, merging two versions of a PHP class or an abstract description of your migrations schema) to our servers (and maybe to OpenAI's API servers) for processing. 
                        <br>
                        <br>
                        We don't store any of your project data on our servers. We use it only to provide the features you are using.
                    </UiInfo>
                </div>
                <div class="mt-4">
                    By confirming this, you agree to our <a @click="openURL('https://adhesive-screen-52e.notion.site/Privacy-Policy-for-Vemto-30ab8d23544c4a33bc7dd0bdd2fa7d3b')" target="_blank" class="underline cursor-pointer text-blue-400">Privacy Policy</a> and to send your project's data to our servers and through OpenAI's API. You can learn more about OpenAI's policies <a @click="openURL('https://openai.com/policies')" target="_blank" class="underline cursor-pointer text-blue-400">here</a>.
                    <br>
                    <br>
                    If you have any questions or concerns, please contact us at <a @click="openURL('mailto:contact@vemto.app')" class="underline cursor-pointer text-blue-400">contact@vemto.app</a>.
                </div>
            </UiConfirm>

            <div
                class="fixed flex justify-end bottom-0 right-0 z-50 w-[194px]"
            >
                <ErrorsDialog ref="errorsDialog" />

                <div class="p-2 bg-slate-200 dark:bg-slate-900 rounded-l-full">
                    <div
                        class="py-2 px-5 rounded-full shadow bg-slate-100 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 flex space-x-2"
                    >
                        <div>
                            <button
                                class="flex text-slate-600 dark:text-slate-300 outline-none focus:text-red-500 cursor-pointer hover:text-red-500 dark:hover:text-red-500"
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
                            class="flex text-slate-600 dark:text-slate-300 outline-none focus:text-red-500 cursor-pointer hover:text-red-500 dark:hover:text-red-500"
                            title="Open Project Folder (F6)"
                            @click="openProjectFolder()"
                        >
                            <FolderIcon class="w-7 h-7 stroke-1" />
                        </button>
                        <button
                            class="flex text-slate-600 dark:text-slate-300 outline-none focus:text-red-500 cursor-pointer hover:text-red-500 dark:hover:text-red-500"
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
                                    'text-slate-600 dark:text-slate-300': !errorsStore.hasErrors,
                                }"
                                class="w-7 h-7 stroke-1 hover:text-red-500 dark:hover:text-red-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
