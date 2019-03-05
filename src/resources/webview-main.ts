import {ShaderCanvas} from "shader-canvas";

let source = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
`;

const shader = new ShaderCanvas();
shader.setShader(source);
document.body.appendChild(shader.domElement);

window.addEventListener("message", (event) => {
    if (event.data.command === "updateShader") {
        source = event.data.source;
        shader.setShader(source);
        resize();
        shader.render();
    }
});

function testUniform(type: string, name: string) {
    const re = new RegExp(`^\\s*uniform\\s+${type}\\s+${name}`, "m");
    return re.test(source);
}

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight);
    shader.setSize(size, size);
    if (testUniform("vec2", "u_resolution")) {
        shader.setUniform("u_resolution", shader.getResolution());
    }
}
resize();
window.addEventListener("resize", resize);

function animate(timestamp: number) {
    window.requestAnimationFrame(animate);
    if (testUniform("float", "u_time")) {
        shader.setUniform("u_time", timestamp / 1000);
    }
    shader.render();
}
window.requestAnimationFrame(animate);
