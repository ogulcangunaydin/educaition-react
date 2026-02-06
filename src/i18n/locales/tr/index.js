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
import dashboard from "./dashboard";

const tr = {
  ...common,
  ...auth,
  ...navigation,
  ...validation,
  ...tests,
  ...dashboard,
};

export default tr;
