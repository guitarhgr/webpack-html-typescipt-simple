module.exports = {
    plugins: [
        // 修复一些 flex 的 bug
        require('postcss-flexbugs-fixes'),
        // 支持一些现代浏览器 CSS 特性，支持 browserslist
        require('postcss-preset-env')({
            // 自动添加浏览器头
            autoprefixer: {},
            stage: 3,
        })
    ],
};