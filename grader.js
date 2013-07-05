#!/usr/bin/env node
var sys = require('util');
var rest = require('restler'); 
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)){
    	console.log("%s does not exist. Exiting.", instr);
    	process.exit(1); 
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(checksfile) {
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks) {
       var present =$(checks[ii]).length > 0;
       out[checks[ii]] = present;
    }
    return out;
};


if(require.main == module) {
    program.option('-c, --checks <checks>', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT).option('-f, --file <file> ', 'Path to index.html', assertFileExists).option('-u, --url <url>','Path to URL');
    program.parse(process.argv);

    if (program.file) {
        $ = cheerioHtmlFile(program.file);
        var checkJson = checkHtmlFile(program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    } else if (program.url) {
        rest.get(program.url).on('complete', function(result) {
            if (result instanceof Error) {
                sys.puts('Error: ' + result.message);
                this.retry(5000); // try again after 5 sec
            } else {
                $ = cheerio.load(result);
                var checkJson = checkHtmlFile(program.checks);
                var outJson = JSON.stringify(checkJson, null, 4);
                console.log(outJson);    
            }
        });
    } else {
        console.log("Error: Missing arguments");
        process.exit(1); 
    }

} else {
    console.log("Error: Must be invoked from the command line");
    process.exit(1); 
}

