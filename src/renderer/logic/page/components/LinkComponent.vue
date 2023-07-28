<script setup lang="ts">
import Page from "@Common/models/page/Page"
import { defineProps, defineEmits, watch} from "vue"
import useComponentLogic from "./base/useComponentLogic"
import PreviewPageComponent from "@Renderer/views/components/ProjectPage/PreviewPageComponent.vue"

const props = defineProps({
    page: {
        type: Page,
        required: true,
    },
    baseComponent: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(["pageUpdated"])
const { component } = useComponentLogic(props.baseComponent, emit)
</script>

<template>
    <div v-if="component" class="flex flex-row">
        <div class="h-auto py-4 pl-2">
            <div class="h-full w-1 border-l border-dashed border-red-600 rounded"></div>
        </div>
        <div class="h-full flex-1 flex-grow">
            <div class="text-red-400 font-mono py-1 flex items-center space-x-1">
                
                <div class="w-5 h-px border-b border-dashed border-red-600"></div>
                
                <div class="flex-1 flex space-x-2">
                    <div>
                        <span>Link target=</span>

                        <select 
                            v-model="component.settings.target"
                            class="outline-none bg-transparent font-semibold text-center text-red-300 border border-slate-600 w-32 p-0 rounded">
                            <option class="text-slate-900" value="_blank">_blank</option>
                            <option class="text-slate-900" value="_self">_self</option>
                        </select>
                    </div>
    
                    <div>
                        <span>href=</span>
                        <input 
                            spellcheck="false"
                            autocomplete="off"
                            v-model="component.settings.href"
                            class="outline-none bg-transparent font-semibold text-center text-red-300 border border-slate-600 w-96 rounded"
                        />
                    </div>
                </div>
            </div>
    
            <div class="pl-2">
                <div 
                    :id="'nestedComponents' + component.id" 
                    :component-id="component.id"
                    components-container="nestedComponents"
                    class="rounded border border-slate-600 bg-slate-800 border-dotted p-2 pb-16 space-y-2">
                    
                    <PreviewPageComponent 
                        v-for="nestedComponent in component.getNestedComponents('nestedComponents')"
                        :page="page"
                        :base-component="nestedComponent" 
                        @pageUpdated="emit('pageUpdated')"
                    />
                </div>
            </div>
    
            <div class="text-red-400 font-mono py-1 flex items-center space-x-1">
                <div class="w-5 h-px border-b border-dashed border-red-600"></div> <span>Link</span>
            </div>
        </div>
    </div>
</template>