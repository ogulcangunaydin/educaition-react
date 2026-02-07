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
import questions from "./questions";
import dashboard from "./dashboard";
import users from "./users";

const tr = {
  ...common,
  ...auth,
  ...navigation,
  ...validation,
  ...tests,
  ...questions,
  ...dashboard,
  ...users,
};

export default tr;
