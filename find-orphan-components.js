
const fs = require('fs');
const path = require('path');
// Use a dynamic import for glob as it's an ES module
async function main() {
    const { glob } = await import('glob');

    const componentsDir = path.join(process.cwd(), 'components');
    const searchDirs = [
        path.join(process.cwd(), 'components'),
        path.join(process.cwd(), 'pages'),
        path.join(process.cwd(), 'layouts') // Added layouts just in case
    ];

    // Function to convert a file path to possible Vue component tag names
    function getComponentTags(filePath) {
        const componentName = path.basename(filePath, '.vue');
        const toKebabCase = str => str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

        const relativePath = path.relative(componentsDir, filePath);
        const pathParts = relativePath.split(path.sep).slice(0, -1);
        pathParts.push(componentName);

        const tags = new Set();

        // For a component like /components/admin/MyComponent.vue
        // Nuxt 2 generates tags like <admin-my-component> and <AdminMyComponent>
        const kebabName = pathParts.map(toKebabCase).join('-');
        tags.add(kebabName);

        const pascalName = pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        tags.add(pascalName);
        
        // It might also be referenced just by its name if it's not nested deep
        if (pathParts.length === 1) {
             tags.add(toKebabCase(componentName));
             tags.add(componentName);
        }

        return Array.from(tags);
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
            searchDirs.map(dir => glob('**/*.vue', { cwd: dir, absolute: true, ignore: '**/node_modules/**' }))
        )).flat();

        const fileContents = new Map();
        for (const file of searchFiles) {
            fileContents.set(file, fs.readFileSync(file, 'utf-8'));
        }
        console.log(`Searching within ${searchFiles.length} files...`);

        const orphans = [];
        for (const componentFile of componentFiles) {
            const componentTags = getComponentTags(componentFile);
            let isUsed = false;

            for (const [searchFile, content] of fileContents.entries()) {
                // A component is not orphan if it's used in a file other than itself
                if (searchFile === componentFile) continue;

                for (const tag of componentTags) {
                    const regex = new RegExp(`<${tag}(>|\s|-)`, 'i');
                    if (regex.test(content)) {
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
            console.log('Note: This is a static analysis. Dynamic components (e.g., <component :is=...>) may be missed.');
        } else {
            console.log('\n--- No Orphan Components Found ---');
        }
    }

    await findOrphanComponents();
}

main().catch(console.error);
