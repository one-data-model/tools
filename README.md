# SDF tools

## SDF linter

The sdflint.js program checks the validity of the given SDF file. By default the [sdf-validation.jso.json](sdflint/sdf-validation.jso.json) is used for schema check but different schema file can be given as a second parameter.

Usage: `node sdflint <sdf-file> [schemafile.json]`

Example: `node sdflint sdfobject-myfirstobject.sdf.json`

The output is a JSON object with two fields:
* errorCount: number of checks that failed (or 0 if all checks passed)
* errors: object with field for each type of error encountered
  * fileName: errors on input filename
  * parse: errors parsing the input file as JSON
  * schema: array of values with more details on schema errors

For schema errors, the error messages are described in more detail here: https://github.com/epoberezkin/ajv#error-objects