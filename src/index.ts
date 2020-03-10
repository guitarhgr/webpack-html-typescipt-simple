// ======================== 导入
import Emitter from './Emitter';
import SxGame from './SxGame';
import { WEBGL } from './WebGL';
import './style.css';

// ======================== 类型
type Platform = 'mraid' | 'mintegral' | 'ironSource' | 'facebook' | 'dev';
// enum EPlatform {
// 	MRAID = 'mraid',
// 	MINTEGRAL = 'mintegral',
// 	IRONSOURCE = 'ironSource',
// 	DEV = 'dev',
// }


// ======================== 常量
/** 调试 */
const DEBUG: boolean = true;
/** platform type, the ad's Adaptation will use this key */
const PLATFORM: Platform = 'dev';


// ======================== 变量
/**
 * game object
 */
let Game: SxGame = null;

// ======================== 类


// ======================== 方法
/**
 * startGame function, when platform ready, call this
 */
const startGame = () => {
	if(Game !== null) return;
	
	if (WEBGL.isWebGLAvailable() === false) {
		document.body.appendChild(WEBGL.getWebGLErrorMessage());
	}
	
	Game = new SxGame();
	// console.log(Game);
	Game.start();
	
	// dwonload way
	switch (<Platform>PLATFORM){
		case 'mraid': // unity/applovin 
			window.addEventListener('resize', onSceneResize);
			break;
		case 'mintegral':
			window.addEventListener('resize', onSceneResize);
			break;
		case 'ironSource':
			window['dapi'].addEventListener('adResized', onSceneResize);
			break;
		case 'facebook':
			window.addEventListener('resize', onSceneResize);
			break;
		case 'dev':
			window.addEventListener('resize', onSceneResize);
			break;
	}
    
};

/**
 * download function, when click download(install), call this
 */
const download = () => {
	const userAgent = navigator.userAgent || navigator.vendor;
	let storeUrl = 'https://apps.apple.com/cn/app/archery-elite/id1340807472?l=zh&ls=1';
	
    if(/android/i.test(userAgent)){
        storeUrl = 'https://play.google.com/store/apps/details?id=archery.elite.shooting.free.game.android';
	}
	
    // dwonload way
	switch (<Platform>PLATFORM) {
		case 'mraid': // unity/applovin 
        	window['mraid'].open(storeUrl);
			break;
		case 'mintegral':
			window['install'] && window['install']();
			break;
		case 'ironSource':
			window['dapi'].openStoreUrl(storeUrl);
			break;
		case 'facebook':
			window['FbPlayableAd'].onCTAClick();
			break;
		case 'dev':
			alert('download success');
			break;
	}
};

/**
 * get screen size, for init scene
 */
const getSceneSize = () => {
	let size = { width: 0, height: 0 };

	switch (<Platform>PLATFORM) {
		case 'mraid':
			size = window['mraid'].getScreenSize();
			break;
		case 'mintegral':
			size = getviewSize();
			break;
		case 'ironSource':
			size = window['dapi'].getScreenSize();
			break;
		case 'facebook':
			size = getviewSize();
			break;
		case 'dev':
			size = getviewSize();
			break;
	}

	return size;
};

const getviewSize = () => {
	return {
		width: document.documentElement.clientWidth,
		height: document.documentElement.clientHeight
	}
}

/**
 * 游戏结束
 */
const gameOver = () => {
	switch (<Platform>PLATFORM){
		case 'mintegral':
            window['gameEnd'] && window['gameEnd']();
			break;
		default:
			break;
	}
};

/**
 * 窗口重置
 */
const onSceneResize = () => {
	if (Game === null) return;

	Game.windowResize();
};

/**
 * 打印
 * @param text 
 */
const Loger = (text: string) =>{
	if (!DEBUG) return;

	const textOld = document.getElementById('loger').innerHTML + '<br/>';

	text = textOld + text;
	document.getElementById('loger').innerHTML = text;
}

const handleFn = {
	'mraid': () => {
		const mraidFn = {
			viewableChangeHandler: (viewable: boolean) => {
				if (viewable) {
					startGame();
				} else {
					Loger('notViewable');
					if(Game !== null){
						Loger('pauseAudio')
						Game.pauseAudio();
					}
				}
			},
			onSdkReady: () => {
				window['mraid'].addEventListener('viewableChange', mraidFn.viewableChangeHandler);

				if (window['mraid'].isViewable()) {
					startGame();
				}
			}
		};

		if (window['mraid'].getState() === 'loading') {
			window['mraid'].addEventListener('ready', mraidFn.onSdkReady);
		} else {
			startGame();
		}
	},

	'ironSource': () => {
		const ironSourceFn = {
			onReadyCallback: () => {
				try{
					Loger('call the onReadyCallback function')
					window['dapi'].removeEventListener("ready", ironSourceFn.onReadyCallback);

					var isAudioEnabled = !!window['dapi'].getAudioVolume();

					Loger('isViewable:' + window['dapi'].isViewable())
					window['dapi'].isViewable() ? startGame() : '';
					window['dapi'].addEventListener("viewableChange", ironSourceFn.viewableChangeCallback);
					window['dapi'].addEventListener("audioVolumeChange", ironSourceFn.audioVolumeChangeCallback);

				}catch(err3){
				}
			},
			viewableChangeCallback: (e: any) => {
				if (e.isViewable) {
					startGame()
				} else {
					if(Game !== null){
						Game.pauseAudio();
					}
				}

				e.isViewable ? startGame() : '';
			},
			audioVolumeChangeCallback: (e: any) => {
				const isAudioEnabled = !!window['volume'];

				if (isAudioEnabled) {
					startGame();
				} else {
					if (Game !== null) {
						Game.pauseAudio();
					}
				}
			}
		};
	
		window.onload = function(){
			Loger('onload');

			if (window['dapi'].isReady()) {
				Loger('isReady: true');
				ironSourceFn.onReadyCallback();
			} else {
				Loger('isReady: false, addEventListener ready');
				window['dapi'].addEventListener("ready", ironSourceFn.onReadyCallback);
			}
		};
	},
	'facebook': () => {
		const facebookFn = {
			onSdkReady: () => {
				startGame();
			}
		};

		window.addEventListener('load', facebookFn.onSdkReady);
		Loger('Debug model...');
	},
	'dev': () => {
		const devFn = {
			onSdkReady: () => {
				startGame();
			}
		};
	
		window.addEventListener('load', devFn.onSdkReady);
		Loger('Debug model...');
	}
};

/**
 * 入口
 */
const entry = () => {
	if (DEBUG) {
		document.getElementById('loger').style.display = 'block';
	}

	switch (<Platform>PLATFORM) {
		case 'mraid':
			handleFn.mraid();
			break;
		case 'ironSource':
			handleFn.ironSource();
			break;
		case 'facebook':
			handleFn.facebook();
			break;
		case 'dev':
			handleFn.dev();
			break;
	}
};

// ======================== 立即执行
Emitter.global.add('download', download);
Emitter.global.add('getSceneSize', getSceneSize);
Emitter.global.add('gameOver', gameOver);

entry();