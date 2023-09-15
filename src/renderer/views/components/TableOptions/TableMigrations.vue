<script setup lang="ts">
    import Table from '@Common/models/Table';
import Main from '@Renderer/services/wrappers/Main';
    import { defineProps, toRef, Ref } from 'vue'

    const props = defineProps(['table']),
        table = toRef(props, 'table') as Ref<Table>

    const isCreationMigration = (migration: any) => {
        if(!table.value.hasCreationMigration()) return false

        const creationMigration = table.value.getCreationMigration()

        return creationMigration.relativePath === migration.relativePath
    }

    const openMigration = (migration: any) => {
        Main.API.openProjectFile(migration.relativePath)
    }
</script>
<template>
    <div>
        <section class="space-y-2">
            <div class="flex flex-col py-2 px-4 rounded-lg bg-slate-900 text-slate-300 cursor-pointer hover:bg-slate-950" 
            title="Open migration"
            v-for="migration in table.migrations" @click="openMigration(migration)">
                <div class="text-green-400" v-if="isCreationMigration(migration)">
                    Creation migration
                </div>
                <div class="text-yellow-400" v-else>
                    Update migration
                </div>
                <div>
                    {{ migration.relativePath }}
                </div>
            </div>
        </section>
    </div>
</template>
