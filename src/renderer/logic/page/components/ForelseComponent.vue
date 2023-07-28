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
                <div class="w-5 h-px border-b border-dashed border-red-600"></div> <span>@forelse(</span>
                <input 
                    spellcheck="false"
                    autocomplete="off"
                    v-model="component.settings.content"
                    class="outline-none bg-transparent font-semibold text-center text-red-300"
                />
                <span>)</span>
            </div>
    
            <div class="pl-2">
                <div 
                    :id="'foreachComponents' + component.id" 
                    :component-id="component.id"
                    components-container="foreachComponents"
                    class="rounded border border-slate-600 bg-slate-800 border-dotted p-2 pb-24 space-y-2">
                    
                    <PreviewPageComponent 
                        v-for="nestedComponent in component.getNestedComponents('foreachComponents')"
                        :page="page"
                        :base-component="nestedComponent" 
                        @pageUpdated="emit('pageUpdated')"
                    />
                </div>
            </div>
    
            <div class="text-red-400 font-mono py-1 flex items-center space-x-1">
                <div class="w-5 h-px border-b border-dashed border-red-600"></div> <span>@empty</span>
            </div>
    
            <div class="pl-2">
                <div 
                    :id="'emptyComponents' + component.id" 
                    :component-id="component.id"
                    components-container="emptyComponents"
                    class="rounded border border-slate-600 bg-slate-800 border-dotted p-2 pb-12 space-y-2">
                    
                    <PreviewPageComponent 
                        v-for="nestedComponent in component.getNestedComponents('emptyComponents')"
                        :page="page"
                        :base-component="nestedComponent" 
                        @pageUpdated="emit('pageUpdated')"
                    />
                </div>
            </div>
    
            <div class="text-red-400 font-mono py-1 flex items-center space-x-1">
                <div class="w-5 h-px border-b border-dashed border-red-600"></div> <span>@endforelse</span>
            </div>
        </div>
    </div>
</template>