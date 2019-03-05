import {ShaderCanvas} from "shader-canvas";

function testUniform(type: string, name: string, source: string) {
    const re = new RegExp(`^\\s*uniform\\s+${type}\\s+${name}`, "m");
    return re.test(source);
}

interface Texture {
    name: string;
    src: string;
}

function loadImage(src: string) {
    console.log("loading image:", src);
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => { resolve(img); };
        img.onerror = reject;
        img.onabort = reject;
    });
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

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.shaderCanvas.domElement.addEventListener("mousemove", this.handleMouseMove);
    }

    public setSource(source: string) {
        this.source = source;

        // TODO: check returned errors
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

    public handleMouseMove(e: MouseEvent) {
        this.setMouseUniform(
            e.offsetX / this.shaderCanvas.width,
            1 - (e.offsetY / this.shaderCanvas.height),
        );
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

    private setMouseUniform(x: number, y: number) {
        if (testUniform("vec2", "u_mouse", this.source)) {
            this.shaderCanvas.setUniform("u_mouse", [x, y]);
        }
    }

    public setTextures(textures: Texture[]) {
        const promises = textures.map(({name, src}) => {
            return loadImage(src).then((img) => {
                this.shaderCanvas.setTexture(name, img);
            });
        });
        return Promise.all(promises);
    }
}

const shader = new Shader();
document.body.appendChild(shader.shaderCanvas.domElement);

window.addEventListener("message", (event) => {
    switch (event.data.command) {
        case "updateShader":
            shader.setSource(event.data.source);
            break;
        case "setTextures":
            shader.setTextures(event.data.textures);
            break;
        default:
            console.error("unknown command:", event.data.command);
    }
});
