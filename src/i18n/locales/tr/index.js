/**
 * Turkish Translation - Main Export
 *
 * Aggregates all Turkish translation modules.
 */

import common from "./common";
import auth from "./auth";
import navigation from "./navigation";
import validation from "./validation";
import tests from "./tests";

const tr = {
  ...common,
  ...auth,
  ...navigation,
  ...validation,
  ...tests,
};

export default tr;
