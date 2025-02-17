import { assert } from "chai";
// tslint:disable-next-line no-implicit-dependencies
import { unlink, writeFile, writeJson } from "fs-extra";
import path from "path";

import { useEnvironment } from "./helpers";

export async function expectErrorAsync(
  f: () => Promise<any>,
  errorMessage?: string
) {
  try {
    await f();
  } catch (err) {
    assert.equal(err.message, errorMessage);
  }
}

describe("Solhint plugin", function() {
  const SOLHINT_CONFIG_FILENAME = ".solhint.json";

  describe("Project with solhint config", function() {
    useEnvironment(path.join(__dirname, "buidler-project"));

    it("should define solhint task", function() {
      assert.isDefined(this.env.tasks["buidler-solhint:run-solhint"]);
      assert.isDefined(this.env.tasks.check);
    });

    it("return a report", async function() {
      const reports = await this.env.run("buidler-solhint:run-solhint");
      assert.equal(reports.length, 1);
      assert.equal(reports[0].reports.length, 6);
    });
  });

  describe("Project with no solhint config", function() {
    useEnvironment(path.join(__dirname, "no-config-project"));

    it("return a report", async function() {
      const reports = await this.env.run("buidler-solhint:run-solhint");
      assert.equal(reports.length, 1);
      assert.equal(reports[0].reports[0].ruleId, "max-line-length");
    });
  });

  describe("Project with invalid solhint configs", function() {
    useEnvironment(path.join(__dirname, "invalid-config-project"));

    it("should throw when using invalid extensions", async function() {
      const invalidExtensionConfig = {
        extends: "invalid"
      };
      await writeJson(SOLHINT_CONFIG_FILENAME, invalidExtensionConfig);

      await expectErrorAsync(
        () => this.env.run("buidler-solhint:run-solhint"),
        "An error occurred when processing your solhint config."
      );
    });

    it("should throw when using invalid rules", async function() {
      const invalidRuleConfig = {
        rules: {
          "invalid-rule": false
        }
      };
      await writeJson(SOLHINT_CONFIG_FILENAME, invalidRuleConfig);

      await expectErrorAsync(
        () => this.env.run("buidler-solhint:run-solhint"),
        "An error occurred when processing your solhint config."
      );
    });

    it("should throw when using a non parsable config", async function() {
      const invalidConfig = "asd";
      await writeFile(SOLHINT_CONFIG_FILENAME, invalidConfig);
      await expectErrorAsync(
        () => this.env.run("buidler-solhint:run-solhint"),
        "An error occurred when loading your solhint config."
      );
    });

    after(async () => {
      await unlink(SOLHINT_CONFIG_FILENAME);
    });
  });
});
