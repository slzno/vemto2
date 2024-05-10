<script setup lang="ts">
    import { defineProps, toRef } from 'vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'

    const props = defineProps(['relationship', 'models', 'getForSelect']),
        relationship = toRef(props, 'relationship')
</script>
<template>
    <div class="grid flex-1 grid-cols-2 gap-1">
        <div>
            <UiDropdownSelect
                label="Related Model"
                v-model="relationship.relatedModelId"
                :may-open="relationship.isNew() && !relationship.hasRelatedModel() && !relationship.throughId"
                placeholder="Related Model"
                :options="getForSelect(models)"
                @change="$emit('save')"
            />
        </div>
        <div>
            <UiDropdownSelect
                label="Through Model"
                v-model="relationship.throughId"
                :may-open="relationship.isNew() && relationship.hasRelatedModel() && !relationship.throughId"
                placeholder="Through Model"
                :options="getForSelect(models)"
                @change="$emit('save')"
            />
        </div>
        <div>
            <UiText
                label="Related Model Key"
                v-model="relationship.firstKeyName"
                placeholder="Related Model Key Name"
                @input="$emit('save')"
            />
        </div>
        <div>
            <UiText
                label="Through Model Key"
                v-model="relationship.secondKeyName"
                placeholder="Through Model Key Name"
                @input="$emit('save')"
            />
        </div>
    </div>
</template>