import { DeepPartial, DeepReadonly, Omit } from "ts-essentials";
import { EthereumProvider } from "web3x/providers";

import * as types from "./internal/core/params/argumentTypes";

// Begin config types

// IMPORTANT: This t.types MUST be kept in sync with the actual types.

interface CommonNetworkConfig {
  chainId?: number;
  from?: string;
  gas?: "auto" | number;
  gasPrice?: "auto" | number;
  gasMultiplier?: number;
}

interface BuidlerNetworkAccount {
  privateKey: string;
  balance: string;
}

export interface BuidlerNetworkConfig extends CommonNetworkConfig {
  accounts?: BuidlerNetworkAccount[];
  blockGasLimit?: number;
}

export interface HDAccountsConfig {
  mnemonic: string;
  initialIndex?: number;
  count?: number;
  path?: string;
}

export interface OtherAccountsConfig {
  type: string;
}

export type NetworkConfigAccounts =
  | "remote"
  | string[]
  | HDAccountsConfig
  | OtherAccountsConfig;

export interface HttpNetworkConfig extends CommonNetworkConfig {
  url?: string;
  accounts?: NetworkConfigAccounts;
}

export type NetworkConfig = BuidlerNetworkConfig | HttpNetworkConfig;

export interface Networks {
  [networkName: string]: NetworkConfig;
}

/**
 * The project paths:
 * * root: the project's root.
 * * configFile: the buidler's config filepath.
 * * cache: project's cache directory.
 * * artifacts: artifact's directory.
 * * sources: project's sources directory.
 * * tests: project's tests directory.
 */
export interface ProjectPaths {
  root: string;
  configFile: string;
  cache: string;
  artifacts: string;
  sources: string;
  tests: string;
}

type EVMVersion = string;

export interface SolcConfig {
  version: string;
  optimizer: SolcOptimizerConfig;
  evmVersion?: EVMVersion;
}

export interface SolcOptimizerConfig {
  enabled: boolean;
  runs: number;
}

export interface BuidlerConfig {
  defaultNetwork?: string;
  networks?: Networks;
  paths?: Omit<Partial<ProjectPaths>, "configFile">;
  solc?: DeepPartial<SolcConfig>;
  mocha?: Mocha.MochaOptions;
}

export interface ResolvedBuidlerConfig extends BuidlerConfig {
  defaultNetwork: string;
  paths: ProjectPaths;
  networks: Networks;
  solc: SolcConfig;
}

// End config types

export interface SolcInput {
  settings: {
    metadata: { useLiteralContent: boolean };
    optimizer: SolcOptimizerConfig;
    outputSelection: { "*": { "": string[]; "*": string[] } };
    evmVersion?: string;
  };
  sources: { [p: string]: { content: string } };
  language: string;
}

/**
 * A function that receives a BuidlerRuntimeEnvironment and
 * modify its properties or add new ones.
 */
export type EnvironmentExtender = (env: BuidlerRuntimeEnvironment) => void;

export type ConfigExtender = (
  config: ResolvedBuidlerConfig,
  userConfig: DeepReadonly<BuidlerConfig>
) => void;

export interface TasksMap {
  [name: string]: TaskDefinition;
}

export interface ConfigurableTaskDefinition {
  setDescription(description: string): this;

  setAction<ArgsT>(action: ActionType<ArgsT>): this;

  addParam<T>(
    name: string,
    description?: string,
    defaultValue?: T,
    type?: types.ArgumentType<T>,
    isOptional?: boolean
  ): this;

  addOptionalParam<T>(
    name: string,
    description?: string,
    defaultValue?: T,
    type?: types.ArgumentType<T>
  ): this;

  addPositionalParam<T>(
    name: string,
    description?: string,
    defaultValue?: T,
    type?: types.ArgumentType<T>,
    isOptional?: boolean
  ): this;

  addOptionalPositionalParam<T>(
    name: string,
    description?: string,
    defaultValue?: T,
    type?: types.ArgumentType<T>
  ): this;

  addVariadicPositionalParam<T>(
    name: string,
    description?: string,
    defaultValue?: T[],
    type?: types.ArgumentType<T>,
    isOptional?: boolean
  ): this;

  addOptionalVariadicPositionalParam<T>(
    name: string,
    description?: string,
    defaultValue?: T[],
    type?: types.ArgumentType<T>
  ): this;

  addFlag(name: string, description?: string): this;
}

export interface ParamDefinition<T> {
  name: string;
  defaultValue?: T;
  type: types.ArgumentType<T>;
  description?: string;
  isOptional: boolean;
  isFlag: boolean;
  isVariadic: boolean;
}

export interface OptionalParamDefinition<T> extends ParamDefinition<T> {
  defaultValue: T;
  isOptional: true;
}

export interface ParamDefinitionsMap {
  [paramName: string]: ParamDefinition<any>;
}

/**
 * Buidler arguments:
 * * network: the network to be used.
 * * showStackTraces: flag to show stack traces.
 * * version: flag to show buidler's version.
 * * help: flag to show buidler's help message.
 * * emoji:
 * * config: used to specify buidler's config file.
 */
export interface BuidlerArguments {
  network?: string;
  showStackTraces: boolean;
  version: boolean;
  help: boolean;
  emoji: boolean;
  config?: string;
}

export type BuidlerParamDefinitions = {
  [param in keyof Required<BuidlerArguments>]: OptionalParamDefinition<
    BuidlerArguments[param]
  >;
};

export interface TaskDefinition extends ConfigurableTaskDefinition {
  readonly name: string;
  readonly description?: string;
  readonly action: ActionType<TaskArguments>;
  readonly isInternal: boolean;

  // TODO: Rename this to something better. It doesn't include the positional
  // params, and that's not clear.
  readonly paramDefinitions: ParamDefinitionsMap;

  readonly positionalParamDefinitions: Array<ParamDefinition<any>>;
}

export interface TaskArguments {
  [argumentName: string]: any;
}

export type RunTaskFunction = (
  name: string,
  taskArguments?: TaskArguments
) => Promise<any>;

export type RunSuperFunction<ArgT extends TaskArguments> = (
  taskArguments?: ArgT
) => Promise<any>;

export type ActionType<ArgsT extends TaskArguments> = (
  taskArgs: ArgsT,
  env: BuidlerRuntimeEnvironment,
  runSuper: RunSuperFunction<ArgsT>
) => Promise<any>;

// TODO: This may not be the correct interface, see
// https://ethereum-magicians.org/t/eip-1193-ethereum-provider-javascript-api/640/31?u=alcuadrado
export type IEthereumProvider = EthereumProvider;

export interface Network {
  name: string;
  config: NetworkConfig;
  provider: IEthereumProvider;
}

export interface BuidlerRuntimeEnvironment {
  readonly config: ResolvedBuidlerConfig;
  readonly buidlerArguments: BuidlerArguments;
  readonly tasks: TasksMap;
  readonly run: RunTaskFunction;
  readonly network: Network;
  readonly ethereum: IEthereumProvider; // DEPRECATED: Use network.provider
}

/**
 * The artifact object.
 */
export interface Artifact {
  contractName: string;
  abi: any;
  bytecode: string;
  linkReferences: any;
}
