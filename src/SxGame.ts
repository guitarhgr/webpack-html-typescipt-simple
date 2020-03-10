// ======================== 导入
import * as THREE from 'three';
import jszip from 'jszip';

import TWEEN from './Tween';
import assetsData from './assets';
import Emitter from './Emitter';
import { OrbitControls } from './OrbitControls';
import Cache from './Cache';
import Canvas2D from './Canvas2D';


// ======================== 类型
/**
 * 状态
 */
const STAGE = {
    Idle: 0,
    Start: 1,
    Move: 2,
    End: 3,
    CheckOut: 4,
    CheckOutWait: 5,
    WaitPlay: 6
};

// ======================== 常量
/** 压缩实例 */
const JSZip = new jszip();
/**资源配置 */
const RES_CFG = [
    /**图片 */
    ['px', 'images/skybox_a01.png'],
    ['py', 'images/skybox_a01.png'],
    ['pz', 'images/skybox_a02.png'],
    ['nx', 'images/skybox_a01.png'],
    ['ny', 'images/skybox_a01.png'],
    ['nz', 'images/skybox_a01.png'],
    ['groundImg', 'images/caodi_a01_pro.png'],
    ['targetImg', 'images/target.png'],
    ['bowImg', 'images/img_bow_02.png'],
    ['adImg', 'images/ad.png'],
    ['jiaziImg', 'images/jiazi.png'],
    ['m15Img', 'images/15m.png'],
    ['bt1Img', 'images/bt_1.png'],
    ['bt2Img', 'images/bt_1.png'],
    ['bt3Img', 'images/bt_3.png'],
    ['bt4Img', 'images/bt_4.png'],
    ['bt5Img', 'images/bt_5.png'],
    ['zxImg', 'images/zx.png'],
    ['logoTargetImg', 'images/logo_target.png'],
    ['logoWordImg', 'images/logo_word.png'],
    ['logoBgImg', 'images/logo_bg.png'],
    ['logoArrowImg', 'images/logo_arrow.png'],
    ['logoImg', 'images/ui_start_logo_new.png'],
    // 成功图片
    ['arch4', 'images/arch4.png'],
    ['arch5', 'images/arch5.png'],
    ['arch6', 'images/arch6.png'],
    // 引导图片
    ['hander1Img', 'images/hander1.png'],
    ['hander2Img', 'images/hander2.png'],
    ['direcImg', 'images/direc.png'],
    ['sightImg', 'images/img_sight_03.jpeg'],
    ['jianImg', 'images/img_arrow_02.jpeg'],
    // 气球主题
    ['notice1', 'images/notice1.png'],
    ['toolbar', 'images/toolbar.png'],
    ['bt_5', 'images/bt_5.png'],
    ['qiqiu_red', 'images/qiqiu1.png'],
    ['qiqiu_green', 'images/qiqiu2.png'],

    /**模型json */
    ['sightJson', 'model/model_sight.json'],
    ['jianJson', 'model/model_arrow.json'],
    ['bowJson', 'model/model_bow.json'],

    /**音频 */
    ['pullBowAudio', 'video/pull.mp3'],
    ['perfectAudio', 'video/11.mp3'],
    ['ring09Audio', 'video/1_9_ring.mp3'],
    ['lostAudio', 'video/0.mp3'],
    ['successAudio', 'video/boom.mp3'],
    ['flyAudio', 'video/fly.mp3'],
    ['winAudio', 'video/win.mp3'],
    ['bgAudio', 'video/BG1.mp3'],
];

// ======================== 变量

// ======================== 类

/**
 * 游戏主逻辑
 */
class SxGame {
    // ===== 文件读取
    /** 总文件数 */
    filesNum = 0;              // 总文件数
    /** 文件对象集 */
    filesObj = {};             // 文件对象集
    /** 资源加载进度 */
    loadProcess = 0;           // 资源加载进度

    // ===== 相机模式
    /** 相机观察模式 0:游戏模式 / 1:调试模式 */
    cameraStyle: 0 | 1 = 0;    // 相机观察模式 0:游戏模式 / 1:调试模式
    
    // ===== 属性
    /** 弓箭移动速度 */
    arrowSpend = 0.8;          // 弓箭移动速度
    /** 箭靶的X距离 */
    distanceX = 0;             // 箭靶的X距离
    /** 箭靶的Y距离 */
    distanceY = 2;             // 箭靶的Y距离
    /** 箭靶的Z距离 */
    distanceZ = 20;            // 箭靶的Z距离
    /** 当前阶段 */
    stage = STAGE.WaitPlay;    // 当前阶段
    /** 第几次射击 */
    playCount = 0;             // 第几次射击
    /** 总箭数 */
    allCount = 5;              // 总箭数
    /** 箭靶移动速度 */
    targetSpeed = Math.PI / 2; // 箭靶移动速度
    /** 是否停止移动 */
    targetStop = false;        // 是否停止移动
    
    /** 气球缓存 */
    modelCache = { qiqiu0: new Cache(), qiqiu1: new Cache() } // 气球缓存
    /** canvas2D ui */
    canvas2D: Canvas2D = new Canvas2D(); // canvas2D ui

    // ===== 射击状态
    /** 射击的点 */
    targetPoint = new THREE.Vector3(0, 0, 0); // 射击的点
    /** 是否射中 */
    hited = false;             // 是否射中
    /** 得分  */
    getScore = 0;              // 得分
    /** 重试次数 */
    tryAgainTimes = 3;         // 重试次数
    /** 重试间隔id */
    retryIntervalId = null;

    // ===== 气球
    /** 气球列表 */
    qiqiuGroups = [];
    /** 消失气球列表 */
    deadGroups = [];
    /** X移动速度 */
    qiqiuSpeedX = [0.003, 0.004];  // X移动速度
    /** Y移动速度 */
    qiqiuSpeedY = [0.025, 0.03];   // Y移动速度
    /** 自转速度 */
    qiqiuRotation = [0.001, 0.002]; // 自转速度
    /** 最大显示数 */
    qiqiuMaxNum = 5;               // 最大显示数
    /** 风力刷新间隔计时器 */
    windTimer = Date.now();         // 风力刷新间隔计时器
    /** 气球样式 */
    qiqiuStyle = [
        {color: 'red', colorValue: 0xf14575, score: 50, scale: 0.5, distance: 0.2},
        {color: 'green', colorValue: 0x12ab6c, score: 25, scale: 1, distance: 0.4},
    ];
    /** 气球碎片 */
    pieces = [];
    /** 碎片组 */
    pieceGroup: THREE.Group = null;

    // ===== 发射器位置
    /** 发射器位置 */
    Launchers = [
        {speed: 5000, position: -1.8, timer: Date.now(), qiqiu: []},
        {speed: 5000, position: 1.5, timer: Date.now()-2000, qiqiu: []}
    ];

    // ===== 镜头相关
    /**垂直约束 */
    constrainVertical = true;
    /** 垂直最小值 */
    verticalMin = 0;
    /** 垂直最大值 */
    verticalMax = Math.PI;
    lookVertical = true;
    /** 视窗一半 X */
    viewHalfX = 0;
    /** 视窗一半 Y */
    viewHalfY = 0;
    /** 鼠标 X */
    mouseX = 0;
    /** 鼠标 Y */
    mouseY = 0;
    lookSpeed = 0.004;
    /** 边界 */
    lat = 0;
    /** 边界 */
    lon = 0;
    /** 窗口宽度 */
    windowWidth = 0;
    /** 窗口高度 */
    windowHeight = 0;

    // ===== 
    /** 渲染器 */
    renderer: THREE.WebGLRenderer = null;
    /** 场景 */
    scene: THREE.Scene = null;
    /** 透视相机 */
    camera: THREE.PerspectiveCamera = null;
    /** 观察相机 */
    OrbitCamera: THREE.PerspectiveCamera = null;
    /** 控制器 */
    controls: any = null;
    /** 帧循环间隔id */
    renderTimerID: any = null;
    /** 箭组 */
    bowGroup: THREE.Group = null;
    /**新手引导组 */
    leaderGroup: THREE.Group = null;
    /**游戏结束组 */
    gameOverGroup: THREE.Group = null;
    /** */
    mixer: any = null;
    /** 是否触碰 */
    touched: boolean;
    /** 偏移量 */
    offset: THREE.Vector2 = null;
    /** 目标点 */
    tp: THREE.Vector3 = null;
    /** 箭3d对象 */
    arrowObject: THREE.Object3D = null;
    /** */
    cameraSpend: number = 0;
    /** */
    dat: number = 0;
    /** */
    leaderLoopDat: number = 0;
    /** */
    ss: number = 0;
    /** */
    leaderLoop: boolean;
    /** */
    boomTimer: number = 0;

    constructor () {
        
    }

    /**
     * 资源准备
     */
    set = (key: string, value: any) => {
        this[key] = value;
    };

    /**
     * @1加载资源文件
     */
    start = () => {
        JSZip.loadAsync(assetsData, {base64: true})
        .then( (zip) => { // 过滤不要的连接
            zip.forEach( (path, zipEntry) => {
                if (path.indexOf('__MACOSX') !== -1 || zipEntry.dir === true) {
                    delete zip.files[path];
                }
            })
            this.filesNum = Object.keys(zip.files).length;
            return zip;
        })
        .then( (zip) => {
            zip.forEach( (path, zipEntry) => {
                zipEntry.async("base64")
                .then( (e) => {
                    this.filesObj[path] = e;
                    if (this.filesNum === Object.keys(this.filesObj).length) {
                        this.loadAssetsEnd(this.filesObj);
                    }
                });
            });
        });
    };

    // @1.1所有资源加载完成
    loadAssetsEnd = (filesObj: any) => {
        const suffixMapping = {
            jpeg: 'data:image/jpeg;base64,',
            png: 'data:image/png;base64,',
            json: 'data:application/json;base64,',
            mp3: 'data:audio/mp3;base64,'
        };

        for (let i = 0; i < RES_CFG.length; i++) {
            const [name, value] = RES_CFG[i];
            
            const suffixName = value.substr(value.lastIndexOf('.') + 1);

            this.set(name, suffixMapping[suffixName] + filesObj[value]);
        }
        
        // 资源加载完成，开始游戏
        this.startGame();
    };

    /**
     * @2开始
     */
    startGame = () => {
        this.initScene();
        this.initCamera();
        this.initResource();
        this.initRenderer();
        this.initCanvas2D();
        this.render();
        this.reset()
    };

    /**
     * 初始化资源
     */
    initResource = () => {
        this.initAudio();
        this.initSceneModel();
        this.initModel();
        this.initGameOver();
        this.initHanderModel();
        // this.initToolbar();
        this.initNotice();
        this.initTapButton();
    };

    /**
     * @3舞台
     */
    initScene = () => {
        this.initScreenSize();

        this.scene = new THREE.Scene();
        const boxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);

        // around
        const aroundTexture = new THREE.TextureLoader().load( (this as any).px );
        aroundTexture.wrapS = aroundTexture.wrapT = THREE.RepeatWrapping;
        aroundTexture.repeat.set(2, 2);
        // sky
        const skyTexture = new THREE.TextureLoader().load( (this as any).pz );
        skyTexture.wrapS = skyTexture.wrapT = THREE.RepeatWrapping;
        skyTexture.repeat.set(2, 2);
        const boxMaterials = [
            new THREE.MeshBasicMaterial({map: aroundTexture, color: 0xffffff, side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: aroundTexture, color: 0xffffff, side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: skyTexture, color: 0xffffff, side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: skyTexture, color: 0xffffff, side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: aroundTexture, color: 0xffffff, side: THREE.DoubleSide}),
            new THREE.MeshBasicMaterial({map: skyTexture, color: 0xffffff, side: THREE.DoubleSide})
        ];

        const skyBox = new THREE.Mesh(boxGeometry, boxMaterials);
        skyBox.position.set(0, -1, 200);
        this.scene.add(skyBox);
    };

    /**
     * 相机
     */
    initCamera = () => {
        this.camera = new THREE.PerspectiveCamera(35, this.windowWidth / this.windowHeight, 0.1, 1000);
        this.camera.position.set(0, this.distanceY, -2); // 相机初始位置
        this.scene.add(this.camera);

        // const helper = new THREE.CameraHelper(this.camera);
        // this.scene.add(helper);

        // 观察模式
        if (this.cameraStyle === 1) {
            this.OrbitCamera = new THREE.PerspectiveCamera(35, this.windowWidth / this.windowHeight, 0.1, 1000);
            this.OrbitCamera.position.set(0, this.distanceY, -10);
            this.scene.add(this.OrbitCamera);
        }
    };
 
    /**
     * @4.1 资源初始化-初始声音
     */
    initAudio = () => {
        const audioLoader = new THREE.AudioLoader();
        const listener = new THREE.AudioListener();
        
        this.camera.add(listener);
        
        // 背景音
        this.createOneAudio('bgSound',      (this as any).bgAudio,      listener, audioLoader, { isLoop: true });
        // 拉弓音
        this.createOneAudio('pullBowSound', (this as any).pullBowAudio, listener, audioLoader);
        // 中靶
        this.createOneAudio('successSound', (this as any).successAudio, listener, audioLoader);
        // 完美
        this.createOneAudio('perfectSound', (this as any).perfectAudio, listener, audioLoader);
        // 0-9
        this.createOneAudio('ring09Sound',  (this as any).ring09Audio,  listener, audioLoader);
        // 0分
        this.createOneAudio('lostSound',    (this as any).lostAudio,    listener, audioLoader);
        // 飞箭
        this.createOneAudio('flySound',     (this as any).flyAudio,     listener, audioLoader);
        // 胜利
        this.createOneAudio('winSound',     (this as any).winAudio,     listener, audioLoader);
    };

    /**
     * 创建单个音频
     */
    createOneAudio = (name: string, res: any, listener: THREE.AudioListener, audioLoader: THREE.AudioLoader, cfg: any = {}) => {
        this[name] = new THREE.Audio(listener);

        audioLoader.load(res, (buffer) => {
            this[name].setBuffer(buffer);
            this[name].setLoop(cfg.isLoop ? cfg.isLoop : false);
            this[name].setVolume(cfg.volume ? cfg.volume : 0.5);
        });
    };

    /**
     * @4.2 资源初始化-场景模型
     */
    initSceneModel = () => {
        // 地皮
        const groupGroup = new THREE.Group();
        const groundTexture = new THREE.TextureLoader().load( (this as any).groundImg );
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(200, 200);
        groundTexture.anisotropy = 10;
        const groundMaterial = new THREE.MeshBasicMaterial({map: groundTexture});
        const groundModel = new THREE.PlaneGeometry(1000, 1000, 8);
        const ground = new THREE.Mesh(groundModel, groundMaterial);
        ground.rotateX(-Math.PI / 2);
        ground.position.set(0, 0, 0);
        groupGroup.add(ground);

        // 标线
        const lineMaterial = new THREE.MeshBasicMaterial({color: 0xcac6c0, fog: true});
        const lineModel = new THREE.PlaneGeometry(0.2, 1000, 32);
        const line = new THREE.Mesh(lineModel, lineMaterial);
        line.rotateX(-Math.PI / 2);
        line.position.set(0, 0.01, 0);
        groupGroup.add(line);
        this.scene.add(groupGroup);

        // 周围AD牌
        const adGroup = new THREE.Group();
        const adTexture = new THREE.TextureLoader().load((this as any).adImg);
        adTexture.wrapS = adTexture.wrapT = THREE.RepeatWrapping;
        adTexture.repeat.set(2, 2);
        adTexture.anisotropy = 10;
        adTexture.minFilter = THREE.LinearFilter;
        const m3 = new THREE.MeshBasicMaterial({map: adTexture});
        const pg1 = new THREE.PlaneGeometry(60, 4, 8);
        const pg2 = new THREE.PlaneGeometry(160, 4, 8);
        const mp1 = new THREE.Mesh(pg1, m3);
        const mp3 = new THREE.Mesh(pg2, m3);
        const mp4 = new THREE.Mesh(pg2, m3);
        mp1.rotateY(Math.PI);
        mp1.position.set(0, 0, 80);
        mp3.rotateY(-Math.PI / 2);
        mp3.position.set(30, 0, 10);
        mp4.rotateY(Math.PI / 2);
        mp4.position.set(-30, 0, 10);
        adGroup.add(mp1);
        adGroup.add(mp3);
        adGroup.add(mp4);
        adGroup.position.set(0, 0, 0);
        this.scene.add(adGroup);

        // 发射器
        const jiaziTexture = new THREE.TextureLoader().load( (this as any).jiaziImg );
        jiaziTexture.minFilter = THREE.LinearFilter;
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 32, 1, true);
        const material = new THREE.MeshBasicMaterial( { map: jiaziTexture, side: THREE.DoubleSide } );
        const cylinder1 = new THREE.Mesh(geometry, material);
        cylinder1.position.set(this.Launchers[0].position, .4, 20);
        const cylinder2 = new THREE.Mesh(geometry, material);
        cylinder2.position.set(this.Launchers[1].position, .4, 20);
        cylinder1.name = 'jiazi1';
        cylinder1.name = 'jiazi2';
        this.scene.add(cylinder1);
        this.scene.add(cylinder2);
    };

    /**
     * @4.3 资源初始化-精灵模型
     */
    initModel = () => {
        const bowGroup = new THREE.Group();
        const objectLoader = new THREE.ObjectLoader();
        // 箭
        this.createOneJsonModel(bowGroup, (this as any).jianImg, (this as any).jianJson, objectLoader,  {
            scale: [0.06, 0.06, 0.06], pos: [0, 0, 0] , rotateY: Math.PI, name: 'Arrow' 
        }, THREE.LinearFilter, 'arrow');

        // 弓
        this.createOneJsonModel(bowGroup, (this as any).bowImg, (this as any).bowJson, objectLoader, {
            scale: [0.06, 0.06, 0.06], pos: [0.01, -0.07, -1.15], rotateX: -Math.PI / 2, rotateZ: Math.PI, name: 'Bow'
        });

        // 瞄准镜
        this.createOneJsonModel(bowGroup, (this as any).sightImg, (this as any).sightJson, objectLoader, {
            scale: [0.06, 0.06, 0.06], pos: [0.2430, 0.3026, 0.14], rotateX: Math.PI / 2, rotateY: Math.PI, name: 'Sight'
        });
        
        // 十字准心
        const targetTexture = new THREE.TextureLoader().load( (this as any).zxImg );
        targetTexture.minFilter = THREE.LinearFilter;
        const targetMaterial = new THREE.MeshBasicMaterial({map: targetTexture, transparent: true});
        const targetModel = new THREE.PlaneGeometry(1, 1, 8);
        const arrowTarget = new THREE.Mesh(targetModel, targetMaterial);
        arrowTarget.position.set(-0.1362, 0.2792, -0.653);
        arrowTarget.scale.set(0.12, 0.13, 0.12);
        arrowTarget.visible = true;
        bowGroup.add(arrowTarget);

        bowGroup.visible = true;
        this.bowGroup = bowGroup;
        this.camera.add(this.bowGroup);

        this.showBowGroup();
    };

    /**
     * 创建单个json模型
     */
    createOneJsonModel = (parent: THREE.Object3D, imgRes: any, jsonRes: any, objLoader: THREE.ObjectLoader,
        cfg: any, textureFilter?: THREE.TextureFilter, selfAttrName?: string) => {

        const texture = new THREE.TextureLoader().load(imgRes);
        texture.minFilter = textureFilter || THREE.LinearFilter;

        objLoader.load(jsonRes, (obj) => {
            obj.traverse( (child) => {
                if (child instanceof THREE.Mesh) {
                    (child.material as any).map = texture;
                }
            });

            cfg.scale !== undefined && obj.scale.set(cfg.scale[0], cfg.scale[1], cfg.scale[2]);
            cfg.pos !== undefined && obj.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
            cfg.rotateX !== undefined && obj.rotateX(cfg.rotateX);
            cfg.rotateY !== undefined && obj.rotateY(cfg.rotateY);
            cfg.rotateZ !== undefined && obj.rotateZ(cfg.rotateZ);
            cfg.name !== undefined && (obj.name = cfg.name);

            parent.add(obj);

            selfAttrName !== undefined && (this[selfAttrName] = obj);
        }); 
    };

    /**
     * @4.4 资源初始化-新手引导
     */
    initHanderModel = () => {
        const goGroup = new THREE.Group();
        // 小手1
        this.createOneSpriteModel(goGroup, (this as any).hander1Img, {
            pos: [0.25, 0, -0.2], scale: [0.6, 0.7, 0.7], visible: true, name: 'hander1Sprite'
        });
        // 小手2
        this.createOneSpriteModel(goGroup, (this as any).hander2Img, {
            pos: [0.25, 0, -0.2], scale: [0.6, 0.7, 0.7], visible: false, name: 'hander2Sprite'
        });
        // 方向
        this.createOneSpriteModel(goGroup, (this as any).direcImg, {
            pos: [0, 0.22, -0.201], visible: true, name: 'direcSprite'
        });

        goGroup.scale.set(0.1, 0.1, 0.1);
        goGroup.position.set(0, -0.1, -0.6);
        goGroup.visible = false;
        this.leaderGroup = goGroup;

        this.camera.add(goGroup);
    };

    // 创建单个图片模型
    createOneSpriteModel = (parent: THREE.Object3D, imgRes: any, cfg: any = {}, materialCfg?, selfAttrName?) => {
        
        const texture = new THREE.TextureLoader().load(imgRes);
        const material = new THREE.SpriteMaterial({
            map: texture,
            color: (materialCfg && materialCfg.color) || 0xffffff,
            fog: (materialCfg && materialCfg.fog) || true 
        });
        const sprite = new THREE.Sprite(material);

        
        cfg.pos !== undefined && sprite.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
        cfg.scale !== undefined && sprite.scale.set(cfg.scale[0], cfg.scale[1], cfg.scale[2]);
        cfg.visible !== undefined && (sprite.visible = cfg.visible);
        cfg.name !== undefined && (sprite.name = cfg.name);
        

        selfAttrName !== undefined && (this[selfAttrName] = sprite);

        parent.add(sprite); 
    };

    /**
     * @4.5 资源初始化-游戏结束播放的动画资源
     */
    initGameOver = () => {
        const goGroup = new THREE.Group();
        // 背景
        const bgMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0.8, color: 0x111111});
        const bgModel = new THREE.PlaneGeometry(100, 100, 8);
        const bgTarget = new THREE.Mesh(bgModel, bgMaterial);
        bgTarget.position.set(0, 0, -1);
        bgTarget.name = "background";
        bgTarget.visible = false;
        goGroup.add(bgTarget);

        // 靶子
        this.createOneSpriteModel(goGroup, (this as any).logoTargetImg, {
            pos: [-1, 0.1, -0.2], scale: [1.4, 1.4, 1.4], visible: false, name: 'logoTarget'
        });
        
        // 弓箭
        this.createOneSpriteModel(goGroup, (this as any).logoArrowImg, {
            pos: [20, 20, 0], visible: false, name: 'logoArrow'
        });
        
        // 文字
        this.createOneSpriteModel(goGroup, (this as any).logoWordImg, {
            pos: [0, 0.86, -0.1], scale: [1.6, 0.8, 0.8], visible: false, name: 'logoWord'
        });

        // 文字版
        this.createOneSpriteModel(goGroup, (this as any).logoBgImg, {
            pos: [0, 0.9, -0.3], scale: [1.8, 1, 1], visible: false, name: 'logoBg'
        });

        goGroup.scale.set(0.1, 0.1, 0.1);
        goGroup.position.set(0.05, 0.05, -1);
        goGroup.visible = false;
        this.gameOverGroup = goGroup;

        this.camera.add(goGroup);
    };

    /**
     * 5.0.1 成就展示
     */
    showArchIcon = () => {
        // 展示分数
        this.showText('gameoverPanel');

        // 展示成就图片
        let archIcon = null;
        if (this.getScore >= 200) {
            archIcon = (this as any).arch6;
        } else if (this.getScore >= 100 && this.getScore <200) {
            archIcon = (this as any).arch5;
        } else {
            archIcon = (this as any).arch4;
        }
        
        this.createOneSpriteModel(this.camera, archIcon, {
            pos: [0, 0.03, -0.3], scale: [0.05, 0.05, 0.05], visible: true, name: 'archIcon'
        }, undefined, 'archSp');
    };

    /**
     * 5.0.1 成就隐藏
     */
    hideArchIcon = () => {
        // 展示分数
        this.hideText();
        // 展示成就图片
        this.camera.remove( (this as any).archSp );
    };
 
    /**
     * @5.1 交互-tap
     */
    initTapButton = () => {
        const img = new Image();
        img.src = (this as any).bt5Img;
        img.id = "tapBtn";
        document.body.appendChild(img);

        const ele = document.getElementById('tapBtn');
        ele.addEventListener('click', (e) => {
            this.reBind();
            this.leaderGroup.visible = true;
            this.hideText();
            document.getElementById('tapBtn').style.display= 'none';
        });
    };

    /**
     * @5.2 提示框
     */
    initNotice = () => {
        const img = new Image();
        img.src = (this as any).notice1;
        img.id = 'notice1Text';
        document.body.appendChild(img);
    };

    /**
     * @5.3 状态栏
     */
    initToolbar = () => {
        const toolBarModule = document.getElementById('toolBarModule');
        // 背景
        const img = new Image();
        img.src = (this as any).toolbar;
        img.id = "toolbar";
        toolBarModule.appendChild(img);

        // 箭支数量框
        const div1 = document.createElement("div");
        div1.id = "toolbar_arrow";
        div1.innerText = (this.allCount - this.playCount) + '/' + this.allCount;
        toolBarModule.appendChild(div1);

        // 分数框
        const div2 = document.createElement("div");
        div2.id = "toolbar_score";
        div2.innerText = '0';
        toolBarModule.appendChild(div2);
    };

    /**
     * @5.2 交互-下载按钮2
     */
    initInstallButtonBig = () => {
        const img = new Image();
        img.src = (this as any).bt1Img;
        img.id = "downloadButtonBig";
        document.body.appendChild(img);

        const ele = document.getElementById('downloadButtonBig');
        ele.addEventListener('click', (e) => {
            Emitter.global.trigger('download');
        });
    };

    /**
     * @5.4 交互-马上安装
     */
    initInstallNowButton = () => {
        const img = new Image();
        img.src = (this as any).bt4Img;
        img.id = "installNow";
        document.body.appendChild(img);

        let ele = document.getElementById('installNow');
        ele.addEventListener('click', (e) => {
            Emitter.global.trigger('download');
        });

        const loopTimes = 5;  // 循环总次数
        let loopCount = 1;  
        let intervalId = setInterval( () => {
            if (loopCount >= loopTimes) {
                clearInterval(intervalId);
            }
            loopCount ++;
            const defaultSize = {height: ele.offsetHeight, width: ele.offsetWidth, left: ele.offsetLeft, top: ele.offsetTop};
            // 动画
            const curPos1 = {height:defaultSize.height, width:defaultSize.width, left:defaultSize.left, top:defaultSize.top};
            const scale = 1.2;
            const toPos1 = { height:(defaultSize.height/scale), width:(defaultSize.width/scale), left:(defaultSize.left + (defaultSize.width- defaultSize.width/scale)/2), top: (defaultSize.top + (defaultSize.height - defaultSize.height/scale)/2)};
            new TWEEN.Tween(curPos1)
                .to(toPos1, 120)
                .onUpdate( (e) => {
                    ele.style.height = curPos1.height + 'px';
                    ele.style.width = curPos1.width + 'px';
                    ele.style.left = curPos1.left + 'px';
                    ele.style.top = curPos1.top + 'px';
                })
                .onComplete( () => {
                    const curPos2 = toPos1
                    const toPos2 = { height:defaultSize.height, width:defaultSize.width, left:defaultSize.left, top:defaultSize.top };
                    new TWEEN.Tween(curPos2)
                        .to(toPos2, 120)
                        .onUpdate((e) => {
                            ele.style.height = curPos2.height + 'px';
                            ele.style.width = curPos2.width + 'px';
                            ele.style.left = curPos2.left + 'px';
                            ele.style.top = curPos2.top + 'px';
                        })
                        .onComplete(() => {
                            (ele as any).style = '';
                            TWEEN.removeAll();
                        })
                        .start();
                })
                .start();
        }, 1200);
    };

    /**
     * @5.5 交互-重试按钮
     */
    initReTryButton = () => {
        let ele = document.getElementById('retryButton');
        
        if (ele === null){
            const img = new Image();
            img.src = (this as any).bt3Img;
            img.id = "retryButton";
            document.body.appendChild(img);

            ele = document.getElementById('retryButton');
            ele.addEventListener('click', (e) => {
                Emitter.global.trigger('download');
                // // 初始界面
                // document.getElementById('toolBarModule').style.display = 'block';
                // ele.style.display = 'none';
                // // 重绑事件
                // self.reBind();
                // self.getScore = 0;
                // self.playCount = 0;
                // self.showText('scoreText');
                // self.targetStop = false;
                // self.gameOverGroup.visible = false;
                // for (const i in self.gameOverGroup.children) {
                //     self.gameOverGroup.children[i].visible = false;
                // }

                // if (self.retryIntervalId) {
                //     clearInterval(self.retryIntervalId);
                // }
            });
        }
        ele.style.display = 'block';

        const loopTimes = 5;  // 循环总次数
        let loopCount = 1;  
        this.retryIntervalId = setInterval( () => {
            if (loopCount >= loopTimes) {
                clearInterval(this.retryIntervalId);
            }
            loopCount ++;
            const defaultSize = {height: ele.offsetHeight, width: ele.offsetWidth, left: ele.offsetLeft, top: ele.offsetTop};
            // 动画
            const curPos1 = {height:defaultSize.height, width:defaultSize.width, left:defaultSize.left, top:defaultSize.top};
            const scale = 1.2;
            const toPos1 = { height:(defaultSize.height/scale), width:(defaultSize.width/scale), left:(defaultSize.left + (defaultSize.width- defaultSize.width/scale)/2), top: (defaultSize.top + (defaultSize.height - defaultSize.height/scale)/2)};

            new TWEEN.Tween(curPos1)
                .to(toPos1, 120)
                .onUpdate( (e) => {
                    ele.style.height = curPos1.height + 'px';
                    ele.style.width = curPos1.width + 'px';
                    ele.style.left = curPos1.left + 'px';
                    ele.style.top = curPos1.top + 'px';
                })
                .onComplete( () => {
                    const curPos2 = toPos1
                    const toPos2 = {height:defaultSize.height, width:defaultSize.width, left:defaultSize.left, top:defaultSize.top};
                    new TWEEN.Tween(curPos2)
                        .to(toPos2, 120)
                        .onUpdate( (e) => {
                            ele.style.height = curPos2.height + 'px';
                            ele.style.width = curPos2.width + 'px';
                            ele.style.left = curPos2.left + 'px';
                            ele.style.top = curPos2.top + 'px';
                        })
                        .onComplete( () => {
                            const display = ele.style.display;
                            (ele as any).style = 'display:'+display;

                            TWEEN.removeAll();
                        })
                        .start();
                })
                .start();
        }, 1200);
    };

    /**
     * @6 初始渲染
     */
    initRenderer = () => {
        // 渲染到视图
        const renderer = new THREE.WebGLRenderer();
        this.renderer = renderer;
        renderer.setSize(this.windowWidth, this.windowHeight);
        renderer.setPixelRatio(2);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.zIndex = '0';
        document.body.appendChild(renderer.domElement);

        // 相机处理
        const sp = new THREE.Vector3(0, this.distanceY, this.distanceZ);
        this.camera.lookAt(sp);
        this.stage = STAGE.Idle;
        // this.leaderGroup.visible = true;
        this.showText('notice1Text');

        // 事件
        // this.startEventHandler = this.touchStart.bind(this);
        // this.moveEventHandler = this.touchMove.bind(this);
        // this.endEventHandler = this.touchEnd.bind(this);

        // 观察模式
        if (this.cameraStyle === 1) {
            this.controls = new OrbitControls(this.OrbitCamera, this.renderer.domElement);
        } else {
            this.renderer.domElement.addEventListener('touchstart', this.touchStart, false);
            this.renderer.domElement.addEventListener('touchmove', this.touchMove, false);
            this.renderer.domElement.addEventListener('touchend', this.touchEnd, false);
        }
    };

    /**
     * 初始化canvas2d
     */
    initCanvas2D = () => {
        this.canvas2D.init(this.windowWidth, this.windowHeight);
        this.canvas2D.initRes([
            { name: 'toolbar', src: (this as any).toolbar, type: 'img' }
        ]);
        this.canvas2D.drawUI((this.allCount - this.playCount) + '/' + this.allCount, 0);
    };

    /**
     * @7.动画渲染 帧循环
     */
    render = () => {
        this.renderTimerID && cancelAnimationFrame(this.renderTimerID);

        
        let funFrame = () => {
            this.renderTimerID && cancelAnimationFrame(this.renderTimerID);

            this.update();
            TWEEN.update();

            // 观察模式
            if (this.cameraStyle === 1) {
                this.renderer.render(this.scene, this.OrbitCamera);
            } else {
                this.renderer.render(this.scene, this.camera);
            }
            if (this.mixer) this.mixer.update();

            this.renderTimerID = requestAnimationFrame(funFrame);
        }

        funFrame();
    };

    /**
     * @8.事件-重置
     */
    reset = () => {
        this.renderer.domElement.removeEventListener('touchstart', this.touchStart);
        this.renderer.domElement.removeEventListener('touchmove', this.touchMove);
        this.renderer.domElement.removeEventListener('touchend', this.touchEnd);
    };

    /**
     * 重新绑定
     */
    reBind = () => {
        // 事件
        // this.startEventHandler = this.touchStart.bind(this);
        // this.moveEventHandler = this.touchMove.bind(this);
        // this.endEventHandler = this.touchEnd.bind(this);
        // 观察模式
        if (this.cameraStyle === 1) {
            this.controls = new OrbitControls(this.OrbitCamera, this.renderer.domElement);
        } else {
            this.renderer.domElement.addEventListener('touchstart', this.touchStart, false);
            this.renderer.domElement.addEventListener('touchmove', this.touchMove, false);
            this.renderer.domElement.addEventListener('touchend', this.touchEnd, false);
        }
    };

    /**
     * @9.重置窗口
     */
    windowResize = () => {
        this.initScreenSize();

        this.viewHalfX = this.windowWidth / 2;
        this.viewHalfY = this.windowHeight / 2;
        this.camera.aspect = this.windowWidth / this.windowHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.windowWidth, this.windowHeight);
        this.canvas2D.setSize(this.windowWidth, this.windowHeight);
        this.canvas2D.drawUI((this.allCount - this.playCount) + '/' + this.allCount, this.getScore);
    };

    /**
     * @3.1屏幕尺寸
     */
    initScreenSize = (sizeObj?) => {
        const size = Emitter.global.trigger('getSceneSize')[0];

        this.windowWidth = size.width;
        this.windowHeight = size.height;
    };

    // ################################################ 游戏逻辑 ################################################
    /**
     * 按下
     */
    touchStart = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (this.stage !== STAGE.Idle) {
            return;
        }

        ( (this as any).bgSound as THREE.Audio).play();

        this.touched = true;

        const offset = new THREE.Vector2(0, 0); // 偏移量
        const origin = new THREE.Vector2(this.viewHalfX, this.viewHalfY); // 原点
        const curTouchPos = new THREE.Vector2(e.touches[0].pageX, e.touches[0].pageY); // 第一次点击的向量
        this.offset = offset.subVectors(curTouchPos, origin);

        TWEEN.removeAll(); // 去掉之前的动画
        this.animPullBow(); // 拉弓动画
    };

    /**
     * 移动
     */
    touchMove = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (this.stage !== STAGE.Move) {
            return
        }

        // 重新赋值
        this.mouseX = e.touches[0].pageX - this.viewHalfX - this.offset.x;
        this.mouseY = e.touches[0].pageY - this.viewHalfY - this.offset.y;
    };

    /**
     * 松开
     */
    touchEnd = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // 数据初始化
        // this.tempX = null;
        // this.tempY = null;
        this.touched = false;
        if (this.stage !== STAGE.Move) {
            return
        }
        // 停止箭靶
        this.targetStop = true;
        // 生成一个新的箭对象
        const arrowObject = ( (this as any).arrow as THREE.Object3D).clone(true);

        const worldRot = new THREE.Quaternion();
        ( (this as any).arrow as THREE.Object3D).getWorldQuaternion(worldRot);
        arrowObject.quaternion.set(worldRot.x, worldRot.y, worldRot.z, worldRot.w);

        const worldPos = new THREE.Vector3(0, 0, 0);
        ( (this as any).arrow as THREE.Object3D).getWorldPosition(worldPos);
        arrowObject.position.set(worldPos.x + 0.139, worldPos.y + 0.2795, worldPos.z);
        arrowObject.visible = true;
        arrowObject.name = 'cloneArrowObject' + this.playCount;

        this.arrowObject = arrowObject;
        this.scene.add(arrowObject);
        // 弓箭飞的声音
        ( (this as any).flySound as THREE.Audio).play();
        // 隐藏
        this.hideBowGroup(); // 收弓
        // this.checkPoint(); // 结算得分
        this.resetCameraPos();
        // 阶段改变
        this.stage = STAGE.End;
        // 显示第二个提示
        this.hideText();
    };

    /**
     * 暂停声音
     */
    pauseAudio = () => {
        ( (this as any).pullBowSound as THREE.Audio).pause();
        ( (this as any).successSound as THREE.Audio).pause();
        ( (this as any).perfectSound as THREE.Audio).pause();
        ( (this as any).ring09Sound as THREE.Audio).pause();
        ( (this as any).lostSound as THREE.Audio).pause();
        ( (this as any).flySound as THREE.Audio).pause();
        ( (this as any).winSound as THREE.Audio).pause();
        ( (this as any).bgSound as THREE.Audio).pause();
    };

    /**
     * 显示弓箭组
     */
    showBowGroup = () => {
        this.bowGroup.position.set(0, -0.5, -1.5);
        this.bowGroup.rotation.set(-0.5, 0, -.8);
    };

    /**
     * 隐藏弓箭组
     */
    hideBowGroup = () => {
        this.bowGroup.position.set(0, -200, 0);
    };

    /**
     * 显示文本
     */
    showText = (positionStr: string) => {
        switch (positionStr) {
            case 'gameoverPanel':
                let scorePercent = (this as any).score < 0 ? 0 : (this as any).score;
                scorePercent = scorePercent >= 99 ? 99 : scorePercent;
                document.getElementById('gameoverPanel').innerText = 'SCORE:' + this.getScore;
                document.getElementById('gameoverPanel').style.display = "block";
                break;

            case 'notice1Text':
                document.getElementById('notice1Text').style.display = "block";
                break;
                
            case 'scoreText':
                this.canvas2D.drawUI((this.allCount - this.playCount) + '/' + this.allCount, this.getScore);
                // document.getElementById('toolbar_arrow').innerText = (this.allCount - this.playCount) + '/' + this.allCount;
                // document.getElementById('toolbar_score').innerText = this.getScore;
                break;
        }
    };

    /**
     * 隐藏文本对象
     */
    hideText = () => {
        document.getElementById('scoreText').style.display = "none";
        document.getElementById('notice1Text').style.display = "none";
        document.getElementById('gameoverPanel').style.display = "none";
    };
 
    /**
     * 显示分数
     */
    showScoreModel = () => {
        this.showText('scoreText');

        if (this.hited) {
            ( (this as any).perfectSound as THREE.Audio).play(); // 完美声音
        } else {
            ( (this as any).lostSound as THREE.Audio).play(); // 脱靶
        }
    };

    /**
     * 隐藏分数
     */
    hideScoreModel = () => {
        this.hideText()
    };

    /**
     * 结算分数
     */
    checkPoint = () => {
        let px = this.distanceZ * this.tp.getComponent(0);
        let py = this.distanceZ * this.tp.getComponent(1);
        let pz = this.distanceZ * this.tp.getComponent(2);
        let rate: number;

        if (pz!==20) {
            rate = pz / 20;
            px = px / rate;
            py = py / rate;
            pz = 20;
        }
        this.targetPoint = new THREE.Vector3(px,py+this.distanceY,pz); // 射击目标点
        this.hited = false;

        const qiqiuGroups = this.qiqiuGroups;

        for (let x in qiqiuGroups) {
            const qiqiu = qiqiuGroups[x];
            if (qiqiu.distroyStatus === false) {
                const ballPos = qiqiu.children[0].getWorldPosition();
                const centerPoint = new THREE.Vector3(ballPos.x, ballPos.y, ballPos.z);
                const distance = this.targetPoint.distanceTo(centerPoint);

                if (distance < qiqiu.scoreDistance) {
                    this.hited = true;
                    qiqiu.distroyStatus = true;
                    // 得分累加
                    this.getScore = parseInt(`${this.getScore}`) + parseInt(qiqiu.score);
                }
            }
        }
    };

    // 重置相机位置
    resetCameraPos = () => {
        if (this.hited) {
            this.camera.position.x += this.tp.x > 0 ? 0.5 : -0.5;
            this.camera.position.y -= .5;
            this.camera.position.z -= 0.2;
            this.cameraSpend = this.arrowSpend * .8
        } else {
            this.camera.position.x += this.tp.x + 0.1 > 0 ? 0.2 : -0.2;
            this.camera.position.y += 0.8;
            this.camera.position.z -= 0.5;
            this.cameraSpend = this.arrowSpend * .6
        }
    };

    // 刷新
    update = () => {
        switch (this.stage) {
            case STAGE.Move: // [相机移动]
                this.cameraMove();
                this.tp = new THREE.Vector3(0, 0, 0);
                this.camera.getWorldDirection(this.tp); // 移动方向
                break;
            case STAGE.End: // [射击完成(射箭完结，鼠标松开)]
                if (this.arrowObject.position.z <= this.distanceZ+1) {
                    // 箭移动
                    this.animArrowFly();
                    // 相机跟随
                    this.camera.position.addScaledVector(this.tp, this.cameraSpend);
                    this.camera.lookAt(this.arrowObject.position);
                } else {
                    // this.targetPoint = new THREE.Vector3(this.arrowObject.position.x, this.arrowObject.position.y, this.arrowObject.position.z);
                    this.checkPoint();
                    this.stage = STAGE.CheckOut; // 结算
                }
                break;
            case STAGE.CheckOut: // [相机镜头动画播放]
                this.stage = STAGE.CheckOutWait;
                this.dat = Date.now();

                if (this.hited) {
                    ( (this as any).successSound as THREE.Audio).play(); // 中靶声音
                    this.scene.remove(this.arrowObject); // 清除scene对象

                    // 清除气球
                    this.qiqiuGroups.forEach( (target, i) => {
                        // 销毁
                        if (target.distroyStatus) {
                            const position = target.position;
                            this.qiqiuGroups.splice(i, 1);
                            this.destroyQiqiu(target);
                            this.createQiqiuBoom(position, target);
                        }
                    } );
                   
                    
                }
                this.animCheckOut();
                break;
            case STAGE.CheckOutWait: // [等待状态]
                // 如果没射中
                if (!this.hited) {
                    this.animArrowFly();
                }
                // 2秒后返回初始位置
                if (Date.now() - this.dat > 2000) {
                    this.stage = STAGE.WaitPlay;
                }
                break;
            case STAGE.Idle: // [待机状态]
                if (!this.leaderLoopDat) {
                    this.leaderLoopDat = Date.now();
                    return;
                } else {
                    if (Date.now() - this.leaderLoopDat > 500) {
                        if (this.playCount > 0) {
                            this.leaderGroup.visible = false;
                        } else {
                            this.leaderLoopDat = Date.now();
                            this.leaderLoop = this.leaderLoop ? false : true;
                            this.leaderGroup.getObjectByName('hander1Sprite').visible = this.leaderLoop;
                            this.leaderGroup.getObjectByName('hander2Sprite').visible = !this.leaderLoop;
                        }
                    }
                }
                break;
        }

        // 爆炸
        this.playQiqiuBoom();
        // 气球动画
        this.targetMove();
    };

    // 靶子移动动画
    targetMove = () => {
        if (this.targetStop) return;
        
        if (!this.windTimer) {
            this.windTimer = Date.now();
            return;
        }

        // 发射器
        this.LauncherManager();
        // 移动气球
        this.ss++;

        for (let i in this.qiqiuGroups) {
            const qiqiu = this.qiqiuGroups[i];
            // 自转&移动
            qiqiu.children[0].rotation.y += qiqiu.rotationSpend;
            qiqiu.position.x += qiqiu.spendX;
            qiqiu.position.y += qiqiu.spendY;
            // 销毁
            if (qiqiu.position.y > 15) {
                // console.log(this.qiqiuGroups.length,'==',i, this.ss);
                this.qiqiuGroups.splice(Number(i), 1);
                this.destroyQiqiu(qiqiu);
            }
        }
    };

    /**
     * 发射器(时间到了发射一个气球)
     */
    LauncherManager = () => {
        for (let x in this.Launchers) {
            const Launcher = this.Launchers[x];
            if (Date.now() - Launcher.timer > Launcher.speed || this.qiqiuGroups.length == 0) {
                const randInt = THREE.MathUtils.randInt(0, this.qiqiuStyle.length - 1);
                const qiqiu = this.createQiqiu(randInt);

                qiqiu.position.set(Launcher.position, 0, this.distanceZ);

                this.qiqiuGroups.push(qiqiu);
                this.scene.add(qiqiu);

                Launcher.timer = Date.now();
            }
        }
    };

    /**
     * 销毁气球
     */
    destroyQiqiu = (target: any) => {
        this.modelCache['qiqiu'+ target.index].add(target);
        this.scene.remove(target);
    };

    /**
     * 创建一个气球
     */
    createQiqiu = (index: number) => {
        let qiqiuGroup: any, attr: any;

        qiqiuGroup = this.modelCache['qiqiu'+ index].get();
        attr = this.qiqiuStyle[index]; // 获取要创建的球的属性

        if (!qiqiuGroup) {
            qiqiuGroup = new THREE.Group();

            qiqiuGroup.name = 'qiqiu';
            const qiqiuTexture = new THREE.TextureLoader().load(this['qiqiu_' + attr.color]);

            // 球
            const geometry0 = new THREE.SphereGeometry(0.4, 32, 32);
            const material0 = new THREE.MeshBasicMaterial({map: qiqiuTexture});
            const sphere = new THREE.Mesh(geometry0, material0);
            sphere.position.set(0, 0, 0);
            sphere.rotation.z = Math.PI / 8;
            qiqiuGroup.add(sphere);

            // 气球嘴
            const points = [];
            for (let i = 0; i < 10; i++) {
                points.push(new THREE.Vector2(Math.sin(i * 0.18) * 10 + 2, (i - 3) * 2));
            }
            const geometry1 = new THREE.LatheGeometry(points);
            const material1 = new THREE.MeshBasicMaterial({map: qiqiuTexture});
            const lathe = new THREE.Mesh(geometry1, material1);
            lathe.position.set(0.05, -0.4, 0);
            lathe.scale.set(0.01, 0.01, 0.01);
            lathe.rotation.x = Math.PI;
            lathe.rotation.z = -Math.PI / 15;
            qiqiuGroup.add(lathe);

            // 线
            const lineGeometry = new THREE.Geometry();
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0.05, -0.2, 0),
                new THREE.Vector3(0.075, -0.3, 0),
                new THREE.Vector3(0.12, -0.4, 0),
                new THREE.Vector3(0.25, -0.5, 0)
            ]);
            lineGeometry.vertices = curve.getPoints(10);
            lineGeometry.verticesNeedUpdate = true;
            (lineGeometry as any).dynamic = true;
            const material2 = new THREE.LineBasicMaterial({color: 0xffffff});
            const splineObject = new THREE.Line(lineGeometry, material2);
            splineObject.position.set(0, -0.3, 0);
            qiqiuGroup.add(splineObject);
            qiqiuGroup.scale.set(attr.scale, attr.scale, attr.scale);
        }

        // 结算属性
        qiqiuGroup.distroyStatus = false;
        qiqiuGroup.index = index;
        qiqiuGroup.score = attr.score;
        qiqiuGroup.scoreDistance = attr.distance;

        // 移动属性
        qiqiuGroup.spendX = THREE.MathUtils.randFloat(this.qiqiuSpeedX[0], this.qiqiuSpeedX[1]);
        qiqiuGroup.spendY = THREE.MathUtils.randFloat(this.qiqiuSpeedY[0], this.qiqiuSpeedY[1]);
        qiqiuGroup.rotationSpend = THREE.MathUtils.randFloat(this.qiqiuRotation[0], this.qiqiuRotation[1]);

        return qiqiuGroup;
    };

    /**
     * 气球爆炸特效
     */
    createQiqiuBoom = (position: THREE.Vector3, target: any) => {
        this.boomTimer = Date.now();
        this.pieces = [];
        this.pieceGroup = null;
        const pieceGroup = new THREE.Group();
        const color = this.qiqiuStyle[target.index].colorValue;
        const pieceGeo = new THREE.PlaneBufferGeometry(0.05, 0.05);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            side: THREE.DoubleSide,
        });
        const initPiece = new THREE.Mesh(pieceGeo, material);

        const pieceNum = 30;
        for (let w = 0; w < pieceNum; ++w) {
            const piece: any = initPiece.clone();
            piece.initPosition = {
                x: position.x,
                y: position.y,
                z: this.distanceZ
            };
            piece.position.set(piece.initPosition.x, piece.initPosition.y, piece.initPosition.z);

            piece.xMoveBias = THREE.MathUtils.randFloat(0.1, 0.3);            
            piece.yMoveBias = THREE.MathUtils.randFloat(0.1, 0.3);
            piece.zMoveBias = THREE.MathUtils.randFloat(0.1, 0.3);

            piece.xRotateDir = THREE.MathUtils.randInt(0, 1) < 1 ? -1 : 1;
            piece.yRotateDir = THREE.MathUtils.randInt(0, 1) < 1 ? -1 : 1;
            piece.zRotateDir = THREE.MathUtils.randInt(0, 1) < 1 ? -1 : 1;

            this.pieces.push(piece);
            pieceGroup.add(piece);
        }
        this.pieceGroup = pieceGroup;
        this.scene.add(pieceGroup);
    };

    /**
     * 爆炸效果
     */
    playQiqiuBoom = () => {
        const now = Date.now();

        if (this.pieces.length > 0 && (now - this.boomTimer > 300)) {
            this.pieces = [];
            this.scene.remove(this.pieceGroup);
        }

        if (!this.pieces.length) return;

        const moveSpeed = 1.2;
        const rotateSpeed = 0.12;
        this.pieces.forEach( (e, i) => {
            const divs = 5;
            const angleXZ = -45 + (90 * (i % divs) / (divs - 1));
            const angleY = -45 + (90 / (divs - 1) * Math.floor((i % Math.pow(divs,2)) / divs));
    
            e.position.x += moveSpeed * Math.sin(angleXZ * Math.PI / 180) * e.xMoveBias;
            e.position.y += moveSpeed * Math.sin(angleY * Math.PI / 180) * e.yMoveBias;
            e.position.z += 0.2;
    
            e.rotation.x += rotateSpeed * e.xRotateDir;
            e.rotation.y += rotateSpeed * e.yRotateDir;
            e.rotation.z += rotateSpeed * e.zRotateDir;
        });
    };

    /**
     * 相机移动
     */
    cameraMove = () => {
        const targetPosition = new THREE.Vector3();
        let verticalLookRatio = 1;
        if (this.constrainVertical) {
            verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
        }
        const actualLookSpeed = this.lookSpeed;
        this.lon -= this.mouseX * actualLookSpeed;
        if (this.lookVertical) {
            this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
        }
        this.lat = Math.max(-85, Math.min(85, this.lat));

        // 边界处理
        this.lat = this.lat > 14 ? 14 : this.lat;
        this.lat = this.lat < -14 ? -14 : this.lat;
        this.lon = this.lon > 20 ? 20 : this.lon;
        this.lon = this.lon < -20 ? -20 : this.lon;

        // 计算角度
        const theta = THREE.MathUtils.degToRad(this.lon);
        let phi = THREE.MathUtils.degToRad(90 - this.lat); // 角度转弧度
        if (this.constrainVertical) { //垂直约束
            phi = THREE.MathUtils.mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax); // 把 x 从范围 [a1, a2] 线性映射到 [b1, b2]。
        }
        targetPosition.setFromSphericalCoords(1, phi, theta).add(this.camera.position);
        this.camera.lookAt(targetPosition);
    };

    /**
     * 拉弓动画
     */
    animPullBow = () => {
        const ss = {x: 0, y: 0, z: 0};
        const mSeconds = 500;
        // 相机的焦点位置到靶子的动画
        const rotation = {x: -0.5, y: 0, z: -1};
        const pullTween1 = new TWEEN.Tween(rotation)
            .to(ss, mSeconds + 50)
            .onUpdate( () => {
                this.bowGroup.rotation.x = rotation.x;
                this.bowGroup.rotation.y = rotation.y;
                this.bowGroup.rotation.z = rotation.z;
                if (!this.touched) {
                    pullTween1.stop();
                    pullTween2.stop();
                    pullTween3.stop();
                }
            })
            .onStop( () => {
                TWEEN.removeAll();
                ( (this as any).pullBowSound as THREE.Audio).stop();
                this.animPushBow();
            })
            .onStart( () => {
                ( (this as any).pullBowSound as THREE.Audio).play();
            })
            .onComplete( () => {
                TWEEN.removeAll();
                this.stage = STAGE.Move;
                this.leaderGroup.visible = false;
            })
            .start();
        const curPos = {x: this.bowGroup.position.x, y: this.bowGroup.position.y, z: this.bowGroup.position.z}
        const toPos = {x: 0.137, y: -0.282, z: 0}
        const pullTween2 = new TWEEN.Tween(curPos)
            .to(toPos, mSeconds)
            .onUpdate( () => {
                this.bowGroup.position.x = curPos.x;
                this.bowGroup.position.y = curPos.y;
                this.bowGroup.position.z = curPos.z;
            })
            .start();
        const cmPos = {z: this.camera.position.z};
        const cmToPos = {z: 0};
        const pullTween3 = new TWEEN.Tween(cmPos)
            .to(cmToPos, mSeconds)
            .onUpdate( () => {
                this.camera.position.z = cmPos.z;
            })
            .start();
    };

    /**
     * 收弓动画
     */
    animPushBow = () => {
        const mSeconds = 500;
        // 相机的焦点位置到靶子的动画
        const ss = {x: -0.5, y: 0, z: -1};
        const rotation = {x: this.bowGroup.rotation.x, y: this.bowGroup.rotation.y, z: this.bowGroup.rotation.z};
        new TWEEN.Tween(rotation)
            .to(ss, mSeconds)
            .onUpdate( (e) => {
                this.bowGroup.rotation.x = rotation.x;
                this.bowGroup.rotation.y = rotation.y;
                this.bowGroup.rotation.z = rotation.z;
            })
            .onComplete( () => {
                TWEEN.removeAll();
                this.stage = STAGE.Idle;
            })
            .easing(TWEEN.Easing.Elastic.Out)
            .start();

        const curPos = {x: this.bowGroup.position.x, y: this.bowGroup.position.y, z: this.bowGroup.position.z}
        const toPos = {x: 0, y: -0.5, z: -1.5}
        new TWEEN.Tween(curPos)
            .to(toPos, mSeconds)
            .onUpdate( () => {
                this.bowGroup.position.x = curPos.x;
                this.bowGroup.position.y = curPos.y;
                this.bowGroup.position.z = curPos.z;
            })
            .start();
    };

    /**
     * 箭飞行动画
     */
    animArrowFly = () => {
        this.arrowObject.translateZ(this.arrowSpend);
        this.arrowObject.rotateZ(Math.PI / 10);
    };

    /**
     * 箭射击完成之后的转场动画
     */
    animCheckOut = () => {
        const mSeconds = 1200;
        this.playCount++;
        this.showText('scoreText');

        setTimeout( () => {
            this.targetStop = false;
            // self.hideScoreModel();
            this.WaitPlayIdle(1200)
        }, mSeconds)
    };

    /**
     * 镜头复原(当前点到初始点)
     */
    WaitPlayIdle = (second: number) => {
        const mSeconds = second; // 第二阶段动画时间
        // 当前位置移动到初始位置
        const position = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        new TWEEN.Tween(position)
            .to({x: 0, y: this.distanceY, z: -2}, mSeconds)
            .onUpdate( () => {
                this.camera.position.set(position.x, position.y, position.z)
            })
            .start();
        // 当前观测点到初始观察点
        const initPos = new THREE.Vector2(this.targetPoint.x, this.targetPoint.y + 1);
        new TWEEN.Tween(initPos)
            .to({x: 0, y: this.distanceY}, mSeconds)
            .onUpdate( () => {
                const sp = new THREE.Vector3(initPos.x, initPos.y, this.distanceZ);
                this.camera.lookAt(sp)
            })
            .onComplete( () => {
                this.lat = 0;
                this.lon = 0;
                this.showBowGroup()
                this.stage = STAGE.Idle
                this.hideText();
                if (this.playCount >= this.allCount) {
                    this.targetStop = true;
                    this.palyAnim()
                    return;
                } else {
                    TWEEN.removeAll();
                }
            })
            .start();
    };

    /**
     * 结束转场动画
     */
    palyAnim = () => {
        // 结算
        this.reset();
        this.canvas2D.clear();
        // document.getElementById('toolBarModule').style.display = 'none';
        this.gameOverGroup.visible = true;
        this.gameOverGroup.getObjectByName('background').visible = true

        this.showArchIcon(); // 展示成绩

        // 0
        const curPanel = { y: 3 };
        const toPanel = { y: 1 };
        const logoTarget = this.gameOverGroup.getObjectByName('logoTarget');
        let tween0 = new TWEEN.Tween(curPanel)
            .to(toPanel, 1500)
            .onUpdate((e) => {
            })
            .onComplete(() => {
                // 隐藏成绩
                this.hideArchIcon();
                // 当前位置移动到初始位置
                logoTarget.visible = true;
            })
            .start();

        // 1
        const curPos = { y: 3 };
        const toPos = { y: 1 };
        const logoWord = this.gameOverGroup.getObjectByName('logoWord');
        let tween1= new TWEEN.Tween(curPos)
            .to(toPos, 800)
            .onUpdate((e) => {
                logoTarget.position.y = curPos.y;
            })
            .onComplete(() => {
                this.gameOverGroup.getObjectByName('logoBg').visible = true
                logoWord.visible = true;
            })
            .easing(TWEEN.Easing.Elastic.Out);
        
        // 2
        const curPos2 = { x: -1 };
        const toPos2 = { x: 0 };
        const logoArrow = this.gameOverGroup.getObjectByName('logoArrow');
        let tween2 = new TWEEN.Tween(curPos2)
            .to(toPos2, 300)
            .onUpdate((e) => {
                logoWord.position.x = curPos2.x;
            })
            .onComplete(() => {
                logoArrow.visible = true;
            })
            .easing(TWEEN.Easing.Elastic.Out)
            
        // 3
        const curPos3 = { x: 2, y: 4 };
        const toPos3 = { x: -0.33, y: 1.58 };
        let tween3 = new TWEEN.Tween(curPos3)
            .to(toPos3, 200)
            .onUpdate((e) => {
                logoArrow.position.x = curPos3.x;
                logoArrow.position.y = curPos3.y;
            })
            .onComplete(() => {
                TWEEN.removeAll();
                if (this.getScore>= 75) {
                    this.initInstallNowButton();
                }else{
                    this.tryAgainTimes--;
                    if (this.tryAgainTimes <= 0) {
                        this.initInstallNowButton();
                    }else{
                        this.initReTryButton();

                        tween0 = undefined;
                        tween1 = undefined;
                        tween2 = undefined;
                        tween3 = undefined;
                    }
                }
                // GAME.END
                Emitter.global.trigger('gameOver');
            })

        tween0.chain(tween1);
        tween1.chain(tween2);
        tween2.chain(tween3);
    }
}

// ======================== 方法

// ======================== 立即执行
export default SxGame;
