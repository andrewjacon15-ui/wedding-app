# Vendored image-moderation model

Self-hosted so the photo check keeps working with no third-party dependency.

- `nsfwjs.min.js`: [NSFW.js](https://github.com/infinitered/nsfwjs) 4.4.0 browser build (MIT, includes TensorFlow.js, Apache-2.0).
- `model/`: NSFW.js MobileNetV2 model (MIT) from the same project.

It runs entirely on the guest's phone; images are never sent to a moderation server.
