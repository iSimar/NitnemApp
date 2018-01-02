
const fs = require('fs');
const readline = require('readline');
const beautify = require('json-beautify');

const sourceBaniDirectory = '../../assets/banis';
const runForOnly = 'kirtansohila.json';
const offset = 18;
const delay = 1000;

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, (err, filenames) => {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach((filename) => {
      if (runForOnly && filename === runForOnly) {
        console.log(filename);
        fs.readFile(`${dirname}/${filename}`, 'utf-8', (err2, content) => {
          if (err2) {
            onError(err2);
            return;
          }
          onFileContent(filename, content);
        });
      } else if (!runForOnly && filename.indexOf('.json') !== -1) {
        console.log(filename);
        fs.readFile(`${dirname}/${filename}`, 'utf-8', (err2, content) => {
          if (err2) {
            onError(err2);
            return;
          }
          onFileContent(filename, content);
        });
      }
    });
  });
}

const rd = readline.createInterface({
  input: fs.createReadStream('./res.txt'),
  console: false
});

async function main() {
  const millis = [];
  await rd.on('line', async (line) => {
    if (line.indexOf('pts: ') !== -1) {
      const milli = parseInt(line.substring(line.indexOf('pts: ') + 5, line.indexOf(' pts_time:')));
      await millis.push(milli + delay);
    }
  });

  rd.on('close', async () => {
    readFiles(sourceBaniDirectory, (filename, content) => {
      const original = JSON.parse(content);
      const outputJSON = [];
      for (let i = 0; i < original.length; i++) {
        if (i + offset < millis.length) {
          original[i].audio_position = millis[i + offset];
        }

        outputJSON.push(original[i]);
        if (i === original.length - 1) {
          fs.writeFile(`${sourceBaniDirectory}/${filename}`, beautify(outputJSON, null, 2, 80), (err) => {
            if (err) throw err;
            console.log('file saved');
          });
        }
      }
    }, (err) => {
      if (err) throw err;
    });
  });
}

main();
