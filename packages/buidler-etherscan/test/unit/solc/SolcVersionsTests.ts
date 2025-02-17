import { BuidlerPluginError } from "@nomiclabs/buidler/plugins";
import { assert } from "chai";
// tslint:disable: no-implicit-dependencies
import unmock from "unmock-node";

import { getLongVersion } from "../../../src/solc/SolcVersions";

let state: any = null;
beforeEach(() => {
  state = unmock.on();
})

afterEach(() => {
  unmock.off();
})

const SOLC_BIN_PATH = "/ethereum/solc-bin/gh-pages/bin/list.json"

describe("SolcVersions tests", () => {
  it("verify full solc version is returned", async () => {
    state.github(SOLC_BIN_PATH, {
      $code: 200,
      releases: { 
        "0.5.1": "soljson-v0.5.1-commitsomething.js"
      }
    });

    const fullVersion = await getLongVersion("0.5.1");
    assert.equal(fullVersion, "v0.5.1-commitsomething");
  });

  it("verify exception is throw if there was ean error sending request", async () => {
    state.github(SOLC_BIN_PATH, {
      $code: 404
    });

    getLongVersion("0.5.1").catch(e =>
      assert.isTrue(e instanceof BuidlerPluginError)
    );
  });

  it("verify exception is throw if there isn't specified version", async () => {
    state.github(SOLC_BIN_PATH, {
      $code: 200,
      releases: { 
        "0.5.2": "soljson-v0.5.2-commitsomething.js"
      }
    });

    return getLongVersion("0.5.1")
      .then(() => {
        assert.fail();
      })
      .catch(e => {
        assert.isTrue(e instanceof BuidlerPluginError);
      });
  });
});
