<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router';
</script>

<template>
    <RouterLink to="/">Back</RouterLink>
    
    <div>
        <RouterLink to="project/schema">Open Schema</RouterLink>
    </div>

    <RouterView/>
</template>
