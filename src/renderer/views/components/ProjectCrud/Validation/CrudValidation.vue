<script lang="ts" setup>
    import Vue3TagsInput from 'vue3-tags-input';
    import Input from '@Common/models/crud/Input';
    import { defineProps, toRef, onMounted, ref } from 'vue';

    const props = defineProps(['crud']),
        crud = toRef(props, 'crud'),
        creationValidations = ref({}),
        updateValidations = ref({})

    const loadCrudValidations = () => {
        crud.value.inputs.forEach((input: Input) => {
            creationValidations.value[input.id] = tagsFromValidation(input)
            updateValidations.value[input.id] = tagsFromValidation(input, 'updateRules')
        })
    }

    const tagsFromValidation = (input: Input, type = 'creationRules') => {
        let validation = input[type]

        if (!validation) return []

        validation = Object.values(validation)
            .map((rule: any) => rule.value)

        return validation.filter((item: any) => item.length > 0)
    }

    const onCreationRuleManuallyChanged = (event: any, index: number, input: Input) => {
        const value = event.target.innerText

        if (!value.length) {
            delete creationValidations.value[input.id][index]
            return
        }

        creationValidations.value[input.id][index] = value
    }

    const onUpdateRuleManuallyChanged = (event: any, index: number, input: Input) => {
        const value = event.target.innerText

        if (!value.length) {
            delete updateValidations.value[input.id][index]
            return
        }

        updateValidations.value[input.id][index] = value
    }

    onMounted(() => {
        loadCrudValidations()
    })
</script>

<template>
    <div>
        <table>
            <tr>
                <th>Input</th>
                <th>Creation Validation</th>
                <th>Update Validation</th>
            </tr>

            <tr v-for="input in crud.inputs" :key="input.id">
                <td class="px-4">{{ input.name }}</td>
                <td class="px-4">
                    <Vue3TagsInput
                        :tags="creationValidations[input.id]"
                        :allow-edit-tags="true"
                        placeholder="Add validation rule"
                        class="p-px flex"
                    >
                        <template #item="{ name, index }">
                            <span
                                contenteditable="true"
                                @click.stop
                                class="bg-transparent"
                                :select="true"
                                :select-items="[{ label: 'required', value: 'required' }, { label: 'min:3', value: 'min:3' }, { label: 'max:255', value: 'max:255' }]"
                                @input="$event => onCreationRuleManuallyChanged($event, index, input)"
                            >{{ name }}</span>
                        </template>
                    </Vue3TagsInput>
                </td>
                <td class="px-4">
                    <Vue3TagsInput
                        :tags="updateValidations[input.id]"
                        :allow-edit-tags="true"
                        placeholder="Add validation rule"
                        class="p-1 flex"
                    >
                        <template #item="{ name, index }">
                            <span
                                contenteditable="true"
                                @click.stop
                                class="bg-transparent"
                                @input="$event => onUpdateRuleManuallyChanged($event, index, input)"
                            >{{ name }}</span>
                        </template>
                    </Vue3TagsInput>
                </td>
            </tr>
        </table>
    </div>
</template>

<style lang="css">
.v3ti .v3ti-tag {
    background: #f87171; /* bg-red-500 */
}

.v3ti .v3ti-tag .v3ti-remove-tag {
    color: #000000;
    transition: color .3s;
}

.v3ti .v3ti-tag .v3ti-remove-tag:hover {
    color: #ffffff;
}
</style>