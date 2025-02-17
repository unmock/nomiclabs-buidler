import { DEFAULT_GAS_MULTIPLIER } from "./constants";
import { Linker, TruffleContract } from "./types";

export class LazyTruffleContractProvisioner {
  private readonly _web3: any;
  private readonly _gasMultiplier?: number;

  constructor(web3: any, gasMultiplier?: number) {
    this._web3 = web3;
    this._gasMultiplier =
      gasMultiplier !== undefined ? gasMultiplier : DEFAULT_GAS_MULTIPLIER;
  }

  public provision(Contract: TruffleContract, linker: Linker) {
    Contract.setProvider(this._web3.currentProvider);

    Contract.gasMultiplier = this._gasMultiplier;

    const originalLink = Contract.link;
    Contract.link = (...args: any[]) => {
      // This is a simple way to detect if it is being called with a contract as first argument.
      if (Array.isArray(args[0].abi)) {
        return linker.link(Contract, args[0]);
      }

      // TODO: This may break if called manually with (name, address), as solc changed
      // the format of its symbols.

      originalLink.apply(Contract, args);
    };

    this._hookCloneCalls(Contract, linker);

    return Contract;
  }

  private _hookCloneCalls(Contract: TruffleContract, linker: Linker) {
    const originalClone = Contract.clone;

    Contract.clone = (...args: any[]) => {
      const cloned = originalClone.apply(Contract, args);

      return this.provision(cloned, linker);
    };
  }
}
