const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "tdeditor.js",
    library: ["TDEditor"],
    libraryTarget: "umd",
    libraryExport: "default",
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/styles", to: "" },
      ],
    }),
  ],
};
