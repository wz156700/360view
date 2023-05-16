import * as THREE from "three";

// 创建canvas 精灵标签
export default class spriteText {
    constructor(text, position = new THREE.Vector3(0, 0, 0), camera) {
        this.callback = [];
        //创建导航标签
        let canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 1024;
        const context = canvas.getContext("2d");
        context.fillStyle = "rgba(100,100,100,0.7)";
        context.fillRect(0, 256, 1024, 512);

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold 200px Arail";
        context.fillStyle = "white";
        context.fillText(text, 512, 512);
        //canves纹理
        let texture = new THREE.CanvasTexture(canvas);

        //设置精灵材质
        const spriteMateral = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });

        const sprite = new THREE.Sprite(spriteMateral);
        const y = 1; //精灵y方向尺寸
        // sprite宽高比和canvas画布保持一致
        const x = (canvas.width / canvas.height) * y; //精灵x方向尺寸
        sprite.scale.set(x, y, 1); // 控制精灵大小
        sprite.position.copy(position);

        this.sprite = sprite;

        // 鼠标点击sprite 精灵事件
        window.addEventListener("click", (event) => {
            // 阻止默认事件
            event.preventDefault();
            const px = event.offsetX;
            const py = event.offsetY;
            const width = window.innerWidth;
            const height = window.innerHeight;
            //屏幕坐标转WebGL标准设备坐标
            const x = (px / width) * 2 - 1;
            const y = -(py / height) * 2 + 1;
            const raycaster = new THREE.Raycaster();
            //.setFromCamera()在点击位置生成射线ray
            raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
            // 射线交叉计算拾取模型
            const intersects = raycaster.intersectObject(sprite);
            if (intersects.length > 0) {
                this.callback.forEach((callback) => {
                    callback();
                });
            }
        });
    }
    clickFn(callback) {
        this.callback.push(callback);
    }
}