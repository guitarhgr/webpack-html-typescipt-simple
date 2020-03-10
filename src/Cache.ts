// ======================== 导入

// ======================== 常量

// ======================== 变量

// ======================== 类
/**
 * 缓存
 * @classdesc 用于缓存
 */
export default class Cache {
    /**
     * 列表
     */
    private _list = [];

    /**
     * 添加
     * @param data 数据
     */
    add(data: any) {
        this._list.push(data);
    }

    /**
     * 获取
     */
    get(): any {
        return this._list.shift();
    }

    /**
     * 获取缓存大小
     */
    size(): number {
        return this._list.length;
    }
}

// ======================== 方法

// ======================== 立即执行