<script lang="ts" setup>
    import Vue3TagsInput from 'vue3-tags-input';
    import Input, { InputValidationRule, InputValidationRuleType } from '@Common/models/crud/Input';
    import { defineProps, toRef, onMounted, ref } from 'vue';
    import ValidationTypes from '@Common/models/static/ValidationTypes';
    import Main from '@Renderer/services/wrappers/Main';

    const props = defineProps(['crud']),
        crud = toRef(props, 'crud'),
        creationValidations = ref({}),
        updateValidations = ref({}),
        validationTypes = ValidationTypes.get();

    const loadCrudValidations = () => {
        crud.value.inputs.forEach((input: Input) => {
            creationValidations.value[input.id] = tagsFromValidation(input)
            updateValidations.value[input.id] = tagsFromValidation(input, 'updateRules')
        })
    }

    const tagsFromValidation = (input: Input, type: string = 'creationRules') => {
        let validation = input[type]

        if (!validation) return []

        validation = Object.values(validation)
            .map((rule: any) => rule.value)

        return validation.filter((item: any) => item.length > 0)
    }

    const openURL = (url: string) => {
        Main.API.openURL(url)
    }

    const saveRules = (rules: any, input: Input, type: string = 'creationRules') => {
        input[type] = []

        rules.forEach((rule: string) => {
            input[type].push(
                { type: InputValidationRuleType.TEXTUAL, value: rule } as InputValidationRule
            )
        })

        console.log('oi')
        input.save()
    }

    const filteredValidations = (input: Input, type = 'creationRules') => {
        const types = input[type].map(
            (rule: any) => rule.value
        )

        return validationTypes.filter(
            (item: any) => !types.includes(item)
        )
    }

    onMounted(() => {
        loadCrudValidations()
        console.log(filteredValidations(crud.value.inputs[0]))
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
                <td class="px-4 w-2/4">
                    <div>
                        <Vue3TagsInput
                            :tags="tagsFromValidation(input)"
                            :add-tag-on-blur="true"
                            placeholder="Add validation rule"
                            class="p-px flex text-slate-800"
                            @onTagsChanged="saveRules($event, input)"
                            :select="true"
                            :select-items="filteredValidations(input)"
                        >
                            <template #item="{ name }">
                                <span
                                    contenteditable="true"
                                    @click.stop
                                    class="bg-transparent"
                                    spellcheck="false"
                                >{{ name }}</span>
                            </template>
                            
                            <template #select-item="item">
                                <div>
                                    <div class="text-xl">{{ item.text }}</div>
                                    <div class="text-sm" v-if="item.description">{{ item.description }}</div>
                                    <div class="text-sm">
                                        <a :href="item.link" class="text-teal-500" @click.prevent.stop="openURL(item.link)">See more</a>
                                    </div>
                                </div>
                            </template>
                        </Vue3TagsInput>
                    </div>
                </td>
                <td class="px-4 w-2/4">
                    <Vue3TagsInput
                        :tags="tagsFromValidation(input, 'updateRules')"
                        :add-tag-on-blur="true"
                        placeholder="Add validation rule"
                        class="p-1 flex flex-1"
                        @onTagsChanged="saveRules($event, input, 'updateRules')"
                        :select="true"
                        :select-items="filteredValidations(input, 'updateRules')"
                    >
                        <template #item="{ name }">
                            <span
                                contenteditable="true"
                                @click.stop
                                class="bg-transparent"
                                spellcheck="false"
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