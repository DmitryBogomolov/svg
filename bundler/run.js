const exec = require('child_process').exec;
const fs = require('fs');

const targets = [
    'chart',
    'pie_chart',
    'polar_chart',
    
    'circular_gauge',
    'linear_gauge',
    'bar_gauge',
    
    'range_selector',
    
    'vector_map',
    
    'sparkline',
    'bullet',
    
    'tree_map',
    'tree_map_base'
].map((name) => ({
    name: `dx.${name}`,
    content: `window[\'${name}\'] = require(\'devextreme/viz/${name}\');`
}));

// Patch for tree_map.base
targets[targets.length - 1].content = targets[targets.length - 1].content.replace('/tree_map_base', '/tree_map/tree_map.base');

// Patch for all
targets.push({ name: 'dx.all', content: targets.map((target) => target.content).join('\n') });

function getConfigFileName(name) {
    return name + '.config.js';
}

Promise.all(targets.map(processTarget)).then(() => console.log('DONE!'));

function processTarget(target) {
    return createConfig(target).then(executeBundle).then(destroyConfig);
}

function createConfig(target) {
    return new Promise((resolve) => {
        const filePath = getConfigFileName(target.name);
        fs.writeFile(filePath, target.content, (e) => {
            if (e) {
                console.log(`${filePath}: ${e}`);
            }
            resolve(target);
        });
    });
}

function destroyConfig(target) {
    return new Promise((resolve) => {
        const filePath = getConfigFileName(target.name);
        fs.unlink(filePath, (e) => {
            if (e) {
                console.log(`${filePath}: ${e}`);
            }
            resolve(target);
        });
    });
}

function executeBundle(target) {
    return new Promise((resolve) => {
        exec(`node node_modules/devextreme/bin/bundler.js ${target.name}`, (e, out, err) => {
            console.log(out);
            if (e) {
                console.log(e);
            }
            resolve(target);
        });
    });
}
