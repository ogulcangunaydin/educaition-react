/**
 * English Translation - Main Export
 *
 * Aggregates all English translation modules.
 */

import common from "./common";
import auth from "./auth";
import navigation from "./navigation";
import validation from "./validation";
import tests from "./tests";

const en = {
  ...common,
  ...auth,
  ...navigation,
  ...validation,
  ...tests,
};

export default en;
