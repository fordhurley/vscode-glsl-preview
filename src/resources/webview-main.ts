import {ShaderCanvas} from "shader-canvas";

const size = Math.min(window.innerWidth, window.innerHeight);

const shader = new ShaderCanvas();
shader.setShader(`
    precision mediump float;
    uniform vec2 u_resolution;
    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        gl_FragColor = vec4(uv.x, 0.0, uv.y, 1.0);
    }
`);

shader.setSize(size, size);
shader.setUniform("u_resolution", shader.getResolution());
shader.render();

document.body.appendChild(shader.domElement);
