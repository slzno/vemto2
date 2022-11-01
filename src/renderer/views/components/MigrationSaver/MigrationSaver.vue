<script setup lang="ts">
    import UiButton from "@Renderer/components/ui/UiButton.vue"
    import { ArrowDownTrayIcon } from "@heroicons/vue/24/outline"
    import { useProjectStore } from "@Renderer/stores/useProjectStore"
    import UiModal from "@Renderer/components/ui/UiModal.vue"
    import { ref } from "vue"
// import UiRadio from "@Renderer/components/ui/UiRadio.vue"

    const projectStore = useProjectStore(),
        showingModal = ref(true),
        checked = ref("create")
</script>

<template>
    <div
        class="absolute bottom-0 left-0 p-4"
        v-if="projectStore.project.hasUpdatedTables()"
    >
        <UiButton class="flex items-center justify-between" @click="showingModal = true">
            <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
            Save
        </UiButton>

        <UiModal title="Review Migrations" :show="showingModal" @close="showingModal = false">
            
            <section class="p-4 space-y-4">
                <div class="bg-slate-800 rounded-lg" v-for="table in projectStore.project.getUpdatedTables()" :key="table.id">
                    <header class="p-4">
                        Table <span class="text-red-500 dark:text-red-400">{{ table.name }}</span>
                    </header>

                    <div class="p-4 space-y-4">
                        <div>
                            <!-- <UiRadio label="Create" value="create" v-model="checked" />
                            <UiRadio label="Append to migration" value="append" v-model="checked" /> -->
                            <input type="radio" id="one" value="One" v-model="checked" />
                            <label for="one">Append to latest migration <span class="text-red-500 dark:text-red-400">/database/migrations/2014_10_12_000000_create_users_table.php</span></label>
                            <br>
                            <input type="radio" id="two" value="Two" v-model="checked" />
                            <label for="two">Create new migration</label>
                        </div>
                    </div>
                </div>
            </section>

            <template #footer>
                <div class="flex justify-end p-4">
                    <UiButton
                        @click="showingModal = false"
                        >Save</UiButton
                    >
                </div>
            </template>
        </UiModal>
    </div>
</template>
