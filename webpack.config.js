const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "tdeditor.js",
    library: ["TDEditor"],
    libraryTarget: "umd",
    libraryExport: "default",
  },
};
