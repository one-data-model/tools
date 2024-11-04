# Dockerfile for sdf-matter-converter

Dockerfile for the [SDF Matter converter tool](https://github.com/niklasbhv/sdf-matter-converter)

## Build

`docker build -t sdf-matter .`

The Dockerfile clones and builds the converter tool and clones [Matter model files](https://github.com/project-chip/connectedhomeip.git) to the container folder  `/matter`

## Run

The converter is set as the entrypoint for the container so the converter can be simply run with `docker run --rm sdf-matter`

Since the converter uses files as input and output, you typically want to mount a local folder to support that. For example, to convert AirPurifier Matter model (from the Matter models directory in the container) to SDF and store the result in the current host working directory:

```
docker run --rm  --mount type=bind,source=".",target="/out"  sdf-matter --matter-to-sdf -device-xml data_model/master/device_types/AirPurifier.xml -cluster-xml data_model/master/clusters -o /out/AirPurifier.json
```
