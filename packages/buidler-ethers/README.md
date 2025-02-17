[![npm](https://img.shields.io/npm/v/@nomiclabs/buidler-ethers.svg)](https://www.npmjs.com/package/@nomiclabs/buidler-ethers)

# buidler-ethers

[Buidler](http://getbuidler.com) plugin for integration with [ethers.js](https://github.com/ethers-io/ethers.js/).

## What

This plugin brings to Buidler the Ethereum library ethers.js, which allows you to interact with the Ethereum blockchain in a simple way.

## Installation

```bash
npm install @nomiclabs/buidler-ethers ethers@^4.0.23
```

And add the following statement to your `buidler.config.js`:

```js
usePlugin("@nomiclabs/buidler-ethers");
```

## Tasks

This plugin creates no additional tasks.

## Environment extensions

An initialized `ethers` object is injected into the environment:

```ts
ethers: {
  provider: JsonRpcProvider;
  getContract: (name: string) => Promise<ContractFactory>;
  signers: () => Promise<Signer[]>;
}
```

The `ContractFactory`s returned by `getContract` are connected by to the first signer returned by `env.ethers.signers`.

## Usage

There are no additional steps you need to take for this plugin to work.

Install it and access ethers through the Buidler Runtime Environment anywhere you need it (tasks, scripts, tests, etc). For example, in your `buidler.config.js`:

```js
usePlugin("@nomiclabs/buidler-ethers");

// task action function receives the Buidler Runtime Environment as second argument
task("blockNumber", "Prints the current block number", async (_, { ethers }) => {
  
  await ethers.provider.getBlockNumber().then((blockNumber) => {
    console.log("Current block number: " + blockNumber);
  });
  
});

module.exports = {};
```
And then run `npx buidler blockNumber` to try it.

Read the documentation on the [Buidler Runtime Environment](https://buidler.dev/documentation/#buidler-runtime-environment-bre) to learn how to access the BRE in different ways to use ethers.js from anywhere the BRE is accessible.
