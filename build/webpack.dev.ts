// ======================== 导入
import { Configuration, HotModuleReplacementPlugin, NamedChunksPlugin } from 'webpack';
import merge from 'webpack-merge';


import commonConfig from './webpack.common';
import { HOST, DEFAULT_PORT } from './constants';

// ======================== 配置
const devConfig = merge(commonConfig, <Configuration>{
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        compress: false,
        host: HOST,
        port: DEFAULT_PORT,
        historyApiFallback: true
    },
    plugins: [
        new HotModuleReplacementPlugin(),
        new NamedChunksPlugin()
    ]
});

// ======================== 导出
export default devConfig;
