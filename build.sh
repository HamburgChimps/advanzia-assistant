#!/usr/bin/env bash -x

rm -rf dist

cd crate
cargo build --target wasm32-unknown-unknown --release
wasm-gc target/wasm32-unknown-unknown/release/advanzia_assistant.wasm
mv target/wasm32-unknown-unknown/release/advanzia_assistant.wasm target/wasm32-unknown-unknown/release/extension.wasm
# Maybe enable this later
# cargo doc

cd ..

cd extension

rm -rf transpiled

npm run build

# remove transpiled test files -> they are needed to run ava so we have typescript transpile them but they are not needed
# to actually run the extension
rm transpiled/*.spec.js

cd ..

mkdir dist

cp crate/target/wasm32-unknown-unknown/release/extension.wasm dist
cp extension/manifest.json dist
cp extension/transpiled/*.js dist
cp -r extension/_locales dist
