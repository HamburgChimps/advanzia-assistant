#!/usr/bin/env bash -x

cd crate
cargo test

cd ..

cd extension
npm t
