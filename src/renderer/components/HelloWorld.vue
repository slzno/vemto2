<script setup lang="ts">
    import { ref } from "vue"

    const msg = ref("Electron + Vue3 template")
</script>

<template>
    <div id="hello">
        <p>
            {{ msg }}
        </p>

        <input class="p-8 bg-gray-100" type="text" v-model="msg" />
    </div>
</template>
