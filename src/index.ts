// ======================== 导入
import Emitter from './Emitter';
import Cache from './Cache';
import './style.css';


// ======================== 类型

// ======================== 常量


// ======================== 变量

// ======================== 类

// ======================== 方法
const test = () => {
	const cache = new Cache();

	console.log(cache);
}


// ======================== 立即执行
Emitter.global.add('test', test);
test();