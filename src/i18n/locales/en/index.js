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
import dashboard from "./dashboard";
import users from "./users";

const en = {
  ...common,
  ...auth,
  ...navigation,
  ...validation,
  ...tests,
  ...dashboard,
  ...users,
};

export default en;
