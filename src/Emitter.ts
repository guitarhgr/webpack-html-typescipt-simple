// ======================== 导入

// ======================== 常量

// ======================== 变量

// ======================== 类
/**
 * @classdesc 发射器
 */
class Emitter {
    static global: Emitter;

    /**
     * 列表
     */
    private _mapList: Map<string, Function[]> = new Map();

    /**
     * 
     * @param key 
     * @param fn 
     */
    add (key: string, fn: Function): void {
        if (!this._mapList.get(key)) {
            this._mapList.set(key, []);
        }

        const fnList = this._mapList.get(key) as Function[];

        if (fnList.indexOf(fn) >= 0) return;

        fnList.push(fn);
    }

    /**
     * 
     */
    trigger (key: string, param?: any): any[] {
        const fnList = this._mapList.get(key);
        const result: any[] = [];

        if (!fnList) return result;

        for (let i = 0; i < fnList.length; i++) {
            result.push(fnList[i](param));
        }

        return result;
    }

    remove (key: string, fn: Function): void {
        const fnList = this._mapList.get(key);
        
        if (!fnList) return;

        const idx = fnList.indexOf(fn);

        if (idx >= 0) {
            fnList.splice(idx, 1);
        }
    }

}

// ======================== 方法

// ======================== 立即执行
Emitter.global = new Emitter();

export default Emitter;
