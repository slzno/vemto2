<script setup lang="ts">
    import { defineProps, toRef, PropType } from 'vue'
    import Crud from '@Common/models/crud/Crud'
    import UiText from '@Renderer/components/ui/UiText.vue'

    const props = defineProps({
            crud: {
                type: Object as PropType<Crud>,
                required: true
            }
        }),
        crud = toRef(props, "crud")
</script>
<template>
    <div class="space-y-4">
        <div>
            <UiText v-model="crud.livewireNamespace" label="Namespace" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.livewireIndexComponentName" label="Index Component name" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.livewireShowComponentName" label="Show Component name" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.livewireCreateComponentName" label="Create Component name" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.livewireEditComponentName" label="Edit Component name" @input="crud.save()" />
        </div>
    </div>
</template>