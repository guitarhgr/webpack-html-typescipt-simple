// ======================== 导入
import { Configuration } from 'webpack';
import merge from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserWebpackPlugin from 'terser-webpack-plugin';
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin';

import commonConfig from './webpack.common';

// ======================== 配置
const mergedConfig = merge(commonConfig, <Configuration>{
    mode: 'production',
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css',
            ignoreOrder: false,
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserWebpackPlugin({ extractComments: false }),
            new OptimizeCSSAssetsPlugin()
        ]
    }
});

const smp = new SpeedMeasurePlugin();
const prodConfig = smp.wrap(mergedConfig);

// ======================== 导出
export default prodConfig;
