<script setup lang="ts">
    import UiSmallButton from "@Renderer/components/ui/UiSmallButton.vue"
import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import { useErrorsStore } from "@Renderer/stores/useErrorsStore"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { CheckCircleIcon, ShieldExclamationIcon, XMarkIcon } from "@heroicons/vue/24/outline"
    import { ref, watch, defineExpose, nextTick } from "vue"

    const projectStore = useProjectStore(),
        errorsStore = useErrorsStore()

    const selectedTab = ref("errors"),
        showing = ref(false)

    const tabs = [
        { label: "Main", value: "errors" },
        { label: "Schema", value: "schema" },
        { label: "Vemto Log", value: "vemto_log" },
    ]

    watch(() => errorsStore.hasErrors, (hasErrors) => {
        if(hasErrors) {
            show()
        }
    })

    const show = () => {
        showing.value = true

        nextTick(() => {
            openCorrectTab()
        })
    }

    const close = () => {
        showing.value = false
    }

    const openCorrectTab = () => {
        if(projectStore.project.hasCurrentSchemaError()) {
            selectedTab.value = "schema"
        } else  {
            selectedTab.value = "errors"
        }
    }

    defineExpose({
        show,
        close,
    })
</script>

<template>
    <div v-if="projectStore.projectIsReady" v-show="showing" class="absolute rounded-lg shadow bg-slate-900 border border-slate-700" style="bottom: 60px; right: 10px; width: 700px; height: 30rem;">
        <!-- Header: 66px -->
        <header>
            <div class="flex items-center text-center px-1 py-0.5 w-full bg-slate-850 mb-2 border-b border-slate-700 rounded-t-lg">
                <div class="flex-1 flex justify-center items-center gap-1">
                    <ShieldExclamationIcon class="h-5 w-5 text-slate-500 stroke-2" />
                    Log and Errors
                </div>

                <div @click="close()">
                    <XMarkIcon class="h-4 w-4 text-slate-400 cursor-pointer stroke-2 hover:text-red-500" />
                </div>
            </div>

            <UiTabs :tabs="tabs" v-model="selectedTab" />
        </header>

        <div class="p-2" style="height: calc(100% - 66px)">
            <div v-if="selectedTab === 'errors'" class="w-full h-full overflow-y-scroll">
                <div class="flex flex-col gap-2 text-slate-400 w-full h-full justify-center items-center font-thin">
                    <CheckCircleIcon class="h-20 w-20 stroke-1 text-slate-500" />
                    No errors found
                </div>
            </div>

            <div v-if="selectedTab === 'schema'" class="w-full h-full overflow-y-scroll">
                <div class="flex justify-end">
                    <UiSmallButton @click="projectStore.project.clearCurrentSchemaError()">
                        Clear
                    </UiSmallButton>
                </div>
                <div v-if="projectStore.project.hasCurrentSchemaError()" class="p-4 text-red-450 rounded-b-lg space-y-2">
                    <pre class="overflow-hidden whitespace-pre-wrap">{{ projectStore.project.currentSchemaError }}</pre>

                    <div v-if="projectStore.project.currentSchemaErrorStack">
                        <pre class="overflow-hidden whitespace-pre-wrap p-2 bg-slate-950 rounded-lg text-slate-200">{{ projectStore.project.currentSchemaErrorStack }}</pre>
                    </div>
                </div>
                <div v-else class="flex flex-col gap-2 text-slate-400 w-full h-full justify-center items-center font-thin">
                    <CheckCircleIcon class="h-20 w-20 stroke-1 text-slate-500" />
                    No errors found
                </div>
            </div>

            <div v-if="selectedTab === 'vemto_log'" class="w-full h-full overflow-y-scroll">
                <div class="flex flex-col gap-2 text-slate-400 w-full h-full justify-center items-center font-thin">
                    <CheckCircleIcon class="h-20 w-20 stroke-1 text-slate-500" />
                    The file vemto.log is empty
                </div>
            </div>
        </div>
    </div>
</template>
