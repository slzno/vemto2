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
                    v-model="relationship.name"
                    placeholder="Relationship Name"
                    @input="$emit('save')"
                />
                <UiDropdownSelect
                    v-model="relationship.pivotId"
                    :options="getForSelect(projectStore.project.tables)"
                    placeholder="Pivot Table (Optional)"
                    @input="$emit('save')"
                />
            </div>
            <div class="gap-2 flex flex-col">
                <template v-if="relationship.foreignPivotKeyId">
                    <UiDropdownSelect
                        v-model="relationship.foreignPivotKeyId"
                        :options="getForSelect(relationship.pivot.columns)"
                        placeholder="Foreign Pivot Id"
                        @input="$emit('save')"
                    />
                </template>
                <template v-if="relationship.foreignPivotKeyId">
                    <UiDropdownSelect
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