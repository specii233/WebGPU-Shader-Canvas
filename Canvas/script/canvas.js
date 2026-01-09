export default class GPUCanvas {
    constructor() {
        this.canvas = document.getElementById('gpu-canvas');
        // 注意：此时 adapter / device 都还是 undefined
        this.adapter = null;
        this.device  = null;
        this.context = null;
        this.canvasFormat = null;
        this.encoder = null;
        this.uinform = null
        this.uinformBuffer = null
    }

    // 异步工厂：创建实例并完成 GPU 初始化
    static async create() {
        const o = new GPUCanvas();          // 先拿到 canvas
        o.adapter = await navigator.gpu.requestAdapter();
        if (!o.adapter) {
            throw new Error('No appropriate GPUAdapter found.');
        }
        o.device = await o.adapter.requestDevice();
        return o;                           // 返回已初始化好的实例
    }

    getContext() {
        this.context = this.canvas.getContext("webgpu");
        this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.device,
            format: this.canvasFormat,
        });
        console.log(this.context);
    }

    initEncoder() {
        // 保持 initEncoder 轻量：我们不在这里开始/结束 RenderPass。
        // draw() 方法会在每次需要绘制时创建新的 encoder 和 pass。
        this.encoder = null;
        this.pass = null;
    }

    draw() {
        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: [0, 0.5, 0.7, 1],
                storeOp: "store",
            }],
        });

        pass.setPipeline(this.pipeline);
        pass.setVertexBuffer(0, this.vertexBuffer);
        pass.draw(this.vertices.length / 2);

        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    initVex() {
        this.vertices = new Float32Array([
            //   X,    Y,
            -0.8, -0.8, // Triangle 1 (Blue)
            0.8, -0.8,
            0.8,  0.8,
            
            -0.8, -0.8, // Triangle 2 (Red)
            0.8,  0.8,
            -0.8,  0.8,
        ]);

        this.vertexBuffer = this.device.createBuffer({
            label: "Cell vertices",
            size: this.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.device.queue.writeBuffer(this.vertexBuffer, /*bufferOffset=*/0, this.vertices);

        this.vertexBufferLayout = {
            arrayStride: 8,
            attributes: [{
                format: "float32x2",
                offset: 0,
                shaderLocation: 0, // Position, see vertex shader
            }],
        };
    }

    async initShader() {
        // // 注意：使用 fetch 时，路径是相对于当前 HTML 文件的
        // try {
        //     const response = await fetch('wgsl/03.wgsl');
        //     if (!response.ok) {
        //         throw new Error(`HTTP error! status: ${response.status}`);
        //     }
        //     const wgslCode = await response.text();
            
        //     this.cellShaderModule = this.device.createShaderModule({
        //         label: "Cell shader",
        //         code: wgslCode
        //     });
        // } catch (error) {
        //     console.error('Failed to load shader:', error);
        //     // 可以在这里提供备用代码
        //     this.fallbackShader();
        // }

        
    
        this.cellShaderModule = this.device.createShaderModule({
            label: "Cell shader",
            code: `
                @group(0) @binding(0) var<uniform> grid: vec2f;

                @vertex
                fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
                    return vec4f(pos, 0, 1);
                }

                @fragment
                fn fragmentMain() -> @location(0) vec4f {
                    return vec4f(1, 1, 0, 1);
                }
            `
        });
    }

    initPipeline() {
        this.pipeline = this.device.createRenderPipeline({
            label: "Cell pipeline",
            layout: "auto",
            vertex: {
                module: this.cellShaderModule,
                entryPoint: "vertexMain",
                buffers: [this.vertexBufferLayout],
            },
            fragment: {
                module: this.cellShaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: this.canvasFormat,
                }],
            },
            primitive: {
                topology: "triangle-list",
                cullMode: "back",
            },
        });
    }

    initUniform() {
        const GRID_SIZE = 4;
        this.uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
        this.uinformBuffer = this.device.createBuffer({
            label: "Grid Uniforms",
            size: this.uniformArray.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(this.uinformBuffer, 0, this.uniformArray);
    }
}