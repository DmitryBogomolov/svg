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

Promise.all(targets.map(processTarget)).then(() => {
   console.log('DONE!');
});

function processTarget(target) {
    return new Promise((resolve) => {
        // TODO: Use promises for the following
        const configFile = target.name + '.config.js';
        fs.writeFile(configFile, target.content, (e) => {
            if (e) {
                console.log(`${configFile}: ${e}`);
            }
            exec(`node node_modules/devextreme/bin/bundler.js ${target.name}`, (e, out, err) => {
                console.log(out);
                if (e) {
                    console.log(e);
                }
                fs.unlink(configFile, (e) => {
                    if (e) {
                        console.log(`${target.file}: ${e}`);
                    }
                    resolve();
                });
            });
        });
    });
}
