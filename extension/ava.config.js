module.exports = {
  files: ['*.spec.ts'],
  typescript: {
    rewritePaths: {
      './': 'transpiled/',
    },
    compile: 'tsc'
  }
};
