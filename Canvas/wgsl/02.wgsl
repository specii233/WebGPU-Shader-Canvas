// 顶点着色器
struct VertexInput {
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
    @location(2) texcoord: vec2f
};

struct Uniforms {
    modelViewProjection: mat4x4f,
    modelMatrix: mat4x4f,
    normalMatrix: mat3x3f,
    lightPosition: vec3f
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var textureSampler: sampler;
@group(0) @binding(2) var texture: texture_2d<f32>;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) worldPos: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f
};

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.position = uniforms.modelViewProjection * vec4f(input.position, 1.0);
    output.worldPos = (uniforms.modelMatrix * vec4f(input.position, 1.0)).xyz;
    output.normal = normalize(uniforms.normalMatrix * input.normal);
    output.uv = input.texcoord;
    return output;
}

// 片段着色器
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    let N = normalize(input.normal);
    let L = normalize(uniforms.lightPosition - input.worldPos);
    let diffuse = max(dot(N, L), 0.0);
    
    let baseColor = textureSample(texture, textureSampler, input.uv);
    return vec4f(baseColor.rgb * diffuse, baseColor.a);
}