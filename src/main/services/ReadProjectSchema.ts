import path from "path"
import { app } from "electron"
import { exec } from "child_process"

export default class ReadProjectSchema {

    static run(projectPath: string) {
        return new Promise((resolve, reject) => {
            let apiFilePath = path.join(app.getAppPath(), "static", "schema-reader.phar")
    
            let command = `php ${apiFilePath}`

            console.log(`Executing: ${command}`)
    
            exec(command, {
                cwd: path.join("", projectPath),
            }, (error, stdout, stderr) => {
                if (error)  reject(error)
                if (stderr) reject(stderr)
    
                resolve(this.parseJsonData(stdout))
            })
        })
    }

    static parseJsonData(data: string): any {
        let matches = data.match(/VEMTO_JSON_RESPONSE_INIT\((.*)\)VEMTO_JSON_RESPONSE_END/)
        
        if (matches && matches[1]) {
            return JSON.parse(matches[1])
        }

        return {}
    }

}
