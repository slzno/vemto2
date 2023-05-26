<script setup lang="ts">
    import { defineProps, toRef } from 'vue'
    import UiText from '@Renderer/components/ui/UiText.vue'

    const props = defineProps(['relationship']),
        relationship = toRef(props, 'relationship')
</script>
<template>
    <div class="grid flex-1 grid-cols-2 gap-1">
        <template v-if="relationship.hasTypeAndRelatedModel()">
            <div>
                <UiText
                    v-model="relationship.name"
                    placeholder="Relationship name"
                    @input="$emit('save')"
                />
            </div>
            <div>
                <UiText
                    v-model="relationship.morphToName"
                    placeholder="Morph To"
                    @input="$emit('save')"
                />
            </div>
        </template>
    </div>
</template>