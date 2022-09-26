<script setup lang="ts">
import {
    HomeIcon,
    CircleStackIcon,
    CodeBracketIcon,
    Cog8ToothIcon,
} from "@heroicons/vue/24/outline"
</script>

<template>
    <nav class="w-20 h-full bg-white border-r-2 border-slate-100 rounded-l-xl">
        <ul>
            <RouterLink
                class="w-full h-12 flex justify-center items-center py-10 text-slate-400"
                as="li"
                to="/"
            >
                <HomeIcon class="w-5 h-5 stroke-2" />
            </RouterLink>

            <li
                class="w-full h-12 flex justify-center items-center py-10 text-red-500"
            >
                <CircleStackIcon class="w-9 h-9 stroke-2" />
            </li>

            <li
                class="w-full h-12 flex justify-center items-center py-10 text-slate-400 hover:text-slate-800"
            >
                <CodeBracketIcon class="w-9 h-9 stroke-2" />
            </li>

            <li
                class="w-full h-12 flex justify-center items-center py-10 text-slate-400 hover:text-slate-800"
            >
                <Cog8ToothIcon class="w-9 h-9 stroke-2" />
            </li>
        </ul>
    </nav>
</template>
