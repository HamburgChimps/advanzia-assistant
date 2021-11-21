# Advanzia Assistant

A Chrome extension to enhance the Advanzia Bank Gebuehrenfrei Transaction UI using Rust and Typescript.

## Developer Documentation

In [./crate][0] you will find the Rust code that compiles to target [`wasm32-unknown-unknown`][1].

In [./extension][2] you will find the chrome extension that uses the wasm binary produced by the Rust code in [./crate][0].

[0]: <./crate>
[1]: <https://www.hellorust.com/setup/wasm-target/>
[2]: <./extension>
