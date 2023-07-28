<script setup lang="ts">
import { defineProps, defineEmits, watch} from "vue"
import useComponentLogic from "./base/useComponentLogic"

const props = defineProps({
    baseComponent: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(["update"])
const { component } = useComponentLogic(props.baseComponent, emit)
</script>

<template>
    <div v-if="component">
        <input 
            spellcheck="false"
            autocomplete="off"
            v-model="component.settings.content"
            class="outline-none text-5xl font-bold bg-transparent w-full"
        />
    </div>
</template>