<script setup lang="ts">
    import { defineProps, toRef } from 'vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'

    const props = defineProps(['relationship', 'getForSelect']),
        relationship = toRef(props, 'relationship')
</script>
<template>
    <div class="flex-1 grid grid-cols-2 gap-1">
        <template v-if="relationship.hasTypeAndRelatedModel()">
            <div>
                <UiText
                    label="Name"
                    v-model="relationship.name"
                    placeholder="Relationship name"
                    @input="$emit('save')"
                />
            </div>
            <div v-if="!relationship.foreignKeyId">
                <UiText
                    label="Foreign Key Name"
                    v-model="relationship.foreignKeyName"
                    placeholder="Foreign Key Name"
                    @input="$emit('save')"
                />
            </div>
            <div v-if="relationship.foreignKeyId">
                <UiDropdownSelect
                    label="Foreign Key"
                    v-model="relationship.foreignKeyId"
                    placeholder="Select the Foreign Key"
                    :options="getForSelect(relationship.getForeignModel().table.columns)"
                    @change="$emit('save')"
                />
            </div>
        </template>
    </div>
</template>