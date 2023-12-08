<script lang="ts" setup>
import { defineProps, toRef } from 'vue';

const props = defineProps(['crud']),
    crud = toRef(props, 'crud')
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
                <td>{{ input.name }}</td>
                <td>
                    {{ input.creationRules }}
                </td>
                <td>
                    {{ input.updateRules }}
                </td>
            </tr>
        </table>
    </div>
</template>