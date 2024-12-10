module.exports = {
  // this will check Typescript files
  '**/*.(ts|tsx)': () => 'yarn tsc --noEmit',

  // This will lint TypeScript and JavaScript files
  '**/*.(js|jsx|ts|tsx|json)': (filenames) => [`yarn eslint --fix ${filenames.join(' ')}`],

  // This will format all files
  '**/*.(js|jsx|ts|tsx|html|scss|css|json|md)': (filenames) => [`yarn prettier --write ${filenames.join(' ')}`],

  // This will format translation files
  './public/locales/**/*.json': (filenames) => [
    `node --loader ts-node/esm scripts/json-formatter.mts --files ${filenames.join(' ')}`,
  ],
};
