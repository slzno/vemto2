<script setup lang="ts">
import { RouterView } from 'vue-router';
import ProjectNavbar from '@Renderer/components/ProjectNavbar.vue';
</script>

<template>
    <div class="h-full flex">
        <ProjectNavbar/>
        
        <!-- Content -->
        <div class="flex-1">
            <RouterView/>
        </div>
    </div>
</template>
