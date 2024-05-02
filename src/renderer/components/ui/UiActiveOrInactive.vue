<script setup lang="ts">
    import { CheckBadgeIcon, XMarkIcon } from "@heroicons/vue/24/outline"

    defineProps<{
        active: boolean
    }>()
</script>

<template>
    <div>
        <CheckBadgeIcon v-if="active" class="h-5 w-5 text-green-500 stroke-2" />
        <XMarkIcon v-else class="h-5 w-5 text-red-500 stroke-2" />
    </div>
</template>

<style scoped></style>