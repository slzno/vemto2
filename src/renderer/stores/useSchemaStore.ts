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
        needsToReloadTables: [] as string[],
        needsToReloadSchemaConnections: false,
        needsToAnimateTablesPositions: false,
        needsToHideSchemaConnections: false,
    }),

    actions: {
        askToReloadTableById(tableId: string) {
            this.addTableToReload(tableId)

            const table = Table.find(tableId)

            table.getRelatedTables().forEach((relatedTable) => {
                this.addTableToReload(relatedTable.id)
            })

            setTimeout(() => {
                this.askToReloadSchemaConnections()
            }, 100)
        },

        tableAlreadyReloaded(tableId: string) {
            this.needsToReloadTables = this.needsToReloadTables.filter((id) => id !== tableId)
        },

        addTableToReload(tableId: string) {
            if(! this.needsToReloadTables.includes(tableId)) {
                this.needsToReloadTables.push(tableId)
            }
        },

        askToReloadSchema() {
            this.needsToReloadSchema = true
        },

        askToAnimateTablesPositions() {
            this.needsToAnimateTablesPositions = true
        },

        tablesAnimationCompleted() {
            this.needsToAnimateTablesPositions = false

            this.askToReloadSchemaConnections()
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

        askToReloadSchemaConnections() {
            this.needsToReloadSchemaConnections = true
        },

        schemaConnectionsAlreadyReloaded() {
            this.needsToReloadSchemaConnections = false
        },

        askToHideSchemaConnections() {
            this.needsToHideSchemaConnections = true
        },

        schemaConnectionsAlreadyHidden() {
            this.needsToHideSchemaConnections = false
        },

        reloadSelectedTable() {
            this.selectedTable = this.selectedTable.fresh()
        },

        selectTable(table: Table): void {
            if(this.selectedSchemaSection) {
                this.selectedSchemaSection.refresh()
            }

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

        organizeTables(schemaSection: SchemaSection | null = null): void {
            const projectStore = useProjectStore()

            const schemaSectionToOrganize = schemaSection || this.selectedSchemaSection
            
            if (!schemaSectionToOrganize || !projectStore.project) return
            
            projectStore.project.organizeTablesByRelations(schemaSectionToOrganize)

            this.askToAnimateTablesPositions()
        },

        organizeTablesHorizontally(schemaSection: SchemaSection | null = null): void {
            const projectStore = useProjectStore()

            const schemaSectionToOrganize = schemaSection || this.selectedSchemaSection
            
            if (!schemaSectionToOrganize || !projectStore.project) return
            
            projectStore.project.organizeTablesHorizontally(schemaSectionToOrganize)

            this.askToAnimateTablesPositions()
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

        needsToReloadTable(state) {
            return (tableId: string) => state.needsToReloadTables.includes(tableId)
        },
    }
})
