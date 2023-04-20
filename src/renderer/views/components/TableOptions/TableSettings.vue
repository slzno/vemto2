<script setup lang="ts">
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import { defineProps, toRef } from 'vue'
    import debounce from "@Renderer/../common/tools/debounce"

    const props = defineProps(['table']),
        table = toRef(props, 'table')

    const saveTable = debounce(() => {
        table.value.saveFromInterface()
    }, 500)
</script>
<template>
    <div>
        <section class="space-y-2">
            <UiText v-model="table.name" placeholder="Table name" label="Table name" @change="saveTable()" />
    
            <UiButton @click="table.logDataComparison()">Log data comparison</UiButton>
        </section>
    </div>
</template>
