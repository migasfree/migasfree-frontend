module.exports = {
  input: {
    path: './src', // only files in this directory are considered for extraction
    include: ['**/*.js', '**/*.ts', '**/*.vue'], // glob patterns to select files for extraction
    exclude: [], // glob patterns to exclude files from extraction
  },
  output: {
    path: './src/i18n',
    potPath: './app.pot',
    jsonPath: './translations.json',
    locales: ['es_ES'],
    flat: true,
    linguas: false,
    splitJson: false, // create separate json files for each locale. If used, jsonPath must end with a directory, not a file
  },
}
