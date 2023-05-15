<template>
  <div class="containner" ref="container"></div>
</template>
<script>
import * as THREE from "three";
import { ref, onMounted } from "vue";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

//gsap
// typical import
import gsap from "gsap";

// 引入其他插件
import ScrollTrigger from "gsap/ScrollTrigger";
import Flip from "gsap/Flip";
import Draggable from "gsap/Draggable";
import { Camera } from "three";

// 注册插件
gsap.registerPlugin(ScrollTrigger, Draggable, Flip);

export default {
  setup() {
    // 页面宽高
    const width = window.innerWidth; //宽度
    const height = window.innerHeight; //高度
    //初始化场景
    const scene = new THREE.Scene();

    //设置光照
    //环境光:没有特定方向，整体改变场景的光照明暗
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    //点光源
    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    //点光源位置
    pointLight.position.set(400, 200, 300); //偏移光源位置，观察渲染效果变化
    scene.add(pointLight); //点光源添加到场景中

    // 初始化相机（透视投影相机）
    const camera = new THREE.PerspectiveCamera(
      75, //视角
      width / height, // 宽高比
      0.1, // 近裁截面
      10000 // 远裁截面
    );
    camera.lookAt(5, 0, -2);
    // camera.lookAt(0, 0, 0);
    // 设置相机位置
    camera.position.set(0, 0, 0);
    // camera.position.z = 800;

    // 创建渲染器对象
    const renderer = new THREE.WebGLRenderer({
      antialias: true, //开启优化锯齿
    });

    // 定义threejs输出画布的尺寸(单位:像素px)
    renderer.setSize(width, height); //设置three.js渲染区域的尺寸(像素px)

    // 获取挂载元素
    const container = ref(null);

    // 渲染函数
    const render = () => {
      renderer.render(scene, camera); //执行渲染操作
      requestAnimationFrame(render); // 请求动画帧，重复执行渲染函数
    };

    //挂在完毕之后获取dom
    onMounted(() => {
      container.value.appendChild(renderer.domElement); //渲染到dom 节点
      // 节点挂载之后渲染
      render();
      // 设置相机控件轨道控制器OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      // 如果OrbitControls改变了相机参数，重新调用渲染器渲染三维场景
      controls.addEventListener("change", function () {
        console.log("13");
        renderer.render(scene, camera); //执行渲染操作
        // 浏览器控制台查看相机位置变化
        console.log("camera.position", camera.position);
      }); //监听鼠标、键盘事件
      // 精灵标签
      class spriteText {
        constructor(text, position = new THREE.Vector3(0, 0, 0)) {
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
          scene.add(sprite);
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
            console.log(intersects);
            if (intersects.length > 0) {
              console.log(this.callback);
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

      // 创建房间的类
      class Room {
        constructor(
          name, //房间名
          roomIndex, // 房间号
          textureUrl, // 纹理加载路径
          position = new THREE.Vector3(0, 0, 0), //房间位置
          euler = new THREE.Euler(0, 0, 0) //欧拉角
        ) {
          this.name = name;
          //创建一个长方体几何对象Geometry
          const geometry = new THREE.BoxGeometry(100, 100, 100);
          if (name == "kitchen") {
            geometry.rotation = Math.PI / 4;
          }

          // 材质图片数组
          let imgs = [
            `${roomIndex}_b`,
            `${roomIndex}_f`,
            `${roomIndex}_u`,
            `${roomIndex}_d`,
            `${roomIndex}_r`,
            `${roomIndex}_l`,
          ];
          //材质数组
          let boxMaterials = [];

          imgs.forEach((item) => {
            //纹理加载
            let texture = new THREE.TextureLoader().load(
              `${textureUrl}/${item}.jpg`
            );

            //对底(0-d)和顶(0-u)进行旋转
            if (item == `${roomIndex}_d`) {
              texture.rotation = Math.PI / 2;
              texture.center = new THREE.Vector2(0.5, 0.5);
            }

            if (item == `${roomIndex}_u`) {
              texture.rotation = -Math.PI / 2;
              texture.center = new THREE.Vector2(0.5, 0.5);
            }

            //创建材质
            boxMaterials.push(new THREE.MeshBasicMaterial({ map: texture }));
          });

          //创建网格对象
          const cube = new THREE.Mesh(geometry, boxMaterials);
          cube.position.copy(position);
          cube.rotation.copy(euler);
          //看立方体内部
          cube.geometry.scale(1, 1, -1);
          // 添加进场景中
          scene.add(cube);
        }
      }

      let isMouseDown = false;

      // 监听鼠标按下事件
      // window.addEventListener(
      //   "mousedown",
      //   () => {
      //     isMouseDown = true;
      //   },
      //   false
      // );
      // // 监听鼠标抬起事件
      // window.addEventListener(
      //   "mouseup",
      //   () => {
      //     isMouseDown = false;
      //   },
      //   false
      // );
      // window.addEventListener("mousemove", (event) => {
      //   if (isMouseDown) {
      //     camera.rotation.y += event.movementX * 0.002;
      //     camera.rotation.x += event.movementY * 0.002;
      //     camera.rotation.order = "YXZ";
      //   }
      // });

      // 画布跟随窗口变化
      window.onresize = function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      };

      // 创建房间

      // 创建客厅
      const livingRoom = new Room("livingRoom", 0, "./imgs/livingroom");

      //创建厨房
      let kitchenPosition = new THREE.Vector3(0, 0, -100);
      let kitchenEuler = new THREE.Euler(0, -Math.PI / 2, 0);
      const kitchen = new Room(
        "kitchen",
        3,
        "./imgs/kitchen",
        kitchenPosition,
        kitchenEuler
      );
      let kitchenText = new spriteText("厨房", new THREE.Vector3(5, 0, -2));
      kitchenText.clickFn(() => {
        // 让相机移动到厨房
        gsap.to(camera.position, {
          duration: 1,
          x: kitchenPosition.x,
          y: kitchenPosition.y,
          z: kitchenPosition.z,
          ease: "power3.inOut",
        });
      });
    });

    return {
      container,
    };
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

.containner {
  width: 100vw;
  height: 100vh;
  background: black;
}
</style>
