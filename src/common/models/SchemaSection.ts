import Table from './Table'
import Project from './Project'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class SchemaSection extends RelaDB.Model {
    id: string
    name: string
    tables: Table[]
    project: Project
    projectId: string
    scrollX: number
    scrollY: number
    scrollCenteringRequested: boolean
    zoom: number

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            tables: () => this.hasMany(Table, "sectionId"),
        }
    }

    static deleting(section: SchemaSection) {
        const defaultSection = section.project.getDefaultSchemaSection()

        section.tables.forEach(table => {
            table.moveToSection(defaultSection)
        })
    }

    isDefault() {
        return ["App", "Main"].includes(this.name)
    }

    canBeRemoved() {
        if(this.project.schemaSections.length <= 1) return false

        return !this.isDefault()
    }

    hasScroll(): boolean {
        return !! this.scrollX && !! this.scrollY
    }

    centerScroll(canvasWidth, canvasHeight, baseSize: number = 50000) {
        this.scrollX = (baseSize / 2) - (canvasWidth / 2)
        this.scrollY = (baseSize / 2) - (canvasHeight / 2)
        this.save()
    }

    saveScroll(x: number, y: number) {
        this.scrollX = x
        this.scrollY = y
        this.save()
    }

    checkAndDelete() {
        if(this.isDefault()) {
            throw new Error("Cannot delete default schema section")
        }

        this.delete()
    }

    requestScrollCentering() {
        this.scrollCenteringRequested = true
        this.save()
    }

    clearScrollCenteringRequest() {
        this.scrollCenteringRequested = false
        this.save()
    }

    getTablesQuantity(): number {
        return this.tables.length
    }

    // New methods for handling zoom
    
    /**
     * Get the zoom level for this section
     * Falls back to project zoom if not set
     */
    getZoom(): number {
        if (this.zoom === undefined || this.zoom === null) {
            return this.project ? this.project.currentZoom : 100;
        }
        return this.zoom;
    }

    /**
     * Get zoom as scale (decimal value)
     */
    getZoomAsScale(): number {
        return this.getZoom() / 100;
    }

    /**
     * Save zoom level for this section
     */
    saveZoom(zoomLevel: number): void {
        this.zoom = zoomLevel;
        this.save();
    }

    /**
     * Increase zoom level
     */
    zoomIn(): void {
        const currentZoom = this.getZoom();
        if (currentZoom >= 200) return;
        this.saveZoom(currentZoom + 10);
    }

    /**
     * Decrease zoom level
     */
    zoomOut(): void {
        const currentZoom = this.getZoom();
        if (currentZoom <= 10) return;
        this.saveZoom(currentZoom - 10);
    }
}