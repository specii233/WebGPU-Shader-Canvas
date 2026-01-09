import GPUCanvas from './canvas.js';

// 顶层 await（模块级别）或放在 async IIFE 里
const gpuCanvas = await GPUCanvas.create();
console.log(gpuCanvas.device);

gpuCanvas.getContext();
gpuCanvas.initEncoder();
gpuCanvas.initUniform();
gpuCanvas.initVex();
gpuCanvas.initShader();
gpuCanvas.initPipeline();
// gpuCanvas.draw();

Promise.resolve(Promise.resolve(1)).then((res) => {
    // Use the draw() helper which creates a fresh encoder + pass
    gpuCanvas.draw();
}).then((res) => {
    console.log('Draw call submitted.');
}).catch((err) => {
    console.error('Error during draw call:', err);
});



function p(num) {
    return Promise.resolve(num * 2);
}
    
function* generator() {
    const value1 = yield p(1);
    const value2 = yield p(value1);
    const value3 = yield p(value2);
    const value4 = yield p(value3);
    return value4;
}

function higherOrderGenerator() {
    return () => {
        return new Promise(async (resolve, reject) => {
            const gen = generator();
            // 链式处理yield的Promise结果
            const doYield = async (input) => {
                console.log('input:', input);

                const next = gen.next(input);
                if (next.done) {
                    resolve(next.value);
                } else {
                    next.value.then((res) => {
                        doYield(res);
                    }).catch(reject);
                }
            };

            doYield(undefined);
        });
    }
}
const asyncGenFunc = higherOrderGenerator();
asyncGenFunc().then((res) => {
    console.log('Final result from generator:', res); 
}).catch((err) => {
    console.error('Error in generator execution:', err);
});

// function asyncGenerator() {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const value1 = await p(1);
//             const value2 = await p(value1);
//             resolve(value2);
//         }
//         catch (err) {
//             reject(err);
//         }
//     });
// }
// asyncGenerator().then((res) => {
//     console.log(res);
// }).catch((err) => {
//     console.error(err);
// });
    
// const gen = generator();
    
// const next1 = gen.next();
// console.log(next1.value);
// next1.value.then((res1) => {
//     console.log(res1);
    
//     const next2 = gen.next(res1); /* 
//     next(2) -> (num) => { 
//         const value1 = yield p(num); 
//         yield p(value1); 
//     } */
//     next2.value.then((res2) => {
//         console.log(res2);
//     });
// });
// // 2 4