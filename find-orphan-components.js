
const fs = require('fs');
const path = require('path');
// Use a dynamic import for glob as it's an ES module
async function main() {
    const { glob } = await import('glob');

    const componentsDir = path.join(process.cwd(), 'components');
    const searchDirs = [
        path.join(process.cwd(), 'components'),
        path.join(process.cwd(), 'pages'),
        path.join(process.cwd(), 'layouts'), // Added layouts just in case
        path.join(process.cwd(), 'mixins'),
        path.join(process.cwd(), 'plugins'),
        path.join(process.cwd(), 'store'),
        path.join(process.cwd(), 'utils')
    ];

    // Function to convert a file path to possible Vue component references
    function getComponentReferences(filePath) {
        const componentName = path.basename(filePath, '.vue');
        const toKebabCase = str => str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

        const relativePath = path.relative(componentsDir, filePath);
        const pathParts = relativePath.split(path.sep).slice(0, -1);
        pathParts.push(componentName);

        const references = new Set();

        // Template tags
        const kebabName = pathParts.map(toKebabCase).join('-');
        references.add(kebabName);

        const pascalName = pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        references.add(pascalName);

        if (pathParts.length === 1) {
             references.add(toKebabCase(componentName));
             references.add(componentName);
        }

        // Import references
        const importPath = relativePath.replace(/\\/g, '/').replace(/\.vue$/, '');
        references.add(`@/components/${importPath}`);
        references.add(`~/components/${importPath}`);
        references.add(`components/${importPath}`);

        // Component name in JavaScript
        references.add(componentName);
        references.add(pascalName);

        return Array.from(references);
    }

    async function findOrphanComponents() {
        console.log('Analyzing project to find orphan components...');

        const componentFiles = await glob('**/*.vue', { cwd: componentsDir, absolute: true });
        if (componentFiles.length === 0) {
            console.log('No components found in `components` directory.');
            return;
        }
        console.log(`Found ${componentFiles.length} total components.`);

        const searchFiles = (await Promise.all(
            searchDirs.map(dir => glob('**/*.{vue,js,ts}', { cwd: dir, absolute: true, ignore: '**/node_modules/**' }))
        )).flat();

        const fileContents = new Map();
        for (const file of searchFiles) {
            fileContents.set(file, fs.readFileSync(file, 'utf-8'));
        }
        console.log(`Searching within ${searchFiles.length} files...`);

        const orphans = [];
        for (const componentFile of componentFiles) {
            const componentRefs = getComponentReferences(componentFile);
            let isUsed = false;

            for (const [searchFile, content] of fileContents.entries()) {
                // A component is not orphan if it's used in a file other than itself
                if (searchFile === componentFile) continue;

                for (const ref of componentRefs) {
                    // Search for template usage
                    const templateRegex = new RegExp(`<${ref.replace(/[-\/]/g, '[-/]')}(>|\s|[-])`, 'i');
                    if (templateRegex.test(content)) {
                        isUsed = true;
                        break;
                    }

                    // Search for import statements
                    const importRegex = new RegExp(`import.*${ref.replace(/[\/\.]/g, '[\/\\.]')}`, 'i');
                    if (importRegex.test(content)) {
                        isUsed = true;
                        break;
                    }

                    // Search for component registration in components: {}
                    const componentRegex = new RegExp(`components:\\s*{\\s*[^}]*${ref}[^}]*}`, 'i');
                    if (componentRegex.test(content)) {
                        isUsed = true;
                        break;
                    }

                    // Search for dynamic component usage
                    const dynamicRegex = new RegExp(`:is=["']${ref}["']|component.*:is.*${ref}`, 'i');
                    if (dynamicRegex.test(content)) {
                        isUsed = true;
                        break;
                    }
                }
                if (isUsed) break;
            }

            if (!isUsed) {
                orphans.push(path.relative(process.cwd(), componentFile));
            }
        }

        if (orphans.length > 0) {
            console.log('\n--- Found Possible Orphan Components ---');
            orphans.sort().forEach(orphan => console.log(orphan));
            console.log(`\nTotal: ${orphans.length} components seem to be unused.`);
            console.log('Note: This is a static analysis. Some dynamic or complex usages may still be missed.');
        } else {
            console.log('\n--- No Orphan Components Found ---');
        }
    }

    await findOrphanComponents();
}

main().catch(console.error);
