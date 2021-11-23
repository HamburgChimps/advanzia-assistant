#!/usr/bin/env bash -xe

cd crate
cargo test

cd ..

cd extension
npm t
