/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = (env, argv) => {
  const isProd = argv.mode === "production";

  return {
    mode: isProd ? "production" : "development",
    target: "web",
    entry: path.resolve(__dirname, "src/index.ts"),
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProd ? "js/[name].[contenthash:8].js" : "js/[name].js",
      chunkFilename: isProd ? "js/[name].[contenthash:8].js" : "js/[name].js",
      assetModuleFilename: "assets/[hash][ext][query]",
      publicPath: "/",
      clean: true
    },

    devtool: isProd ? "source-map" : "eval-cheap-module-source-map",

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@Engine2D": path.resolve(__dirname, "src/Engine2D"),
        "@foundation": path.resolve(__dirname, "src/foundation"),
      }
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true
              }
            }
          ]
        },
        {
          test: /\.css$/i,
          use: [
            isProd ? MiniCssExtractPlugin.loader : "style-loader",
            {
              loader: "css-loader",
              options: { importLoaders: 1, sourceMap: !isProd }
            }
          ]
        },
        // Если используете SASS, раскомментируйте:
        // {
        //   test: /\.(scss|sass)$/i,
        //   use: [
        //     isProd ? MiniCssExtractPlugin.loader : "style-loader",
        //     { loader: "css-loader", options: { sourceMap: !isProd } },
        //     { loader: "sass-loader", options: { sourceMap: !isProd } }
        //   ]
        // },
        {
          test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
          type: "asset",
          parser: { dataUrlCondition: { maxSize: 10 * 1024 } } // to 10kb in DataURL
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: "asset/resource"
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public/index.html")
      }),
      new ForkTsCheckerWebpackPlugin(),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProd),
        "process.env.NODE_ENV": JSON.stringify(argv.mode)
      }),
      isProd &&
        new MiniCssExtractPlugin({
          filename: "css/[name].[contenthash:8].css",
          chunkFilename: "css/[name].[contenthash:8].css"
        }),
      !isProd && new webpack.HotModuleReplacementPlugin()
    ].filter(Boolean),

    devServer: {
      static: { directory: path.resolve(__dirname, "public") },
      historyApiFallback: true, // SPA-роутинг
      open: true,
      hot: true,
      host: "localhost",
      port: 3000,
      compress: true,
      client: { overlay: { errors: true, warnings: false }, progress: true }
    },

    cache: {
      type: "filesystem",
      allowCollectingMemory: true
    },

    optimization: {
      splitChunks: isProd ? { chunks: "all" } : false,
      runtimeChunk: isProd ? "single" : false
    },

    performance: { hints: false }
  };
};
