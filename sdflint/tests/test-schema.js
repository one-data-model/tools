const fs = require('fs');
const sdfLint = require('../sdflint');
const { exec } = require('child_process');

/* Requires merge-patch command installed */
const MERGE_PATCH_CMD = "merge-patch";
const VERBOSE = false;

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

if (testCases.length > 0) {
  runTestCases(testCases);
} else {
  /* change random quality value to 42 100 times */
  breakQualities(100, 42);
}

function runTestCases(testCases) {
  testCases.forEach(patchFile => {
    let patchCmd = MERGE_PATCH_CMD + " " + modelFile + " " + patchFile;
    let caseName = patchFile.substring(0, patchFile.lastIndexOf('.'));

    exec(patchCmd, (error, stdout, stderr) => {
      if (error) {
        fail(error.message);
      }
      if (stderr) {
        fail(stderr);
      }

      let lintResult = sdfLint.sdfLint(stdout, schema);
      if (lintResult.errorCount < 1) {
        console.error("Didn't detect error case " + caseName);
      } else if (VERBOSE) {
          let schemaErr = lintResult.errors.schema[0];
          console.log("Case " + caseName);
          console.log("  Path: " + schemaErr.dataPath);
          console.log("  Error: " + schemaErr.message);
      }
    });

  });

}

function breakQualities(tryCount, newValue) {
  let sdfData;
  try {
    sdfData = fs.readFileSync(modelFile,
      { encoding: 'utf-8' });
  } catch (err) {
    fail("Can't read SDF model file: " + err.message);
  }

  let lintRes = sdfLint.sdfLint(sdfData, schema);
  if (lintRes.errorCount > 1) {
    console.dir(sdfData, { "depth": null });
    fail("SDF model has errors");
  }

  for (let i = 0; i < tryCount; i++) {
    let sdf = JSON.parse(sdfData);
    let changedElement = randomChangeValue(sdf, newValue, "");
    if (VERBOSE) {
      console.log("Changing " + changedElement + " -> " + newValue);
    }
    lintRes = sdfLint.sdfLint(sdf, schema, undefined, { "isJSON": true });
    if (lintRes.errorCount == 0) {
      console.log("Missed change: " + changedElement + " -> " + newValue);
    }
  }
}

/* randomly change one JSON object member or array value to newVal */
function randomChangeValue(json, newVal, path) {
  const keys = Object.keys(json);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  if (typeof json[randomKey] === 'object') {
    return randomChangeValue(json[randomKey], newVal, path + randomKey + '/');
  } else if (Array.isArray(json)) {
    if (json.length > 0) {
      json[randomKey] = newVal;
    } else {
      json[0] = newVal;
    }
    return path + randomKey;
  }
  else {
    json[randomKey] = newVal;
    return path + randomKey;
  }
}

