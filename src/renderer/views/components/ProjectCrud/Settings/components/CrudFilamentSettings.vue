<script setup lang="ts">
    import { defineProps, toRef, PropType } from 'vue'
    import Crud from '@Common/models/crud/Crud'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiCheckbox from '@Renderer/components/ui/UiCheckbox.vue';
    import UiNumber from '@Renderer/components/ui/UiNumber.vue';

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
            <UiText v-model="crud.filamentSettings.recordTitle" label="Record Title" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.filamentSettings.modelLabel" label="Model Label" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.filamentSettings.pluralModelLabel" label="Plural Model Label" @input="crud.save()" />
        </div>
        
        <div>
            <UiText v-model="crud.filamentSettings.navigationLabel" label="Navigation Label" @input="crud.save()" />
        </div>
        
        <div>
            <UiNumber v-model="crud.filamentSettings.navigationOrder" label="Navigation Order" @input="crud.save()" />
        </div>
        
        <div>
            <UiText v-model="crud.filamentSettings.navigationParentItem" label="Navigation Parent Item" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.filamentSettings.navigationGroup" label="Navigation Group" @input="crud.save()" />
        </div>
        
        <div>
            <UiText v-model="crud.filamentSettings.slug" label="Resource Slug" @input="crud.save()" />
        </div>

        <div>
            <UiCheckbox v-model="crud.filamentSettings.shouldSkipAuthorization" label="Should Skip Authorization" @input="crud.save()" />
        </div>

        <div>
            <UiCheckbox v-model="crud.filamentSettings.hasTitleCaseModelLabel" label="Has Title Case Model Label" @input="crud.save()" />
        </div>
    </div>
</template>