import { defineStore } from "pinia"
import Table from "@Common/models/Table"
import SchemaSection from "@Common/models/SchemaSection"

export const useSchemaStore = defineStore("schema", {
    state: () => ({ 
        focusedTable: {} as Table,
        selectedTable: {} as Table,
        selectedSchemaSection: {} as SchemaSection
    }),

    actions: {
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

        selectSchemaSection(section: SchemaSection): void {
            this.selectedSchemaSection = section
        },

        deselectSchemaSection(): void {
            this.selectedSchemaSection = {} as SchemaSection
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
        }
    }
})
