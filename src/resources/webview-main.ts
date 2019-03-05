import {ShaderCanvas} from "shader-canvas";

const shader = new ShaderCanvas();
shader.setShader(`
    precision mediump float;
    uniform vec2 u_resolution;
    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        gl_FragColor = vec4(uv.x, 0.0, uv.y, 1.0);
    }
`);

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight);
    shader.setSize(size, size);
    shader.setUniform("u_resolution", shader.getResolution());
}
resize();
window.addEventListener("resize", resize);

shader.render();

document.body.appendChild(shader.domElement);
