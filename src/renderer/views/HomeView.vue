<script setup lang="ts">
    import { ref, onMounted, computed } from "vue"
    import { useRouter } from "vue-router"
    import Main from "@Renderer/services/wrappers/Main"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import ProjectManager from "@Renderer/services/project/ProjectManager"
    import { CommandLineIcon, FolderIcon, PlusCircleIcon } from "@heroicons/vue/24/outline"

    const projectManager = new ProjectManager(),
        search = ref(""),
        projects = ref([])

    const router = useRouter()

    onMounted(async () => {
        projects.value = projectManager.get()
    })

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
</script>

<template>
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
                    <UiButton class="gap-1.5" @click="openProject">
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

            <!-- <UiEmptyMessage>
                There are no connected apps
            </UiEmptyMessage> -->

            <div class="flex flex-col gap-2 w-1/2 max-w-xl">
                <div v-for="project in filteredProjects" @click="openProject(project)" class="p-2 rounded-lg border border-slate-650 bg-slate-850 cursor-pointer hover:bg-slate-800">
                    <div class="flex justify-between">
                        <span>{{ project.path.split(/\/|\\/).pop() }}</span>
                    </div>
                    <div class="text-slate-500">
                        {{ project.path }}
                    </div>
                </div>
            </div>
        </main>
    </section>
</template>
