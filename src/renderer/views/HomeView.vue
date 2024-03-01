<script setup lang="ts">
    import { ref, onMounted, computed, Ref } from "vue"
    import { useRouter } from "vue-router"
    import { ProjectSettings } from "@Common/models/Project"
    import Main from "@Renderer/services/wrappers/Main"
    import { compareVersions } from 'compare-versions'
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import ProjectManager from "@Renderer/services/project/ProjectManager"
    import { ClipboardDocumentIcon, Cog6ToothIcon, CommandLineIcon, FolderIcon, PlusCircleIcon, XMarkIcon } from "@heroicons/vue/24/outline"
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

    const projectManager = new ProjectManager(),
        search = ref(""),
        projects = ref([]),
        confirmDisconnectDialog = ref(null),
        currentConnectingFolder = ref(null),
        showingConnectingFolderModal = ref(false),
        processingConnectFolder = ref(false),
        settingsModal = ref(null),
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
    })

    const getProjects = () => {
        projects.value = projectManager.get()
    }

    const filteredProjects = computed(() => {
        return projects.value.filter((project) => {
            return project.path.includes(search.value)
        })
    })

    const openFolder = async () => {
        const path = await Main.API.openFolderDialog()

        if (!path) return

        await openPath(path)
    }

    const openProject = async (project: any) => {
        await openPath(project.path)
    }

    const finishConnect = async (path) => {
        processingConnectFolder.value = true

        projectManager.setSettings(connectingFolderSettings.value)

        await projectManager.connectFromPath(path)
        
        processingConnectFolder.value = false

        openSchema()
    }

    const openPath = async (path) => {
        currentConnectingFolder.value = path

        const projectInfo = new ProjectInfo(path)
        await projectInfo.read()

        if(!projectInfo.isLaravelProject) {
            Alert.error("This folder is not a Laravel project")
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

        buildConnectingFolderSettings(projectInfo)
        showingConnectingFolderModal.value = true
    }

    const buildConnectingFolderSettings = (projectInfo) => {
        connectingFolderSettings.value.cssFramework = projectInfo.getCssFramework()
        connectingFolderSettings.value.uiStarterKit = projectInfo.getStarterKit()
        connectingFolderSettings.value.usesLivewire = projectInfo.hasLivewire
        connectingFolderSettings.value.usesInertia = projectInfo.hasInertia
        connectingFolderSettings.value.usesVue = projectInfo.hasVue
        connectingFolderSettings.value.usesReact = projectInfo.hasReact
        connectingFolderSettings.value.usesSvelte = projectInfo.hasSvelte
        connectingFolderSettings.value.laravelVersion = projectInfo.laravelVersion
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

    const newApp = async () => {
        Alert.info("Applications creation wizard is not available yet. Please create a project manually then connect it to Vemto")
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
</script>

<template>
    <UiConfirm ref="confirmDisconnectDialog">
        Are you sure you want to disconnect this project?
    </UiConfirm>

    <!-- Settings modal -->
    <Settings ref="settingsModal"></Settings>

    <!-- Connect folder modal -->
    <UiModal
        width="700px"
        height="600px"
        title="Connect Folder"
        :show="showingConnectingFolderModal"
        :processing="processingConnectFolder"
        @close="showingConnectingFolderModal = false"
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
                    <UiButton class="gap-1.5" @click="newApp()">
                        <PlusCircleIcon class="w-5 h-5 text-red-500" />
                        New App
                    </UiButton>
                    <UiButton class="gap-1.5" @click="openFolder()">
                        <FolderIcon class="w-5 h-5 text-red-500" />
                        Connect Folder
                    </UiButton>
                    <UiButton class="gap-1.5" @click="connectSSH">
                        <CommandLineIcon class="w-5 h-5 text-red-500" />
                        Connect SSH
                    </UiButton>

                    <UiButton class="gap-1.5" @click="settingsModal.show()">
                        <Cog6ToothIcon class="w-5 h-5 text-red-500" />
                        Settings
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
                    <div class="flex justify-between">
                        <span>{{ project.path.split(/\/|\\/).pop() }}</span>
                        <UiOptionsDropdown>
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
                    <div class="text-slate-500">
                        {{ project.path }}
                    </div>
                </div>
            </div>
        </main>
    </section>
</template>
