# npm-size

[![NPM version](https://badgen.net/npm/v/npm-size)](https://npmjs.com/package/npm-size) [![NPM downloads](https://badgen.net/npm/dm/npm-size)](https://npmjs.com/package/npm-size) [![CircleCI](https://badgen.net/circleci/github/egoist/npm-size/master)](https://circleci.com/gh/egoist/npm-size/tree/master)

**Please consider [donating](https://www.patreon.com/egoist) to this project's author, [EGOIST](#author), to show your ❤️ and support.**

> Get the install size of an npm package.

## What is Install Size?

The "install size" is the size your hard drive will report after running `npm install`. This includes the package you installed, all of the dependencies, and its dependency's dependencies...and so on. —— Quoted from [Package Phobia](https://packagephobia.now.sh/), an online alternative to this package.

<img src="https://unpkg.com/@egoist/media/projects/npm-size/preview.svg" width="500" alt="preview">

## Install

```bash
npm i -g npm-size
```

## Usage

One-off usage via `npx`:

```bash
npm-size [...package names]

# Examples
npm-size webpack rollup
# Local package
npm-size ./my-package

# Exit with error when the size exceeds 5MB
npm-size ./ --limit 5mb

# Print sizes for the dependencies listed in a package.json
npm-size ./package.json ./packages/foo/package.json

# Print sizes for the dependencies of a package
npm-size chalk/package.json
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

**npm-size** © EGOIST, Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by EGOIST with help from contributors ([list](https://github.com/egoist/npm-size/contributors)).

> [egoist.sh](https://egoist.sh) · GitHub [@EGOIST](https://github.com/egoist) · Twitter [@\_egoistlily](https://twitter.com/_egoistlily)
