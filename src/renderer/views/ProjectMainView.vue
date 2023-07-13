<script setup lang="ts">
    import { RouterView } from "vue-router"
    import ProjectNavbar from "@Renderer/views/components/ProjectNavbar.vue"
    import { onMounted, ref } from "vue"
    import HandleProjectDatabase from "@Renderer/services/HandleProjectDatabase"
import { ArrowTopRightOnSquareIcon, CommandLineIcon, FolderIcon, PlayIcon, ShieldExclamationIcon } from "@heroicons/vue/24/outline"

    const canShow = ref(false)

    onMounted(async () => {
        await HandleProjectDatabase.populate(() => canShow.value = true)
    })
</script>

<template>
    <div class="h-full flex">
        <ProjectNavbar />

        <!-- Content -->
        <div v-if="canShow" class="flex-1">
            <RouterView />

            <div class="fixed flex justify-center bottom-0 w-full p-2.5">
                <div class="py-2 px-5 rounded-full shadow bg-slate-750 border border-slate-600 flex space-x-2">
                    <div>
                        <PlayIcon class="w-6 h-6 text-slate-100" />
                    </div>
                    <FolderIcon class="w-6 h-6 text-slate-100" />
                    <CommandLineIcon class="w-6 h-6 text-slate-100" />
                    <ShieldExclamationIcon class="w-6 h-6 text-slate-100" />
                    <ArrowTopRightOnSquareIcon class="w-6 h-6 text-slate-100" />
                </div>
            </div>
        </div>
    </div>
</template>
