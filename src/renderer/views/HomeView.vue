<script setup lang="ts">
    import { ref, onMounted } from "vue"
    import { useRouter } from "vue-router"
    import Project from "@Common/models/Project"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import HandleProjectDatabase from "@Renderer/services/HandleProjectDatabase"
    import Main from "@Renderer/services/wrappers/Main"
    import { CommandLineIcon, FolderIcon, PlusCircleIcon } from "@heroicons/vue/24/outline"
import UiEmptyMessage from "@Renderer/components/ui/UiEmptyMessage.vue"

    const projectPath = ref(localStorage.getItem("projectPath") || ""),
        search = ref("")

    const router = useRouter()
    const projectStore = useProjectStore()

    const openProject = async () => {
        localStorage.setItem("projectPath", projectPath.value)

        const databaseData = await Main.API.loadProjectDatabase(
            projectPath.value
        )

        HandleProjectDatabase.start(databaseData)

        let project = Project.findOrCreate()

        project.setPath(projectPath.value)
        project.save()

        projectStore.setProject(project)

        window.localStorage.setItem("latest-project", projectPath.value)

        router.push("/project/schema")
    }
</script>

<template>
    <section class="p-4 space-y-5 dark:bg-slate-900 h-screen">
        <!-- <p>
            <UiText v-model="projectPath" />
        </p> -->

        <header class="flex w-full justify-center mt-10">
            <div class="flex flex-col">
                <div class="flex gap-2">
                    <UiButton class="gap-1.5" @click="openProject">
                        <PlusCircleIcon class="w-5 h-5 text-red-500" />
                        New App
                    </UiButton>
                    <UiButton class="gap-1.5" @click="openProject">
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

            <UiEmptyMessage>
                There are no connected apps
            </UiEmptyMessage>

            <!-- <div class="flex flex-col gap-2 w-1/2 max-w-xl">
                <div class="p-2 rounded-lg border border-slate-650 bg-slate-850 cursor-pointer hover:bg-slate-800">
                    <div class="flex justify-between">
                        <div>vemto-test-01</div>
                    </div>
                    <div class="text-slate-500">
                        C:\Users\tiago\code\vemto-test-01
                    </div>
                </div>

                <div class="p-2 rounded-lg border border-slate-650 bg-slate-850 cursor-pointer hover:bg-slate-800">
                    <div class="flex justify-between">
                        vemto-blog
                    </div>
                    <div class="text-slate-500">
                        C:\Users\tiago\code\tests\vemto-blog
                    </div>
                </div>

                <div class="p-2 rounded-lg border border-slate-650 bg-slate-850 cursor-pointer hover:bg-slate-800">
                    <div class="flex justify-between">
                        test-project
                    </div>
                    <div class="text-slate-500">
                        C:\Users\tiago\code\tests\test-project
                    </div>
                </div>
            </div> -->
        </main>
    </section>
</template>
