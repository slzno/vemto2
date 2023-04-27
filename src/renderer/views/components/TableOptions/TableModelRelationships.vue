<script setup lang="ts">
    import { defineProps, toRef, onMounted, ref } from 'vue'
    import debounce from "@Common/tools/debounce"
    import Main from "@Renderer/services/wrappers/Main"
    import Relationship from "@Renderer/../common/models/Relationship"
    import UiSelect from '@Renderer/components/ui/UiSelect.vue'
    import UiButton from '@Renderer/components/ui/UiButton.vue'
    import UiText from '@Renderer/components/ui/UiText.vue'
    import { EllipsisVerticalIcon, PlusIcon, TrashIcon } from "@heroicons/vue/24/outline"

    const props = defineProps(['model', 'models']),
        models = toRef(props, 'models'),
        model = toRef(props, 'model'),
        relationshipIdOptions = ref(null),
        relationships = ref([])
        
    const newRelationship = (): void => {
        const relationship = model.value.newRelationship()
        relationships.value.push(relationship)
    }

    const saveRelationship = debounce((relationship: Relationship) => {
        relationship.saveFromInterface()
    }, 500)

    const toggleRelationshipOptions = (relationship: Relationship): void => {
        relationshipIdOptions.value = (
            relationshipIdOptions.value === relationship.id
                ? null
                : relationship.id
        )
    }

    const deleteRelationship = (relationship: Relationship): void => {
        Main.API.confirm("Are you sure you want to remove this relationship?").then((confirmed: boolean) => {
            if(!confirmed) return

            relationship.remove()
            relationships.value.splice(relationships.value.indexOf(relationship), 1)
        })
    }

    onMounted(() => {
        relationships.value = model.value.ownRelationships
    })
</script>
<template>
    <div class="mt-4">
        <h2 class="text-slate-500 font-semibold mb-1">Relationships</h2>

        <div>
            <div
                class="mb-2 bg-slate-850 p-2 rounded-md space-y-1"
                v-for="relationship in relationships"
                :key="relationship.id"
            >
                <!-- <UiButton @click="relationship.logDataComparison()">Log data comparison</UiButton> -->
                
                <div class="flex justify-between">
                    <div class="space-x-1">
                        <div class="text-red-400 inline-block">
                            <UiSelect 
                                v-model="relationship.type" 
                                @change="saveRelationship(relationship)"
                            >
                                <option value="BelongsTo">Belongs To</option>
                                <option value="HasMany">Has Many</option>
                                <option value="HasOne">Has One</option>
                                <option value="ManyToMany">Many To Many</option>
                                <option value="MorphMany">Morph Many</option>
                                <option value="MorphOne">Morph One</option>
                                <option value="MorphTo">Morph To</option>
                                <option value="MorphToMany">Morph To Many</option>
                            </UiSelect>
                        </div>

                        <!-- ui select with models related to relationship.modelId -->
                        <UiSelect 
                            v-model="relationship.relatedModelId"
                            @change="saveRelationship(relationship)"
                        >
                            <option
                                v-for="model in models"
                                :key="model.id"
                                :value="model.id"
                            >
                                {{ model.name }}
                            </option>
                        </UiSelect>
                    </div>

                    <span class="relative">
                        <EllipsisVerticalIcon
                            class="h-6 w-6 text-slate-400 cursor-pointer"
                            @click="toggleRelationshipOptions(relationship)"
                        />
                        <div class="bg-slate-950 w-auto rounded absolute p-1 right-0 top-8 border border-gray-700" v-if="relationshipIdOptions === relationship.id">
                            <ul>
                                <li class="flex items-center justify-start text-md p-1 cursor-pointer" @click="deleteRelationship(relationship)">
                                    <TrashIcon class="h-5 w-5 mr-1 text-red-400" />
                                    Delete
                                </li>
                            </ul>
                        </div>
                    </span>
                </div>

                <div>
                    <UiText
                        v-model="relationship.name"
                        placeholder="Relationship name"
                        @input="saveRelationship(relationship)"
                    />
                </div>
            </div>
        </div>

        <div>
            <UiButton
                @click="newRelationship()"
            >
                <span class="flex items-center">
                    <PlusIcon class="h-4 w-4 mr-1" /> Add relationship
                </span>
            </UiButton>
        </div>
    </div>
</template>