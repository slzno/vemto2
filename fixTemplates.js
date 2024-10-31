const fs = require('fs');
const path = require('path');

// Directory containing the services
const servicesDir = path.join(__dirname, 'src', 'renderer', 'codegen', 'sequential', 'services');

// Function to recursively get all .ts files in a directory
function getAllFiles(dir, extension, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (let entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllFiles(fullPath, extension, files);
        } else if (entry.isFile() && fullPath.endsWith(extension)) {
            files.push(fullPath);
        }
    }
    return files;
}

// Get all TypeScript files in the services directory
const tsFiles = getAllFiles(servicesDir, '.ts');

for (let tsFile of tsFiles) {
    const content = fs.readFileSync(tsFile, 'utf-8');

    // Check if the file contains a class that extends Renderable
    const classRegex = /export\s+default\s+class\s+(\w+)\s+extends\s+Renderable\s*\{([\s\S]*?)\}/;
    const match = content.match(classRegex);
    if (match) {
        const className = match[1];
        const classBody = match[2];

        // Get the template file path from getTemplateFile() method
        const getTemplateFileRegex = /(?<=(getTemplateFile\(\):\s*string\s*\{\s*return\s*"))([^"]+)(?=")/;
        const templateMatch = content.match(getTemplateFileRegex);
        if (!templateMatch) {
            console.log(`No template found in ${tsFile}`);
            continue;
        }
        const templateRelativePath = templateMatch[2];
        const templateFile = path.join(__dirname, 'src', 'main', 'static', 'templates', templateRelativePath);

        if (!fs.existsSync(templateFile)) {
            console.log(`Template file not found: ${templateFile}`);
            continue;
        }

        let templateContent = fs.readFileSync(templateFile, 'utf-8');

        // Check if template already has the TEMPLATE DATA section
        if (templateContent.includes('<# TEMPLATE DATA #>')) {
            continue;
        }

        // Parse getData() method to get data model attributes
        const getDataRegex = /getData\s*\(\s*\)\s*\{\s*return\s*{([\s\S]*?)}\s*;\s*\}/;
        const getDataMatch = content.match(getDataRegex);
        let dataModelAttributes = [];

        if (getDataMatch) {
            const dataContent = getDataMatch[1];
            const dataKeysRegex = /(\w+)\s*:/g;
            let keyMatch;
            while ((keyMatch = dataKeysRegex.exec(dataContent)) !== null) {
                dataModelAttributes.push(keyMatch[1]);
            }
        }

        // Get constructor parameters
        const constructorRegex = /constructor\s*\(\s*([^\)]*)\)/;
        const constructorMatch = content.match(constructorRegex);
        let constructorParams = [];
        if (constructorMatch) {
            const paramsContent = constructorMatch[1];
            const params = paramsContent.split(',').map(p => p.trim()).filter(p => p);
            for (let param of params) {
                const [paramName, paramType] = param.split(':').map(s => s.trim());
                if (paramName && paramType) {
                    constructorParams.push({ name: paramName, type: paramType });
                }
            }
        }

        // Generate TEMPLATE DATA section
        let templateDataSection = '<####>\n<# TEMPLATE DATA #>\n<# DATA:MODEL [ project = Project ] #>\n';

        for (let attr of dataModelAttributes) {
            // Find the type of the attribute
            let type = null;
            // Try to find in class properties
            const propertyRegex = new RegExp(`\\b${attr}\\s*:\\s*(\\w+)`, 'g');
            const propertyMatch = propertyRegex.exec(content);
            if (propertyMatch) {
                type = propertyMatch[1];
            } else {
                const param = constructorParams.find(p => p.name === attr);
                if (param) {
                    type = param.type;
                } else {
                    type = 'Any';
                }
            }
            templateDataSection += `<# DATA:MODEL [ ${attr} = ${type} ] #>\n`;
        }

        // Create DATA:RENDERABLE line
        const relativePath = path.relative(servicesDir, tsFile).replace(/\\/g, '/').replace(/\.ts$/, '');
        const constructorArgNames = constructorParams.map(p => p.name).join(', ');

        templateDataSection += `<# DATA:RENDERABLE [ renderable = ${relativePath}(${constructorArgNames}) ] #>\n`;
        templateDataSection += '<####>\n\n';

        // Prepend the TEMPLATE DATA section to the template content
        templateContent = templateDataSection + templateContent;

        // Overwrite the template file
        fs.writeFileSync(templateFile, templateContent);

        console.log(`Updated template: ${templateFile}`);
    }
}
