# Changelog

## 1.0.1

- Fixed `require()` failing with `ERR_PACKAGE_PATH_NOT_EXPORTED`: the exports map only had an `import` condition. It now uses `default`, so CommonJS callers on Node 20.19+ / 22.12+ can `require()` the package. ESM imports are unchanged.
- Exposed `./package.json` in the exports map.

## 1.0.0

- Initial release.
