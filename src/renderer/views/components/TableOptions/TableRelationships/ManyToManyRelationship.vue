<script setup lang="ts">
    import { defineProps, toRef } from 'vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore';
    
    const props = defineProps(['relationship', 'getForSelect']),
        relationship = toRef(props, 'relationship'),
        projectStore = useProjectStore()
</script>
<template>
    <div class="flex-1 grid grid-cols-2 gap-1">
        <template v-if="relationship.hasTypeAndRelatedModel()">
            <div class="gap-2 flex flex-col">
                <UiText
                    label="Name"
                    v-model="relationship.name"
                    placeholder="Relationship Name"
                    @input="$emit('save')"
                />
                <UiDropdownSelect
                    label="Pivot Table"
                    v-model="relationship.pivotId"
                    :options="getForSelect(projectStore.project.tables)"
                    placeholder="Pivot Table (Optional, auto-generated if not set)"
                    @input="$emit('save')"
                />
            </div>
            <div class="gap-2 flex flex-col">
                <template v-if="relationship.foreignPivotKeyId">
                    <UiDropdownSelect
                        label="Foreign Pivot Id"
                        v-model="relationship.foreignPivotKeyId"
                        :options="getForSelect(relationship.pivot.columns)"
                        placeholder="Foreign Pivot Id"
                        @input="$emit('save')"
                    />
                </template>
                <template v-if="relationship.foreignPivotKeyId">
                    <UiDropdownSelect
                        label="Related Pivot Id"
                        v-model="relationship.relatedPivotKeyId"
                        :options="getForSelect(relationship.pivot.columns)"
                        placeholder="Related Pivot Id"
                        @input="$emit('save')"
                    />
                </template>
            </div>
        </template>
    </div>
</template>