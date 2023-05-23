<script setup lang="ts">
    import { defineProps, toRef } from 'vue'
    import UiText from '@Renderer/components/ui/UiText.vue'

    const props = defineProps(['relationship']),
        relationship = toRef(props, 'relationship')
</script>
<template>
    <div class="flex-1 grid grid-cols-2 gap-1">
        <template v-if="relationship.hasTypeAndRelatedModel()">
            <div class="gap-2 flex flex-col">
                <UiText
                    v-model="relationship.name"
                    placeholder="Relationship Name"
                    @input="$emit('save')"
                />
                <UiText
                    v-model="relationship.pivotTableName"
                    placeholder="Pivot Table Name"
                    @input="$emit('save')"
                />
            </div>
            <div class="gap-2 flex flex-col">
                <UiText
                    v-model="relationship.foreignPivotKeyName"
                    placeholder="Foreign Pivot Key Name"
                    @input="$emit('save')"
                />
                <UiText
                    v-model="relationship.relatedPivotKeyName"
                    placeholder="Related Pivot Key Name"
                    @input="$emit('save')"
                />
            </div>
        </template>
    </div>
</template>