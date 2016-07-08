const fs = require('fs');
const path = require('path');

const thisPath = '.';
const otherPath = process.argv[2];

const RE = /^dx\..*\.js$/;

function isTargetFile(file) {
    return RE.test(file);
}

function getFiles(dirPath) {
    return new Promise((resolve) => {
        fs.readdir(dirPath, (e, files) => {
            if (e) {
                console.log(e);
            }
            resolve(files ? files.filter(isTargetFile) : []);
        });        
    });
}

function getFileSize(filePath) {
    return new Promise((resolve) => {
        fs.stat(filePath, (e, stat) => {
            if (e) {
                console.log(`${filePath}: ${e}`);
            }
            resolve(stat ? stat.size : -1);
        });
    });
}

function compareFiles(filePath) {
    return Promise.all([getFileSize(path.join(thisPath, filePath)), getFileSize(path.join(otherPath, filePath))]).then((sizes) => {
        const [thisSize, otherSize] = sizes;
        return { file: filePath, thisSize, otherSize, diff: thisSize > 0 && otherSize > 0 ? thisSize - otherSize : null };
    });
}

function compareAllFiles(files) {
    return Promise.all(files.map(compareFiles))
}

function formatDiff(diff) {
    return diff !== null ? (diff > 0 ? '+' : '-') + ' ' + Math.abs(diff) : 'N/A';
}

function padString(str, length) {
    return str + ' '.repeat(length - str.length);
}

function showDiffs(diffs) {
    diffs.forEach((diff) => {
        console.log(`${padString(diff.file, 30)} ${padString(formatDiff(diff.diff), 10)} ${padString(String(diff.otherSize), 8)} -> ${padString(String(diff.thisSize), 8)}`);
    });
    if (process.argv[3]) {
        return exportToFile(process.argv[3], diffs);
    }
}

function exportToFile(pathToFile, diffs) {
    return new Promise((resolve) => {
        const content = diffs.map((diff) => `${diff.file},${diff.diff},${diff.otherSize},${diff.thisSize}`).join('\n');
        fs.writeFile(pathToFile, content, (e) => {
            if (e) {
                console.log(`${pathToFile}: ${e}`);
            }
            resolve();
        });
    });
}

getFiles(thisPath).then(compareAllFiles).then(showDiffs).then(() => console.log('DONE!'));
