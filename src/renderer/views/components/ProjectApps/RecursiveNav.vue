<script setup lang="ts">
    import Nav from '@Common/models/Nav'
import { ChevronDoubleRightIcon } from '@heroicons/vue/24/outline'
    import { defineProps, PropType, toRef } from 'vue'

    const props = defineProps({
        navs: {
            type: Array as PropType<Nav[]>,
            required: true,
        },
    })

    const navs = toRef(props, 'navs')

    console.log(navs.value)
</script>

<template>
    <div
        v-for="nav in navs"
        :key="nav.id"
    >
        <div class="ml-8 mb-2 border border-slate-700 bg-slate-850 rounded-lg p-3 cursor-pointer hover:bg-slate-800 w-96 flex items-center">
            <ChevronDoubleRightIcon class="w-4 h-4 mr-2 text-slate-600" />
            {{ nav.name }}
        </div>

        <template v-if="nav.children">
            <RecursiveNav :navs="nav.children" />
        </template>
    </div>
</template>