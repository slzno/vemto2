<script setup lang="ts">
    import { defineProps, toRef } from 'vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'

    const props = defineProps(['relationship', 'models', 'getForSelect']),
        relationship = toRef(props, 'relationship')
</script>
<template>
    <div class="grid flex-1 grid-cols-2 gap-1">
        <template v-if="relationship.hasTypeAndRelatedModel()">
            <div>
                <UiDropdownSelect
                    v-model="relationship.relatedModelId"
                    :may-open="relationship.isNew() && !relationship.hasRelatedModel() && !relationship.throughId"
                    placeholder="Related Model"
                    :options="getForSelect(models)"
                    @change="$emit('save')"
                />
            </div>
            <div>
                <UiDropdownSelect
                    v-model="relationship.throughId"
                    :may-open="relationship.isNew() && relationship.hasRelatedModel() && !relationship.throughId"
                    placeholder="Through Model"
                    :options="getForSelect(models)"
                    @change="$emit('save')"
                />
            </div>
            <div>
                <UiText
                    v-model="relationship.firstKeyName"
                    placeholder="Related Model Key Name"
                    @input="$emit('save')"
                />
            </div>
            <div>
                <UiText
                    v-model="relationship.secondKeyName"
                    placeholder="Through Model Key Name"
                    @input="$emit('save')"
                />
            </div>
        </template>
    </div>
</template>