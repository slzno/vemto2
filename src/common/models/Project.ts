import Table from './Table'
import RelaDB from '@tiago_silva_pereira/reladb'

export default class Project extends RelaDB.Model {
    path: string = ""

    static identifier() {
        return 'Project'
    }

    relationships() {
        return {
            tables: () => this.hasMany(Table).cascadeDelete(),
        }
    }

    static findOrCreate(): Project {
        let project: Nullable<Project> = Project.find(1)

        if (project === null) {
            project = new Project()
            project.save()
        }

        return project
    }

    setPath(path: string) {
        this.path = path
    }

    getPath(): string {
        return this.path
    }
}
