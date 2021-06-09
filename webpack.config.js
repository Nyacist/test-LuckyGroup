const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
//const CopyWebpackPlugin = require('copy-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }
    return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
    const loaders = [MiniCssExtractPlugin.loader, 'css-loader']
    if (extra) {
        loaders.push(extra)
    }
    return loaders
}

const fs = require('fs')
// const PAGES_DIR = path.resolve(__dirname, 'src/pages/')
// const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'))

const pages = [];

fs
    .readdirSync(path.resolve(__dirname, 'src', 'pages'))
    .filter((file) => {
        return file.indexOf('base') !== 0;
    })
    .forEach((file) => {
        pages.push(file.split('/', 2));
    });

const htmlPlugins = pages.map(fileName => new HtmlWebpackPlugin({
    filename: `${fileName}.html`,
    template: `./pages/${fileName}/${fileName}.pug`,
    alwaysWriteToDisk: true,
    inject: 'body',
    hash: true,
}));


module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: ['@babel/polyfill', './index.js']
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    optimization: optimization(),
    devServer: {
        open: true,
        port: 4200
    },
    plugins: [
        //  ...PAGES.map(page => new HtmlWebpackPlugin({
        //      //template: `${PAGES_DIR}/${page.replace(/\.pug/, '')}/${page}`,
        //      template: `${PAGES_DIR}/${page}`,
        //      filename: isDev ? `./${page.replace(/\.pug/, '.html')}` : `./${page.replace(/\.pug/, '[hash].html')}`,
        //      minify: {
        //          collapseWhitespace: isProd
        //      }
        // })),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: filename('css')
        })
    ].concat(htmlPlugins),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.s[ac]ss$/,
                use:[
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader:'css-loader',
                        options:{sourceMap:true}
                    },
                    {
                        loader:'resolve-url-loader',
                        options:{sourceMap:true}
                    },
                    {
                        loader:'sass-loader',
                        options:{sourceMap:true}
                    }
                ]
            },
            {
                test: /\.(pug)$/,
                loader: 'pug-loader',
                options: {
                    pretty: true
                }
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'img/'
                }
            },
            {
                test: /\.(ttf|woff|svg|eot)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/'
                },
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
}