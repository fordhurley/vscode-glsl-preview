import {ShaderCanvas} from "shader-canvas";

function testUniform(type: string, name: string, source: string) {
    const re = new RegExp(`^\\s*uniform\\s+${type}\\s+${name}`, "m");
    return re.test(source);
}

class Shader {
    private source: string = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
        }
    `;

    public shaderCanvas = new ShaderCanvas();

    public constructor() {
        this.setSource(this.source);

        this.resize = this.resize.bind(this);

        this.resize();
        window.addEventListener("resize", this.resize);

        this.animate = this.animate.bind(this);
        window.requestAnimationFrame(this.animate);
    }

    public setSource(source: string) {
        this.source = source;
        this.shaderCanvas.setShader(this.source);
        this.resize();
    }

    public resize() {
        const size = Math.min(window.innerWidth, window.innerHeight);
        this.shaderCanvas.setSize(size, size);
        this.setResolutionUniform();
    }

    public animate(timestamp: number) {
        window.requestAnimationFrame(this.animate);
        this.setTimeUniform(timestamp / 1000);
        this.shaderCanvas.render();
    }

    private setResolutionUniform() {
        if (testUniform("vec2", "u_resolution", this.source)) {
            this.shaderCanvas.setUniform("u_resolution", this.shaderCanvas.getResolution());
        }
    }

    private setTimeUniform(timeSeconds: number) {
        if (testUniform("float", "u_time", this.source)) {
            this.shaderCanvas.setUniform("u_time", timeSeconds);
        }
    }
}

const shader = new Shader();
document.body.appendChild(shader.shaderCanvas.domElement);

window.addEventListener("message", (event) => {
    if (event.data.command === "updateShader") {
        shader.setSource(event.data.source);
    }
});
