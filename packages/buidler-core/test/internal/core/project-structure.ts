import { assert } from "chai";
import * as fsExtra from "fs-extra";
import path from "path";

import { ERRORS } from "../../../src/internal/core/errors";
import {
  getRecommendedGitIgnore,
  getUserConfigPath,
  isCwdInsideProject
} from "../../../src/internal/core/project-structure";
import { expectBuidlerError } from "../../helpers/errors";
import { useFixtureProject } from "../../helpers/project";

describe("project structure", () => {
  describe("isCwdInsideProject", () => {
    it("should return false if cwd is not inside a project", () => {
      assert.isFalse(isCwdInsideProject());
    });

    describe("Inside a project", () => {
      useFixtureProject("default-config-project");

      it("should return true if cwd is the project's", () => {
        assert.isTrue(isCwdInsideProject());
      });

      it("should return true if cwd is deeper inside the project", () => {
        process.chdir("contracts");
        assert.isTrue(isCwdInsideProject());
      });
    });
  });

  describe("getUserConfigPath", () => {
    it("should throw if cwd is not inside a project", () => {
      expectBuidlerError(
        () => getUserConfigPath(),
        ERRORS.GENERAL.NOT_INSIDE_PROJECT
      );
    });

    describe("Inside a project", () => {
      useFixtureProject("default-config-project");
      let configPath: string;

      before("get root path", async () => {
        // TODO: This is no longer needed once PR #71 gets merged
        const pathToFixtureRoot = await fsExtra.realpath(
          path.join(
            __dirname,
            "..",
            "..",
            "fixture-projects",
            "default-config-project"
          )
        );

        configPath = await fsExtra.realpath(
          path.join(pathToFixtureRoot, "buidler.config.js")
        );
      });

      it("should work from the project root", () => {
        assert.equal(getUserConfigPath(), configPath);
      });

      it("should work from deeper inside the project", () => {
        process.chdir("contracts");
        assert.equal(getUserConfigPath(), configPath);
      });
    });
  });
});

describe("getRecommendedGitIgnore", () => {
  it("Should return the one from this repo", async () => {
    const content = await fsExtra.readFile(
      path.join(__dirname, "..", "..", "..", "recommended-gitignore.txt"),
      "utf-8"
    );

    assert.equal(await getRecommendedGitIgnore(), content);
  });
});
