<script setup lang="ts">
    import { defineProps, onMounted, ref } from "vue"
    import Main from "@Renderer/services/wrappers/Main"
import TextUtil from "@Renderer/../common/util/TextUtil"
    
    const templateContent = ref(""),
        templateLines = ref([]),
        surroundingLines = ref([])

    const props = defineProps({
        template: {
            type: String,
            required: true,
        },

        errorMessage: {
            type: String,
            required: true,
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
        templateContent.value = await Main.API.readTemplateFile(props.template)

        templateLines.value = templateContent.value.split("\n")

        surroundingLines.value = TextUtil.getSurroundingLinesFromContent(
            templateContent.value,
            props.errorLine,
            props.lines
        )
    })
</script>

<template>
    <div class="space-y-2" v-if="templateContent">
        <div class="bg-slate-100 dark:bg-slate-950 rounded-lg p-4">
            <div class="text-red-400">Error: {{ errorMessage }}</div>
            <div class="text-slate-300">On line <b>{{ errorLine }}</b> of template <span class="underline cursor-pointer hover:text-red-400">{{ template }}</span></div>
        </div>
        <div class="bg-slate-100 dark:bg-slate-950 rounded-lg p-4">
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