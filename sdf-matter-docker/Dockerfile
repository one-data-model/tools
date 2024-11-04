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

RUN git clone https://github.com/project-chip/connectedhomeip.git /matter
RUN rm /matter/data_model/master/clusters/cluster_ids.json

ENV PATH /sdf-matter:$PATH

WORKDIR /matter

ENTRYPOINT [ "sdf_matter_converter" ]
