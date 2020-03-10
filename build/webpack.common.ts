// ======================== 导入
import { resolve } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { Configuration } from 'webpack';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { Options as HtmlMinifierOptions } from 'html-minifier';
import CopyPlugin from 'copy-webpack-plugin';
import { loader as MiniCssExtractLoader } from 'mini-css-extract-plugin';
import WebpackBar from 'webpackbar';
import CircularDependencyPlugin from 'circular-dependency-plugin';

import { PROJECT_ROOT, IS_DEV } from './constants';

// ======================== 配置
// index.html 压缩选项
const htmlMinifyOptions: HtmlMinifierOptions = {
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    minifyURLs: true,
    useShortDoctype: true,
};

const commonConfig: Configuration = <Configuration> {
    entry: './src/index.ts',
    output: {
        path: resolve(PROJECT_ROOT, './dist'),
        filename: '[name].[hash].js'
    },
    resolve: {
        extensions: ['.ts','tsx','.js']
    },
    //这里可以配置一些对指定文件的处理
    //这里匹配后缀为ts或者tsx的文件
    //使用exclude来排除一些文件
    module:{
        rules:[
            {
                test: /\.css$/,
                use: [
                    IS_DEV ? 'style-loader' : MiniCssExtractLoader,
                    // 'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                path: resolve(PROJECT_ROOT, './build/postcss.config.js')
                            }
                        }
                    }
                ],
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            // 低于 10 k 转换成 base64
                            limit: 10 * 1024,
                            // 在文件名中插入文件内容 hash，解决强缓存立即更新的问题
                            name: '[name].[hash].[ext]',
                            outputPath: 'images',
                        },
                    },
                ],
            },
            {
                test:/\.tsx?$/,
                use: ['babel-loader'],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        // 错误提示
        new FriendlyErrorsWebpackPlugin(),
        // 清除之前的打包文件
        new CleanWebpackPlugin({
            // cleanOnceBeforeBuildPatterns: ['./dist']
        }),
        // 进度条
        new WebpackBar({
            name: 'ad-typescript',
            color: '#edde8b'
        }),
        // 循环依赖提示
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: PROJECT_ROOT,
        }),
        // 生成新的html
        new HtmlWebpackPlugin({
            // 只有生产环境压缩
            minify: IS_DEV ? false : htmlMinifyOptions,
            // 模版
            template: resolve(PROJECT_ROOT, `./src/template/index_${IS_DEV ? 'dev' : 'prod'}.html`),
            // 生产环境不插入css和js 改用内嵌(项目特殊需求)
            inject: IS_DEV ? true : false,
            // 参数处理方法
            templateParameters: (...args: any[]) => {
                const [ compilation, assets, assetTags, options ] = args;

                return {
                    title: 'test',
                    compilation,
                    htmlWebpackPlugin: {
                        files: assets
                    }
                }
            }
        }),
        // 复制资源
        new CopyPlugin(
            [
                {
                    from: '*',
                    to: resolve(PROJECT_ROOT, './dist'),
                    toType: 'dir',
                    ignore: ['index.html'],
                },
            ],
            { context: resolve(PROJECT_ROOT, './public') },
        ),
    ]
};

// ======================== 导出
export default commonConfig;
