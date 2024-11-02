# Dockerfile for sdf-matter-converter
# See https://github.com/niklasbhv/sdf-matter-converter?tab=readme-ov-file#using-the-command-line-tool

FROM ubuntu:24.04

RUN apt-get update && apt-get upgrade -y

RUN apt-get install -y \
    curl \
    git \
    cmake \
    libxml2-dev \
    build-essential

WORKDIR /sdf-matter

RUN git clone https://github.com/niklasbhv/sdf-matter-converter .

RUN cmake .
RUN cmake --build .


CMD ["/sdf-matter/sdf_matter_converter"]
