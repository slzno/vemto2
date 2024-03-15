<script setup lang="ts">
    import { ref, onMounted, computed, Ref } from "vue"
    import { useRouter } from "vue-router"
    import { ProjectSettings } from "@Common/models/Project"
    import Main from "@Renderer/services/wrappers/Main"
    import { compareVersions } from 'compare-versions'
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import ProjectManager from "@Renderer/services/project/ProjectManager"
    import { ClipboardDocumentIcon, Cog6ToothIcon, CommandLineIcon, FolderIcon, PlusCircleIcon, ShieldExclamationIcon, XMarkIcon } from "@heroicons/vue/24/outline"
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

        showWelcomeModal()

        window.addEventListener("error", (event) => {
            console.log("Error happened in the renderer process")
        })
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

    const openURL = (url: string) => {
        Main.API.openURL(url)
    }

    const showWelcomeModal = () => {
        const welcomeModalClosedAt = localStorage.getItem("welcomeModalClosedAt")

        if(welcomeModalClosedAt) {
            const lastClosedAt = new Date(welcomeModalClosedAt)
            const now = new Date()
            const diff = now.getTime() - lastClosedAt.getTime()
            const diffInHours = diff / (1000 * 60 * 60)

            if(diffInHours < 24) return
        }

        showingWelcomeModal.value = true
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
        <div>
            <div class="p-4 pb-24 font-mono text-lg">
                <div class="flex w-full justify-end px-4">
                    <div class="flex space-x-3 text-sm">
                        <a @click="openURL('https://vemto.app')" class="text-red-500 cursor-pointer">Site</a>
                        <a @click="openURL('https://twitter.com/VemtoApp')" class="text-red-500 cursor-pointer">Twitter</a>
                        <a @click="openURL('https://github.com/TiagoSilvaPereira/vemto2-issues/issues/new')" class="text-red-500 cursor-pointer">Issues</a>
                    </div>
                </div>
                <h1 class="text-bold text-lg">Please, read this carefully!</h1>
                <br><br>
                Hello!
                <br><br>
                I can't express how happy I am that you're seeing this screen! 😊
                <br><br>
                It was a year and a half of development, full of ups and downs. I'll soon make a blog post telling everything about this period, but let's get to the point:
                <br><br>
                <span class="text-red-500 font-bold">Vemto 2 is finally here </span>
                <br><br>
                It's still a pre-alpha version; of course, there will probably be bugs. But I'm happy because this version has the correct architecture, which has been rewritten several times during this period and will now only be improved (hopefully for the next 10 years).
                <br><br>
                I recommend using it cautiously (always commit your code before connecting it to Vemto). It's essential to consider a few things now:
                <br><br>
                1 - Vemto 2 requires at least basic knowledge of Laravel and PHP. At least for now, we have decided not to do basic things like creating a new project, installing composer packages, etc. Vemto now assumes that you know how to do these things and focuses on the most crucial thing, visualizing and generating code. However, we will soon have tools to take care of these parts correctly (Composer Manager, Project Creator, etc.)
                <br><br>
                2 - Unlike version 1, Vemto is now not just a boilerplate tool. It connects directly to your project and creates a .vemto folder inside it (you can put this folder in .gitigore if you wish, but be sure to back it up, as it represents your project)
                <br><br>
                3 - Vemto can read any project with a .vemto folder. If you upload your project to another computer (using GIT or manually) with this folder inside, Vemto can open it normally. This means there is no need to export projects.
                <br><br>
                4 - When Vemto 2 generates code, it does just that. It does not install packages or modify composer.json or package.json during generation. This was a significant source of problems in version 1, and we found another way to do this, which will be implemented soon (Composer Manager, NPM Manager, etc.)
                <br><br>
                5 - Some features from Vemto 1 are still under development as we needed to resolve the entire architecture before bringing them, which took almost the whole development period. Now, we are focused on these features, and soon, we will have:
                <br><br>
                <ul>
                    <li>- Generation of API Endpoints</li>
                    <li>- Template Editor</li>
                    <li>- Tests Generation</li>
                    <li>- Plugin support</li>
                    <li>- More AI features</li>
                </ul>
                <br><br>
                6 - You may prefer to create your Laravel project with Jetstream/Livewire for CRUD generation. Any other boilerplate with Livewire will work (Breeze, Laravel UI, etc), but we haven't created the menu file yet, so you'll probably have to edit it manually
                <br><br>
                7 - Vemto 1 still works very well for generating API Endpoints. You can use it for this and connect Vemto 2 to your project.
                <br><br>
                8 - Small Tip: Test Filament code generation—it's awesome now! Just remember to install the Filament package in your project.
                <br><br>
                9 - Please report any bug in the <a @click="openURL('https://github.com/TiagoSilvaPereira/vemto2-issues/issues/new')" class="text-red-500 cursor-pointer">Issues Repository</a> or email <b>contact@vemto.app</b> (Issues repository is preferred).
                <br><br>
                We are focused on improving Vemto 2 and reaching the Release version as quickly as possible (our plans are for the middle of the year).
                <br><br>
                I am immensely grateful to everyone who believed in and supported me, even when I was unable to release any more Vemto updates.
                <br><br>
                Thank you for your attention and support! 
                <br><br>
                Yours sincerely,
                <br>
                Tiago Rodrigues - Creator of Vemto
            </div>
        </div>
    </UiModal>

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
                            @click="settingsModal.show()"
                            class="relative cursor-pointer"
                        >
                            <Cog6ToothIcon
                                class="w-7 h-7 stroke-1 hover:text-red-500 dark:hover:text-red-500"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </section>
</template>
