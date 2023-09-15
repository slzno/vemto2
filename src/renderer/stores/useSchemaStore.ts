import { defineStore } from "pinia"
import Table from "@Common/models/Table"

export const useSchemaStore = defineStore("schema", {
    state: () => ({ 
        selectedTable: {} as Table
    }),

    actions: {
        selectTable(table: Table): void {
            this.deselectTable()

            this.selectedTable = table
        },

        deselectTable(): void {
            this.selectedTable = {} as Table
        }
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
