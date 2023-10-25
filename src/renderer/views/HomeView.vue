<script setup lang="ts">
    import { ref, onMounted, computed } from "vue"
    import { useRouter } from "vue-router"
    import Main from "@Renderer/services/wrappers/Main"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import ProjectManager from "@Renderer/services/project/ProjectManager"
    import { ClipboardDocumentIcon, CommandLineIcon, FolderIcon, PlusCircleIcon, XMarkIcon } from "@heroicons/vue/24/outline"
    import UiConfirm from "@Renderer/components/ui/UiConfirm.vue"
    import UiOptionsDropdown from "@Renderer/components/ui/UiOptionsDropdown.vue"
    import UiDropdownItem from "@Renderer/components/ui/UiDropdownItem.vue"
import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"
import Alert from "@Renderer/components/utils/Alert"

    const projectManager = new ProjectManager(),
        search = ref(""),
        projects = ref([]),
        confirmDisconnectDialog = ref(null)

    const router = useRouter()

    onMounted(async () => {
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

    const connectFolder = async () => {
        const path = await Main.API.openFolderDialog()

        if (!path) return

        await projectManager.connectFromPath(path)

        openSchema()
    }

    const openProject = async (project: any) => {
        await projectManager.open(project.id)

        openSchema()
    }

    const openSchema = async () => {
        // setTimeout(() => {
            router.push("/project/schema")
        // }, 500);
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
</script>

<template>
    <UiConfirm ref="confirmDisconnectDialog">
        Are you sure you want to disconnect this project?
    </UiConfirm>

    <section class="p-4 space-y-5 dark:bg-slate-900 h-screen">
        <header class="flex w-full justify-center mt-10">
            <div class="flex flex-col">
                <div class="flex gap-2">
                    <UiButton class="gap-1.5" @click="openProject">
                        <PlusCircleIcon class="w-5 h-5 text-red-500" />
                        New App
                    </UiButton>
                    <UiButton class="gap-1.5" @click="connectFolder()">
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
                <UiText v-model="search" placeholder="Search apps..." />
            </div>

            <UiEmptyMessage v-if="!projects.length">
                There are no connected apps
            </UiEmptyMessage>

            <div class="flex flex-col gap-2 w-1/2 max-w-xl">
                <div v-for="project in filteredProjects" @click="openProject(project)" class="p-2 rounded-lg border border-slate-650 bg-slate-850 cursor-pointer hover:bg-slate-800">
                    <div class="flex justify-between">
                        <span>{{ project.path.split(/\/|\\/).pop() }}</span>
                        <UiOptionsDropdown>
                            <UiDropdownItem @click="copyProjectPath(project)">
                                <ClipboardDocumentIcon class="h-5 w-5 mr-1 text-red-400" /> Copy Path
                            </UiDropdownItem>
                            <UiDropdownItem @click="openProjectPath(project)">
                                <FolderIcon class="h-5 w-5 mr-1 text-red-400" /> Open Path
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
