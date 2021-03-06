#!/usr/bin/env bash -xe

rm -rf dist

cd crate
cargo build --target wasm32-unknown-unknown --release
wasm-gc target/wasm32-unknown-unknown/release/advanzia_assistant.wasm
mv target/wasm32-unknown-unknown/release/advanzia_assistant.wasm target/wasm32-unknown-unknown/release/advanzia-assistant.wasm
# Maybe enable this later
# cargo doc

cd ..

cd extension

rm -rf dist

npm run build

cd ..

mkdir dist

cp crate/target/wasm32-unknown-unknown/release/advanzia-assistant.wasm dist
cp extension/manifest.json dist
cp extension/dist/*.js dist
cp -r extension/_locales dist
