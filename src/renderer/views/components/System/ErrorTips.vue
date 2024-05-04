<script setup lang="ts">
    import UiTip from "@Renderer/components/ui/UiTip.vue"
    import { useErrorsStore } from "@Renderer/stores/useErrorsStore"

    const errorsStore = useErrorsStore()
</script>

<template>
    <div>
        <div class="mb-2" v-if="errorsStore.hasErrorWithText('schema-reader-mg')">
            <UiTip>
                it seems like there are errors in the schema reader. Maybe you want to use Database Schema Reader mode.
            </UiTip>
        </div>
    
        <div class="mb-2" v-if="errorsStore.hasErrorWithText('Illuminate\\Routing\\UrlGenerator::__construct()')">
            <UiTip>
                it seems you are using <b>url(), asset() or route()</b> functions in your config files. Please remove them before trying to connect your application, or use PHP_SAPI to check if you are in a CLI environment. For example:
                <br><br>
                <div class="font-mono text-green-500">
                    'setting' => PHP_SAPI === 'cli' ? false : url('')
                </div>
            </UiTip>
        </div>
    </div>
</template>
