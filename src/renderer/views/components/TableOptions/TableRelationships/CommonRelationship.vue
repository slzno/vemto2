<script setup lang="ts">
    import { defineProps, toRef } from 'vue'
    import RelationshipTypes from '@Common/models/static/RelationshipTypes'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import UiDropdownSelect from '@Renderer/components/ui/UiDropdownSelect.vue'
    import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/vue/24/outline"

    const props = defineProps(['relationship', 'models', 'relationshipIdOptions', 'getForSelect']),
        relationship = toRef(props, 'relationship')
</script>
<template>
    <div class="flex justify-between">
        <div class="space-x-1 flex">
            <div class="text-red-400 inline-block">
                <UiDropdownSelect
                    v-model="relationship.type"
                    :may-open="relationship.isNew() && !relationship.hasType()"
                    placeholder="Relationship Type"
                    :options="RelationshipTypes.getForDropdown()"
                    @change="$emit('save')"
                />

                <UiDropdownSelect
                    v-model="relationship.relatedModelId"
                    :may-open="relationship.isNew() && !relationship.hasRelatedModel() && relationship.hasType()"
                    placeholder="Relationship Model"
                    :options="getForSelect(models)"
                    @change="$emit('save')"
                />
            </div>
        </div>

        <span class="relative">
            <EllipsisVerticalIcon
                class="h-6 w-6 text-slate-400 cursor-pointer"
                @click="$emit('toggleRelationshipOptions')"
            />
            <div class="bg-slate-950 w-auto rounded absolute p-1 z-10 right-0 top-8 border border-gray-700" v-if="relationshipIdOptions === relationship.id">
                <ul>
                    <li class="flex items-center justify-start text-md p-1 cursor-pointer" @click="$emit('deleteRelationship')">
                        <TrashIcon class="h-5 w-5 mr-1 text-red-400" />
                        Delete
                    </li>
                </ul>
            </div>
        </span>

        <div class="grid grid-cols-2 gap-2">
            <template v-if="relationship.hasTypeAndRelatedModel()">
                <div>
                    <UiText
                        v-model="relationship.name"
                        placeholder="Relationship name"
                        @input="$emit('save')"
                    />
                </div>
                <div v-if="!relationship.foreignKeyId">
                    <UiText
                        v-model="relationship.foreignKeyName"
                        placeholder="Foreign Key Name"
                        @input="$emit('save')"
                    />
                </div>
                <div v-if="relationship.foreignKeyId">
                    <UiDropdownSelect
                        v-model="relationship.foreignKeyId"
                        placeholder="Select the Foreign Key"
                        :options="getForSelect(relationship.model.table.columns)"
                        @change="$emit('save')"
                    />
                </div>
                <div v-if="relationship.parentKeyId">
                    <UiDropdownSelect
                        v-model="relationship.parentKeyId"
                        placeholder="Select the Parent Key"
                        :options="getForSelect(relationship.getServiceFromType().getForeignModel().table.columns)"
                        @change="$emit('save')"
                    />
                </div>
            </template>
        </div>
    </div>
</template>