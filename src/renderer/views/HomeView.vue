<script setup lang="ts">
    import { ref, onMounted, computed, Ref, nextTick } from "vue"
    import { useRouter } from "vue-router"
    import { ProjectSettings } from "@Common/models/Project"
    import Main from "@Renderer/services/wrappers/Main"
    import CreateProjectView from "@Renderer/views/components/Home/CreateProjectView.vue"
    import { compareVersions } from 'compare-versions'
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import ProjectManager from "@Renderer/services/project/ProjectManager"
    import { ClipboardDocumentIcon, Cog6ToothIcon, CommandLineIcon, FolderIcon, PlusCircleIcon, ShieldExclamationIcon, XMarkIcon, InformationCircleIcon } from "@heroicons/vue/24/outline"
    import UiConfirm from "@Renderer/components/ui/UiConfirm.vue"
    import UiOptionsDropdown from "@Renderer/components/ui/UiOptionsDropdown.vue"
    import UiDropdownItem from "@Renderer/components/ui/UiDropdownItem.vue"
    import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"
    import Alert from "@Renderer/components/utils/Alert"
    import ProjectInfo from "@Renderer/services/project/ProjectInfo"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"
    import UiLoading from "@Renderer/components/ui/UiLoading.vue"
    import Settings from "@Renderer/views/components/System/Settings.vue"
    import LicenseHandler from "@Renderer/services/LicenseHandler"
    import { useErrorsStore } from "@Renderer/stores/useErrorsStore"
    import MainErrorsDialog from "./components/System/MainErrorsDialog.vue"

    const projectManager = new ProjectManager(),
        search = ref(""),
        projects = ref([]),
        errorsStore = useErrorsStore(),
        errorsDialog = ref(null),
        loadingProjectId = ref(null),
        confirmDisconnectDialog = ref(null),
        currentConnectingFolder = ref(null),
        showingWelcomeModal = ref(false),
        showingConnectingFolderModal = ref(false),
        processingConnectFolder = ref(false),
        settingsModal = ref(null),
        vemtoVersion = ref("2.0.0"),
        connectingFolderSettings = ref({
            cssFramework: "tailwind",
            uiStarterKit: "jetstream",
            usesLivewire: false,
            usesInertia: false,
            usesVue: false,
            usesReact: false,
            usesSvelte: false,
            isFreshLaravelProject: false,
        }) as Ref<ProjectSettings>

    const router = useRouter()

    onMounted(async () => {
        const licenseHandler = new LicenseHandler()
        licenseHandler.checkLicense()

        getProjects()

        fillAppVersion()

        checkAndShowWelcomeModal()

        window.addEventListener("error", (event) => {
            console.log("Error happened in the renderer process")
        })
    })

    const getProjects = () => {
        projects.value = projectManager.get()
    }

    const fillAppVersion = async () => {
        vemtoVersion.value = await Main.API.getAppVersion()
    }

    const filteredProjects = computed(() => {
        return projects.value.filter((project) => {
            return project.path.includes(search.value)
        })
    })

    const reloadProjectListAndOpenPath = (path: string) => {
        getProjects()
        
        nextTick(() => {
            openPath(path, true)
        })
    }

    const openFolder = async () => {
        const phpInstalled = await Main.API.phpIsInstalled()
        
        if(!phpInstalled) {
            Alert.warning("PHP was not detected. Please install PHP or set the correct path in the settings to connect a local project")
            return
        }

        const path = await Main.API.openFolderDialog()

        if (!path) return

        await openPath(path)
    }

    const openProject = async (project: any) => {
        try {
            loadingProjectId.value = project.id
            
            await openPath(project.path)
        } catch (error) {
            Alert.error("Please check the application errors before trying to open")

            loadingProjectId.value = null

            throw error
        }
    }

    const finishConnect = async (path) => {
        try {
            processingConnectFolder.value = true
            
            projectManager.setSettings(connectingFolderSettings.value)
    
            await projectManager.connectFromPath(path)
            
            processingConnectFolder.value = false
    
            errorsStore.clearErrors()

            openSchema()
        } catch (error) {
            Alert.error("Please check the application errors before trying to connect")

            showingConnectingFolderModal.value = false
            processingConnectFolder.value = false

            throw error
        }
    }

    const openPath = async (path: string, isNewProject: boolean = false) => {
        currentConnectingFolder.value = path

        const projectInfo = new ProjectInfo(path)
        await projectInfo.read()

        if(!projectInfo.isLaravelProject) {
            Alert.error("This folder is not a Laravel project")
            return
        }

        const hasComposerVendor = await projectManager.projectHasComposerVendor(path)
        if(!hasComposerVendor) {
            Alert.error("This Laravel project does not have the vendor folder. Please run <b>composer install</b> before connecting it")
            
            loadingProjectId.value = null
            processingConnectFolder.value = false

            return
        }

        if(compareVersions(projectInfo.laravelVersion, "9.0.0") < 0) {
            Alert.error("Vemto only supports <b>Laravel 9+</b> projects. Please upgrade your Laravel version before connecting it")
            return
        }

        if(projectInfo.alreadyConnected) {
            await projectManager.connectFromPath(path)
            openSchema()
            return
        }

        buildConnectingFolderSettings(projectInfo, isNewProject)
        showingConnectingFolderModal.value = true
    }

    const buildConnectingFolderSettings = (projectInfo, isNewProject: boolean) => {
        connectingFolderSettings.value.cssFramework = projectInfo.getCssFramework()
        connectingFolderSettings.value.uiStarterKit = projectInfo.getStarterKit()
        connectingFolderSettings.value.usesLivewire = projectInfo.hasLivewire
        connectingFolderSettings.value.usesInertia = projectInfo.hasInertia
        connectingFolderSettings.value.usesVue = projectInfo.hasVue
        connectingFolderSettings.value.usesReact = projectInfo.hasReact
        connectingFolderSettings.value.usesSvelte = projectInfo.hasSvelte
        connectingFolderSettings.value.laravelVersion = projectInfo.laravelVersion
        connectingFolderSettings.value.isFreshLaravelProject = isNewProject
    }

    const closeConnectingFolderModal = () => {
        loadingProjectId.value = null
        processingConnectFolder.value = false
        showingConnectingFolderModal.value = false
    }

    const openSchema = async () => {
        router.push("/project/schema")
    }

    const disconnectProject = async (project: any) => {
        const confirmed = await confirmDisconnectDialog.value.confirm()
        if(!confirmed) return

        await projectManager.disconnect(project.id)

        getProjects()
    }

    const connectSSH = async () => {
        Alert.info("SSH connection is not available yet (under development)")
    }

    const copyProjectPath = (project: any) => {
        navigator.clipboard.writeText(project.path)

        Alert.success("Project path copied to clipboard")
    }

    const openProjectPath = (project: any) => {
        Main.API.openFolder(project.path)
    }

    const openProjectOnTerminal = (project: any) => {
        Main.API.openTerminal(project.path)
    }

    const openURL = (url: string) => {
        Main.API.openURL(url)
    }

    const checkAndShowWelcomeModal = () => {
        const welcomeModalClosedAt = localStorage.getItem("welcomeModalClosedAt")

        if(welcomeModalClosedAt) {
            const lastClosedAt = new Date(welcomeModalClosedAt)
            const now = new Date()
            const diff = now.getTime() - lastClosedAt.getTime()
            const diffInHours = diff / (1000 * 60 * 60)

            if(diffInHours < 24) return
        }

        showWelcomeModal()
    }

    const showWelcomeModal = async () => {
        showingWelcomeModal.value = true

        nextTick(async () => {
            const welcomeModalContentResponse = await fetch("https://raw.githubusercontent.com/TiagoSilvaPereira/vemto2-releases/main/alert.html"),
                welcomeModalContent = await welcomeModalContentResponse.text()

            document.getElementById("welcomeModalContent").innerHTML = welcomeModalContent

            // change all links href inside welcomeModalContent to open in the default browser using the openURL method
            document.querySelectorAll("#welcomeModalContent a").forEach((link) => {
                link.addEventListener("click", (event) => {
                    event.preventDefault()
                    openURL(link.getAttribute("href"))
                })
            })
        })
    }

    const closeWelcomeModal = () => {
        showingWelcomeModal.value = false

        // store the current time in the local storage to not show the welcome modal
        // again for a while
        localStorage.setItem("welcomeModalClosedAt", new Date().toISOString())
    }
</script>

<template>
    <UiConfirm ref="confirmDisconnectDialog">
        Are you sure you want to disconnect this project?
    </UiConfirm>

    <!-- Settings modal -->
    <Settings ref="settingsModal"></Settings>

    <!-- Welcome Modal -->
    <UiModal
        width="700px"
        height="600px"
        title="Welcome to Vemto 2 Pre-Alpha"
        :show="showingWelcomeModal"
        @close="closeWelcomeModal"
    >
        <div id="welcomeModalContent">
            
        </div>

        <template #footer>
            <div class="flex justify-end p-2 space-x-2 text-slate-500">
                Vemto {{ vemtoVersion }}
            </div>
        </template>
    </UiModal>

    <!-- Connect folder modal -->
    <UiModal
        width="700px"
        height="600px"
        title="Connect Folder"
        :show="showingConnectingFolderModal"
        :processing="processingConnectFolder"
        @close="closeConnectingFolderModal()"
    >
        <div class="p-4">
            <div class="m-1 flex flex-col gap-4">

                <div class="flex justify-end">
                    <div class="px-2 py-1 bg-slate-100 dark:bg-slate-950 rounded-md text-sm w-auto inline text-slate-750 dark:text-slate-300 font-mono">
                        Connecting to <span class="text-red-500 dark:text-red-400">{{ currentConnectingFolder }}</span>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <UiSelect v-model="connectingFolderSettings.cssFramework" label="CSS Framework">
                        <option value="tailwind">TailwindCSS</option>
                        <option value="bootstrap">Bootstrap</option>
                        <option value="bulma">Bulma</option>
                        <option value="foundation">Foundation</option>
                        <option value="other">Other</option>
                    </UiSelect>
    
                    <UiSelect v-model="connectingFolderSettings.uiStarterKit" label="Starter Kit">
                        <option value="jetstream">Jetstream</option>
                        <option value="breeze">Breeze</option>
                        <option value="laravel_ui">Laravel UI</option>
                        <option value="other">Other</option>
                    </UiSelect>
                </div>

                <div class="flex flex-col">
                    <UiCheckbox v-model="connectingFolderSettings.usesLivewire" label="Has Livewire installed"></UiCheckbox>
                    <UiCheckbox v-model="connectingFolderSettings.usesInertia" label="Has Inertia installed"></UiCheckbox>
                    <UiCheckbox v-model="connectingFolderSettings.usesVue" label="Has Vue installed"></UiCheckbox>
                </div>

                <div>
                    <UiCheckbox v-model="connectingFolderSettings.isFreshLaravelProject" label="It is a fresh Laravel project"></UiCheckbox>

                    <div class="mt-2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 font-mono text-sm text-slate-700 dark:text-slate-300" v-if="connectingFolderSettings.isFreshLaravelProject">
                        When a project is marked as fresh, Vemto will automatically generate some specific files after connecting it. This is useful when you want to connect a new project that was created manually. It is not recommended to mark a project as fresh if it is a previous existing project, as it may overwrite some files.
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end p-2">
                <UiButton @click="finishConnect(currentConnectingFolder)">
                    <div class="flex space-x-1" v-if="processingConnectFolder">
                        <UiLoading></UiLoading> 
                        <div>Connecting...</div>
                    </div>
                    <div v-else>Connect</div>
                </UiButton>
            </div>
        </template>
    </UiModal>

    <section class="p-4 space-y-5 dark:bg-slate-900 h-screen">
        <header class="flex w-full justify-center mt-10">
            <div class="flex flex-col">
                <div class="flex gap-2">
                    <CreateProjectView @reloadProjectListAndOpenPath="reloadProjectListAndOpenPath" />
                    <UiButton class="gap-1.5" @click="openFolder()">
                        <FolderIcon class="w-5 h-5 text-red-500" />
                        Connect Folder
                    </UiButton>
                    <UiButton class="gap-1.5" @click="connectSSH">
                        <CommandLineIcon class="w-5 h-5 text-red-500" />
                        Connect SSH
                    </UiButton>
                </div>
            </div>
        </header>

        <main class="flex flex-col items-center justify-center gap-4">
            <div class="mt-8 w-1/3 max-w-xl">
                <UiText v-model="search" placeholder="Search Apps..." />
            </div>

            <UiEmptyMessage v-if="!projects.length">
                There are no connected apps
            </UiEmptyMessage>

            <div class="flex flex-col gap-2 w-1/2 max-w-xl">
                <div v-for="project in filteredProjects" @click="openProject(project)" class="p-2 rounded-lg border border-slate-300 dark:border-slate-650 bg-slate-50 dark:bg-slate-850 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                    <div class="flex justify-between text-slate-200">
                        <span>{{ project.path.split(/\/|\\/).pop() }}</span>

                        <div class="h-6">
                            <UiLoading 
                                v-if="loadingProjectId === project.id"
                                :size="15"
                                :strokeWidth="2"
                            ></UiLoading>
                            <UiOptionsDropdown v-else>
                                <UiDropdownItem @click="copyProjectPath(project)">
                                    <ClipboardDocumentIcon class="h-5 w-5 mr-1 text-red-400" /> Copy Path
                                </UiDropdownItem>
                                <UiDropdownItem @click="openProjectPath(project)">
                                    <FolderIcon class="h-5 w-5 mr-1 text-red-400" /> Open Folder
                                </UiDropdownItem>
                                <UiDropdownItem @click="openProjectOnTerminal(project)">
                                    <CommandLineIcon class="h-5 w-5 mr-1 text-red-400" /> Open Terminal
                                </UiDropdownItem>
                                <UiDropdownItem @click="disconnectProject(project)">
                                    <XMarkIcon class="h-5 w-5 mr-1 text-red-400" /> Disconnect
                                </UiDropdownItem>
                            </UiOptionsDropdown>
                        </div>
                    </div>
                    <div class="flex flex-col space-y-1">
                        <span class="text-slate-450">{{ project.path }}</span>
                        <span v-if="project.laravelVersion" class="text-xs text-slate-500">Laravel {{ project.laravelVersion }}</span>
                    </div>
                </div>
            </div>

            <div
                class="fixed flex justify-end bottom-0 right-0 z-50 w-[194px]"
            >
                <MainErrorsDialog ref="errorsDialog" />

                <div class="p-2 bg-slate-200 dark:bg-slate-900 rounded-l-full">
                    <div
                        class="py-2 px-5 rounded-full shadow bg-slate-100 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 flex space-x-2"
                    >
                        <button
                            title="Log and Errors"
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
                        </button>
                        
                        <button
                            title="Settings"
                            @click="settingsModal.show()"
                            class="relative cursor-pointer"
                        >
                            <Cog6ToothIcon
                                class="w-7 h-7 stroke-1 hover:text-red-500 dark:hover:text-red-500"
                            />
                        </button>

                        <button
                            title="About Vemto"
                            @click="showWelcomeModal()"
                            class="relative cursor-pointer"
                        >
                            <InformationCircleIcon
                                class="w-7 h-7 stroke-1 hover:text-red-500 dark:hover:text-red-500"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </section>
</template>
