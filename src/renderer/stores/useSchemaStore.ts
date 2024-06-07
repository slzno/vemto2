import { defineStore } from "pinia"
import Table from "@Common/models/Table"
import { useProjectStore } from "./useProjectStore"
import SchemaSection from "@Common/models/SchemaSection"

export const useSchemaStore = defineStore("schema", {
    state: () => ({ 
        focusedTable: {} as Table,
        selectedTable: {} as Table,
        selectedSchemaSection: {} as SchemaSection,
        needsToReloadSchema: false,
        needsToReloadEveryTable: false,
        needsToReloadTableId: null as string | null,
    }),

    actions: {
        askToReloadTableById(tableId: string) {
            this.needsToReloadTableId = tableId
        },

        tableAlreadyReloaded() {
            this.needsToReloadTableId = null
        },

        askToReloadSchema() {
            this.needsToReloadSchema = true
        },

        schemaAlreadyReloaded() {
            this.needsToReloadSchema = false

            this.askToReloadEveryTable()
        },

        askToReloadEveryTable() {
            this.needsToReloadEveryTable = true

            setTimeout(() => {
                this.everyTableAlreadyReloaded()
            }, 100)
        },

        everyTableAlreadyReloaded() {
            this.needsToReloadEveryTable = false
        },

        reloadSelectedTable() {
            this.selectedTable = this.selectedTable.fresh()
        },

        selectTable(table: Table): void {
            this.deselectTable()

            this.selectedTable = table
        },

        deselectTable(): void {
            this.selectedTable = {} as Table
        },

        focusTable(table: Table): void {
            this.focusedTable = table
        },

        selectDefaultSchemaSection(): void {
            const projectStore = useProjectStore()

            this.selectSchemaSection(projectStore.project.getDefaultSchemaSection())
        },

        selectLatestSchemaSection(): void {
            const projectStore = useProjectStore(),
                defaultSchemaSection = projectStore.project.getDefaultSchemaSection()

            const latestSchemaSectionId = window.localStorage.getItem(
                this.getSelectedSchemaSectionKey()
            )

            if(!latestSchemaSectionId) {
                this.selectSchemaSection(defaultSchemaSection)

                return
            }

            const latestSchemaSection = SchemaSection.find(window.localStorage.getItem(
                this.getSelectedSchemaSectionKey()
            ))

            this.selectSchemaSection(latestSchemaSection || defaultSchemaSection)
        },

        selectSchemaSection(section: SchemaSection): void {
            this.selectedSchemaSection = section

            setTimeout(() => {
                window.localStorage.setItem(
                    this.getSelectedSchemaSectionKey(), 
                    section.id
                )
            }, 100)
        },

        deselectSchemaSection(): void {
            this.selectedSchemaSection = {} as SchemaSection
        },

        getSelectedSchemaSectionKey(): string {
            const projectStore = useProjectStore()

            return `selectedSchemaSection_${projectStore.project.id}`
        },
    },

    getters: {
        selectedTableIs(state) {
            return (table: Table) => state.selectedTable.id === table.id
        },

        selectedTableIsNot(state) {
            return (table: Table) => state.selectedTable.id !== table.id
        },

        hasSelectedTable(state): boolean {
            return !! state.selectedTable.id
        },

        selectedSchemaSectionIs(state) {
            return (section: SchemaSection) => state.selectedSchemaSection.id === section.id
        },
    }
})
