const path = require("path");
const NpmInstallPlugin = require("npm-install-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/scripts/main.js",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist")
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			minify: false,
			hash: true,
			title: "Particlez"
		}),
		new NpmInstallPlugin(),
		new UglifyJSPlugin()
	],
	devtool: "source-map"
};
