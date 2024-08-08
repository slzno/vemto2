<script setup lang="ts">
    import { defineProps, onMounted, ref, watch } from "vue"
    import Main from "@Renderer/services/wrappers/Main"
    import TextUtil from "@Renderer/../common/util/TextUtil"
    import { DocumentMagnifyingGlassIcon } from "@heroicons/vue/24/outline"
    
    const templateContent = ref(""),
        templateLines = ref([]),
        surroundingLines = ref([]),
        showingStack = ref(false)

    const props = defineProps({
        template: {
            type: String,
            required: true,
        },

        templateContent: {
            type: String,
            required: false,
        },

        errorMessage: {
            type: String,
            required: true,
        },

        errorStack: {
            type: String,
            required: false,
        },

        lines: {
            type: Number,
            default: 6,
        },

        errorLine: {
            type: Number,
            default: 0,
        },
    })

    onMounted(async () => {
        renderError()
    })

    watch(() => props.errorLine, () => {
        renderError()
    })

    watch(() => props.errorMessage, () => {
        renderError()
    })

    const renderError = async () => {
        if(props.templateContent) {
            templateContent.value = props.templateContent
        } else {
            templateContent.value = await Main.API.readTemplateFile(props.template)
        }

        templateLines.value = templateContent.value.split("\n")

        surroundingLines.value = TextUtil.getSurroundingLinesFromContent(
            templateContent.value,
            props.errorLine,
            props.lines
        )
    }
</script>

<template>
    <div class="space-y-2" v-if="templateContent">
        <div class="bg-slate-100 dark:bg-slate-950 rounded-lg p-4">
            <div class="flex space-x-2 text-red-400">
                <div>Error: {{ errorMessage }}</div>
                <div title="Show error stack" class="cursor-pointer" @click="showingStack = !showingStack">
                    <DocumentMagnifyingGlassIcon class="w-4 h-4 inline-block" />
                </div>
            </div>
            <div v-show="showingStack" class="text-slate-200 p-4 border border-slate-800 overflow-hidden rounded mt-2" style="max-width: 500px;">
                <div class="w-full h-full overflow-auto">
                    <pre v-text="errorStack" class="overflow-hidden whitespace-pre-wrap break-words"></pre>
                </div>
            </div>
            <div v-show="errorLine != 0" class="text-slate-300">On line <b>{{ errorLine }}</b> of template <span class="underline cursor-pointer hover:text-red-400">{{ template }}</span></div>
        </div>
        <div v-show="!! surroundingLines.length" class="bg-slate-100 dark:bg-slate-950 rounded-lg p-4">
            <div
                v-for="(line, index) in surroundingLines"
                :key="index"
                class="py-1 px-2 flex items-center space-x-4"
                :class="{ 'text-slate-500': line.number !== errorLine, 'text-red-400 bg-gray-800': line.number === errorLine  }"
            >
                <div class="opacity-50 font-semibold">
                    {{ line.number  }}
                </div>
                <div>
                    {{ line.content.split(" ").join("&nbsp;") }}<br>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>