const fs = require('fs')

// read electron-builder.json, change the win.sign to "./nothing.js" and save as electron-builder-no-sign.json
const electronBuilderConfig = JSON.parse(fs.readFileSync('electron-builder.json', 'utf-8'))

electronBuilderConfig.afterSign = "./nothing.js"

delete electronBuilderConfig.win.certificateSubjectName

electronBuilderConfig.win.sign = "./nothing.js"

fs.writeFileSync('electron-builder-no-sign.json', JSON.stringify(electronBuilderConfig, null, 4))
