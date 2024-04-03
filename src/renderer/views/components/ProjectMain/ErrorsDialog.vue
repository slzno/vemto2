<script setup lang="ts">
    import UiSmallButton from "@Renderer/components/ui/UiSmallButton.vue"
    import UiTabs from "@Renderer/components/ui/UiTabs.vue"
    import Main from "@Renderer/services/wrappers/Main"
    import { useErrorsStore } from "@Renderer/stores/useErrorsStore"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import { CheckCircleIcon, FlagIcon, ShieldExclamationIcon, XMarkIcon } from "@heroicons/vue/24/outline"
    import { ref, watch, defineExpose, nextTick } from "vue"
    import TemplateErrorViewer from "../Common/TemplateErrorViewer.vue"
    import TextUtil from "@Common/util/TextUtil"

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
        } else {
            close()
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

    const toggle = () => {
        if(showing.value) {
            close()
        } else {
            show()
        }
    }

    const openCorrectTab = () => {
        if(projectStore.project.hasCurrentSchemaError()) {
            selectedTab.value = "schema"
        } else  {
            selectedTab.value = "errors"
        }
    }

    const reportError = async (error) => {
        let issueBody = `**Error Message:**\n${error.message}\n\n**Stack:**\n\`\`\`\n${error.stack}\n\`\`\``

        if(error.hasTemplateError && error.templateContent) {
            const templateLines = TextUtil.getSurroundingLinesAsText(
                error.templateContent, 
                error.templateErrorLine , 
                4
            )

            issueBody += `\n\n**Template Error Line:**\n\`\`\`\n${error.templateErrorLine}\n\`\`\`\n\n**Template Section:**\n\`\`\`\n${templateLines}\n\`\`\``
        }

        // How to reproduce
        issueBody += `\n\n**How to reproduce:**\n1. \n2. \n3. \n\n**Expected behavior:**\n\n**Actual behavior:**\n\n**Additional context:**`

        Main.API.openIssue(error.message, issueBody)
    }

    defineExpose({
        show,
        close,
        toggle,
    })
</script>

<template>
    <Teleport to="#appContainer">
        <Transition
            enter-from-class="transition duration-200 translate-y-full"
            enter-to-class="transition duration-200 translate-y-0"
            leave-from-class="transition duration-200 translate-y-0"
            leave-to-class="transition duration-200 translate-y-full"
        >
            <div v-if="projectStore.projectIsReady" v-show="showing" class="fixed rounded-lg shadow bg-slate-900 border border-slate-700 dark:text-slate-300" style="bottom: 60px; right: 10px; width: 700px; height: 30rem; z-index: 9999;">
                <!-- Header: 66px -->
                <header class="dark:text-slate-200">
                    <div class="flex items-center text-center px-1 py-0.5 w-full bg-slate-850 mb-2 border-b border-slate-700 rounded-t-lg">
                        <div class="flex-1 flex justify-center items-center gap-1">
                            <ShieldExclamationIcon class="h-5 w-5 text-slate-500 stroke-2" />
                            Log and Errors
                        </div>
    
                        <div @click="close()">
                            <XMarkIcon class="h-4 w-4 text-slate-400 cursor-pointer stroke-2 hover:text-red-500" />
                        </div>
                    </div>
    
                    <UiTabs 
                        :name="projectStore.project.getTabNameFor(`errors`)"
                        :tabs="tabs" 
                        v-model="selectedTab" 
                    />
                </header>
    
                <div class="p-2" style="height: calc(100% - 66px)">
                    <div v-if="selectedTab === 'errors'" class="w-full h-full overflow-y-scroll">
                        <div class="flex justify-end mb-2">
                            <UiSmallButton @click="errorsStore.clearErrors()">
                                <XMarkIcon class="h-4 w-4 text-red-500 stroke-2 mr-1" />
                                Clear
                            </UiSmallButton>
                        </div>
                        <div class="p-2 text-sm rounded border border-slate-750" v-if="errorsStore.errors.length" v-for="error in errorsStore.errors">
                            <div class="flex justify-start mb-2">
                                <UiSmallButton @click="reportError(error)">
                                    <FlagIcon class="h-4 w-4 text-red-500 stroke-2 mr-1" />
                                    <span>Report</span>
                                </UiSmallButton>
                            </div>

                            <div v-if="error.hasTemplateError">
                                <TemplateErrorViewer
                                    :errorMessage="error.message"
                                    :errorLine="error.templateErrorLine"
                                    :errorStack="error.stack"
                                    :template="error.templateName"
                                    :templateContent="error.templateContent"
                                ></TemplateErrorViewer>
                            </div>
                            
                            <div v-else>
                                <pre class="overflow-hidden whitespace-pre-wrap mb-2 text-red-450">{{ error.message }}</pre>
        
                                <div v-if="error.stack">
                                    <pre class="overflow-hidden whitespace-pre-wrap p-2 bg-slate-950 rounded-lg text-slate-200">{{ error.stack }}</pre>
                                </div>
                            </div>
                        </div>
                        <div v-else class="flex flex-col gap-2 text-slate-400 w-full h-full justify-center items-center font-thin">
                            <CheckCircleIcon class="h-20 w-20 stroke-1 text-slate-500" />
                            No errors found
                        </div>
                    </div>
    
                    <div v-if="selectedTab === 'schema'" class="w-full h-full overflow-y-scroll">
                        <div class="flex justify-end mb-2">
                            <UiSmallButton @click="projectStore.project.clearCurrentSchemaError()">
                                <XMarkIcon class="h-4 w-4 text-red-500 stroke-2 mr-1" />
                                Clear
                            </UiSmallButton>
                        </div>
                        <div v-if="projectStore.project.hasCurrentSchemaError()" class="p-2 text-sm rounded border border-slate-750">
                            <div class="flex justify-start mb-2">
                                <UiSmallButton @click="reportError({
                                    message: projectStore.project.currentSchemaError,
                                    stack: projectStore.project.currentSchemaErrorStack,
                                })">
                                    <FlagIcon class="h-4 w-4 text-red-500 stroke-2 mr-1" />
                                    <span>Report</span>
                                </UiSmallButton>
                            </div>
    
                            <pre class="overflow-hidden whitespace-pre-wrap text-red-450 mb-2">{{ projectStore.project.currentSchemaError }}</pre>
    
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
        </Transition>
    </Teleport>
</template>
