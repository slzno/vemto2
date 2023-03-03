<script setup lang="ts">
    import { PropType, Ref, toRef, ref, watch, onMounted } from "vue"
    import Model from "@Common/models/Model"
    import debounce from "@Common/tools/debounce"
    import UiText from "@Renderer/components/ui/UiText.vue"
    import UiSelect from "@Renderer/components/ui/UiSelect.vue"
    // import { Bars3Icon, ChevronDownIcon } from "@heroicons/vue/24/outline"
    // import UiCheckbox from "@Renderer/components/ui/UiCheckbox.vue"
    // import UiSelect from "@Renderer/components/ui/UiSelect.vue"

    const props = defineProps({
        model: {
            type: Object as PropType<Model>,
            required: true,
        },
    })

    const model = toRef(props, "model") as Ref<Model>,
        relationships = ref([])
    
    let models: Ref<Array<Model>> = ref([])

    onMounted((): void => {
        const project = model.value.project
        
        models.value = project.models
        relationships.value = model.value.ownRelationships
    })

    watch(() => model.value.name, () => {
        saveModel()
    })

    const newRelationship = (): void => {
        const relationship = model.value.newRelationship()
        relationships.value.push(relationship)
    }

    // debounced
    const saveModel = debounce(() => {
        model.value.saveFromInterface()
    }, 500)

    const saveRelationship = debounce((relationship) => {
        relationship.saveFromInterface()
    }, 500)
</script>

<template>
    <div
        class="relative flex-col bg-slate-800 border-l-4 border-slate-700 p-2 rounded-xl shadow"
    >
        <div>
            <UiText
                v-model="model.class"
                placeholder="Model class name with namespace"
            />

            <div class="mt-4">
                <h2 class="text-red-400 mb-1">Relationships</h2>

                <div>
                    <div
                        class="mb-2"
                        v-for="relationship in relationships"
                        :key="relationship.id"
                    >
                        <div class="mb-1">
                            <UiText
                                v-model="relationship.name"
                                placeholder="Relationship name"
                                @change="saveRelationship(relationship)"
                            />
                        </div>

                        <div class="space-x-1">
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
                    </div>
                </div>

                <div>
                    <button
                        @click="newRelationship()"
                        class="bg-slate-700 hover:bg-slate-600 text-slate-100 px-2 py-1 rounded-md"
                    >
                        + Add relationship
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
