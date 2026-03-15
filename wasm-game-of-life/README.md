## Build and run

1. build the Rust project:

```bash
wasm-pack build
```

2. Build the web project (located in the `www` folder):

```bash
cd www
npm install
npm run build
```

This generates files in the `./www/dist` folder, which can then be hosted as static files in any suitable way. For local testing one can simply go to the folder and run `python -m http.server`.
