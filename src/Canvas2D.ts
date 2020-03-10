// ======================== 导入

// ======================== 常量

// ======================== 变量

// ======================== 类
/**
 * canvas2D ui
 * @TODO 这个只是一个方法集合 不能复用 不能称之为类
 */
export default class Canvas2D {
    /**设计宽度 */
    DESIGN_W = 540;
    /**设计高度 */
    DESIGN_H = 960;
    /**资源类型 */
    ERes = { img: 'img' };

    /**dom节点 */
    canvasDom: HTMLCanvasElement = null;
    /**渲染上下文 */
    ctx: CanvasRenderingContext2D = null;
    /**总资源数 */
    totalResCount: number = 0;
    /**已加载 */
    loadedResCount: number = 0;
    /**资源组 */
    resGroup: any = {};
    /**游戏是否结束 */
    isGameOver: boolean = false;

    constructor () {
        
    }

    /**
     * 初始化
     */
    init = (width: number, height: number) => {
        this.canvasDom = this.canvasDom || document.createElement('canvas');
        this.canvasDom.id = 'canvas2D';
        this.canvasDom.width = this.DESIGN_W;
        this.canvasDom.height = this.DESIGN_H;

        this.ctx = this.ctx || this.canvasDom.getContext('2d');
        this.isGameOver = false;

        document.body.appendChild(this.canvasDom);

        this.setSize(width, height);
    }

    /**
     * 设置大小
     * @param width 宽度
     * @param height 高度
     */
    setSize = (width: number, height: number) => {
        if (width > height) {
            this.canvasDom.width = this.DESIGN_H;
            this.canvasDom.height = this.DESIGN_W;
        } else {
            this.canvasDom.width = this.DESIGN_W;
            this.canvasDom.height = this.DESIGN_H;
        }

        (this.canvasDom as any).style = 'position: absolute; z-index: 1; pointer-events: none; transform-origin: left top; width: '+ width + 'px;';        
    }

    /**
     * 初始化资源
     * @param resArr
     */
    initRes = (resArr: any[]) => {
        this.totalResCount += resArr.length;

        for (let i = 0; i < resArr.length; i++) {
            const res = resArr[i];
            const type = res.type;

            switch (type) {
                case this.ERes.img:
                    this.handleImg(res);
            }
        }
    }

    /**
     * 处理图片
     * @param res
     */
    handleImg = (res: any) => {
        const obj = new Image();

        obj.src = res.src;
        obj.onload = () => {
            this.loadedResCount++;
        }

        this.resGroup[res.name] = obj;
    } 

    /**
     * 绘制ui
     */
    drawUI = (countStr: string, score: number) => {
        if (this.isGameOver) return;

        let timer: any;

        let fun = () => {
            timer && clearTimeout(timer);
            if (this.totalResCount != 0 && this.totalResCount === this.loadedResCount) {
                
                this.ctx.clearRect(0, 0, this.DESIGN_W, this.DESIGN_H);

                this.drawBg();
                this.drawCountAndScore(countStr, score);

                fun = undefined;
            } else {
                timer = setTimeout(fun, 16);
            }
        }

        fun();
    }

    /**
     * 绘制背景
     */
    drawBg = () => {
        this.ctx.drawImage(this.resGroup['toolbar'], 0, 0, 430, 90);
    }

    /**
     * 绘制数量和分数
     */
    drawCountAndScore = (countStr: string, score: number) => {
        const ctx = this.ctx;

        ctx.font = '24px "SegoeBIT"';
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillText('' + (countStr || 0/5), 213, 52);

        ctx.fillStyle = 'rgb(28, 169, 245)';
        ctx.fillText('' + (score || 0), 355, 52);
    }

    /**
     * 清除
     */
    clear = () => {
        this.ctx.clearRect(0, 0, this.DESIGN_W, this.DESIGN_H);
        this.isGameOver = true;
    }
}

// ======================== 方法

// ======================== 立即执行
