<script setup lang="ts">
    import { defineProps, PropType, toRef } from 'vue'
    import Crud from '@Common/models/crud/Crud'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import { useProjectStore } from '@Renderer/stores/useProjectStore'

    const projectStore = useProjectStore(),
        props = defineProps({
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
            <UiSelect v-model="crud.sectionId" label="Section" @change="crud.save()" >
                <option :value="null" disabled>Select a section</option>
                <option v-for="section in projectStore.project.appSections" :value="section.id" :key="section.id">{{ section.name }}</option>
            </UiSelect>
        </div>

        <div>
            <UiText v-model="crud.name" label="Name" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.plural" label="Plural" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.settings.itemName" label="Item Name" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.settings.collectionName" label="Collection Name" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.settings.itemTitle" label="Item Title" @input="crud.save()" />
        </div>

        <div>
            <UiText v-model="crud.settings.collectionTitle" label="Collection Title" @input="crud.save()" />
        </div>

        <div>
            <UiSelect v-model="crud.defaultSearchColumnId" label="Default search column" @change="crud.save()" >
                <option :value="null" disabled>Select a column</option>
                <option v-for="column in crud.model.table.columns" :value="column.id" :key="column.id">{{ column.name }}</option>
            </UiSelect>
        </div>

        <div>
            <UiSelect v-model="crud.defaultSortColumnId" label="Default sort column" @change="crud.save()" >
                <option :value="null" disabled>Select a column</option>
                <option v-for="column in crud.model.table.columns" :value="column.id" :key="column.id">{{ column.name }}</option>
            </UiSelect>
        </div>

        <div>
            <UiSelect v-model="crud.defaultSortDirection" label="Default sort direction" @change="crud.save()" >
                <option :value="null" disabled>Select a direction</option>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </UiSelect>
        </div>
    </div>
</template>