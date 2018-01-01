const request = require('request');
const fs = require('fs');
const beautify = require('json-beautify');

// const runForOnly = null; // run for all .json files
const runForOnly = 'ardaas.json';

const sourceBaniDirectory = '../../assets/banis';


function main(input, i, cb, output = []) {
  const lineObj = input[i];
  request.post({
    url: 'http://punjabi.aglsoft.com/punjabi/ajax.aspx',
    headers: {
      Pragma: 'no-cache',
      Origin: 'http://punjabi.aglsoft.com',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: '*/*',
      'Cache-Control': 'no-cache',
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: 'ASP.NET_SessionId=wtsa1hz1db1h4le1qvdhydz4; __utma=3823025.1814184022.1514827238.1514827238.1514827238.1; __utmc=3823025; __utmz=3823025.1514827238.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __utmt=1; __utmb=3823025.2.10.1514827238',
      Connection: 'keep-alive',
      Referer: 'http://punjabi.aglsoft.com/punjabi/converter/?show=text'
    },
    form: {
      action: 'Conversion',
      id: 0,
      inputText: encodeURI(lineObj.gurmukhi),
      sourceFont: 'WebAkhar/GurbaniAkhar/GurbaniLipi',
      destinationFont: 'Unicode'
    }
  }, (e, r, res) => {
    console.log(res);
    lineObj.gurmukhi_unicode = res;
    output.push(lineObj);
    if (i === input.length - 1) {
      cb(output);
    } else {
      main(input, i + 1, cb, output);
    }
  });
}


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

readFiles(sourceBaniDirectory, (filename, content) => {
  main(JSON.parse(content), 0, (outputJSON) => {
    fs.writeFile(`${sourceBaniDirectory}/${filename}`, beautify(outputJSON, null, 2, 80), (err) => {
      if (err) throw err;
      console.log('file saved');
    });
  });
}, (err) => {
  if (err) throw err;
});
