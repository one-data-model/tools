const fs = require('fs');
const sdfLint = require('../sdflint');
const { exec } = require('child_process');

/* Requires merge-patch command installed */
const MERGE_PATCH_CMD = "merge-patch";
const VERBOSE = true;

let modelFile = process.argv[2];
let schemaFile = process.argv[3];
let testCases = process.argv.slice(4);

let schema;

function fail(reason) {
  console.error(reason);
  process.exit(1);
}

try {
  schema = JSON.parse(fs.readFileSync(schemaFile,
    { encoding: 'utf-8' }));
} catch (err) {
  fail("Can't read schema file: " + err.message);
}

testCases.forEach(patchFile => {
  let patchCmd = MERGE_PATCH_CMD + " " + modelFile + " " + patchFile;
  let caseName = patchFile.substring(0,patchFile.lastIndexOf('.'));

  exec(patchCmd, (error, stdout, stderr) => {
      if (error) {
        fail(error.message);
      }
      if (stderr) {
        fail(stderr);
      }

      let lintResult = sdfLint.sdfLint(stdout, schema);
      let schemaErr = lintResult.errors.schema[0];

      if (lintResult.errorCount < 1) {
        console.error("Didn't detect error case " + caseName);
      }

      if (VERBOSE) {
        console.log("Case " + caseName);
        console.log("  Path: "  + schemaErr.dataPath);
        console.log("  Error: " + schemaErr.message);
      }
    });

});