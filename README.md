# Advanzia Assistant

A Chrome extension to enhance the Advanzia Bank Gebuehrenfrei Transaction UI using Rust and Typescript.

## Developer Documentation

In [./crate][0] you will find the Rust code that compiles to target [`wasm32-unknown-unknown`][1].

In [./extension][2] you will find the chrome extension code that uses the wasm binary produced by the Rust code in [./crate][0].

The compiled wasm binary and the relevant parts of [./extension][2] are packed in a `dist` directory in the root of the repository when you execute [`build.sh`][3]. This dist directory is the artifact that will be uploaded to the Chrome Web Store and which you can load as an unpacked extension into your local Chrome.

### Build and test the extension locally

1. Ensure you have rust and cargo installed.
2. Ensure you have node and npm installed.
3. Checkout this repository
4. `cd extension/ && npm i`
5. `cd .. && ./build.sh`
6. Load the `dist` directory that is now present in the repository root into Chrome as an unpacked extension.

[0]: <./crate>
[1]: <https://www.hellorust.com/setup/wasm-target/>
[2]: <./extension>
[3]: <./build.sh>
