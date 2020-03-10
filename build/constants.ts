// ======================== 导入
import path from 'path';

// ======================== 常量
const IS_DEV = process.env.NODE_ENV === 'development';
const HOST = '127.0.0.1';
const DEFAULT_PORT = 3000;
const PROJECT_ROOT = path.resolve(__dirname, '../');
const PROJECT_NAME = path.parse(PROJECT_ROOT).name;

// ======================== 导出
export {
    IS_DEV,
    HOST,
    DEFAULT_PORT,
    PROJECT_ROOT,
    PROJECT_NAME
};


