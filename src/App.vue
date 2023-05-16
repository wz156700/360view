<template>
  <div class="containner" ref="container"></div>
  <div class="map">
    <div class="tagDiv" ref="tagDiv"></div>
    <img src="@/assets/map.gif" alt="" />
  </div>
  <div class="loading" v-if="progress != 100"></div>
  <div class="progress" v-if="progress != 100">
    <img src="@/assets/loading.gif" alt="loading" />
    <span>加载中：{{ progress }}%</span>
  </div>
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
import Room from "./three/room";
import spriteText from "./three/spriteText";

// 注册插件
gsap.registerPlugin(ScrollTrigger, Draggable, Flip);

export default {
  setup() {
    let progress = ref(0);
    // 获取页面宽高
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
    // 设置相机看向的位置
    camera.lookAt(5, 0, -2);
    // 设置相机位置
    camera.position.set(0, 0, 0);

    // 创建渲染器对象
    const renderer = new THREE.WebGLRenderer({
      antialias: true, //开启优化锯齿
    });

    // 定义threejs输出画布的尺寸(单位:像素px)
    renderer.setSize(width, height);

    // 获取挂载元素
    const container = ref(null);
    const tagDiv = ref(null);

    // 渲染函数
    const render = () => {
      renderer.render(scene, camera); //执行渲染操作
      requestAnimationFrame(render); // 请求动画帧，重复执行渲染函数
    };

    const tagDivArr = {
      客厅: [60, 80],
      厨房: [120, 110],
      阳台: [20, 15],
      过道: [90, 35],
      主卧: [60, 10],
    };

    const moveTagDiv = (name) => {
      if (tagDivArr[name]) {
        gsap.to(tagDiv.value, {
          duration: 1,
          x: tagDivArr[name][0],
          y: tagDivArr[name][1],
          ease: "power3.inOut",
        });
      }
    };

    //挂在完毕之后获取dom
    onMounted(() => {
      //渲染到dom 节点
      container.value.appendChild(renderer.domElement);
      // 节点挂载之后渲染
      render();

      // 处理相机旋转
      let isMouseDown = false;

      // 监听鼠标按下事件
      window.addEventListener(
        "mousedown",
        () => {
          isMouseDown = true;
        },
        false
      );
      // 监听鼠标抬起事件
      window.addEventListener(
        "mouseup",
        () => {
          isMouseDown = false;
        },
        false
      );
      // 控制相机旋转
      window.addEventListener("mousemove", (event) => {
        if (isMouseDown) {
          // 绕X轴旋转
          camera.rotation.y += event.movementX * 0.002;
          // 绕Y轴旋转
          // camera.rotation.x += event.movementY * 0.002;
          //相机旋转时的顺序
          camera.rotation.order = "YXZ";
        }
      });

      // 画布跟随窗口变化
      window.onresize = function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      };

      // 创建客厅
      const livingRoom = new Room("livingRoom", 0, "./imgs/livingroom");
      // 添加进场景中
      scene.add(livingRoom.cube);
      console.log(tagDiv.value);
      tagDiv.value.style.cssText = `transform:translate(60px, 80px)`;

      //创建厨房
      // 厨房位置
      let kitchenPosition = new THREE.Vector3(100, 0, 0);
      // 厨房旋转角度
      let kitchenEuler = new THREE.Euler(0, -Math.PI / 2, 0);
      const kitchen = new Room(
        "kitchen",
        3,
        "./imgs/kitchen",
        kitchenPosition,
        kitchenEuler
      );
      // 添加进场景中
      scene.add(kitchen.cube);

      // 创建客厅到厨房导航精灵
      let kitchenText = new spriteText(
        "厨房",
        new THREE.Vector3(5, 0, -2),
        camera
      );
      scene.add(kitchenText.sprite);

      // 定义客厅到厨房导航精灵点击事件
      kitchenText.clickFn(() => {
        // 让相机移动到厨房
        gsap.to(camera.position, {
          duration: 1,
          x: kitchenPosition.x,
          y: kitchenPosition.y,
          z: kitchenPosition.z,
          ease: "power3.inOut",
        });
        moveTagDiv("厨房");
      });

      // 创建厨房到客厅导航精灵
      let livingRoomText = new spriteText(
        "客厅",
        new THREE.Vector3(95, 0, 1),
        camera
      );
      scene.add(livingRoomText.sprite);

      // 定义厨房到客厅导航精灵点击事件
      livingRoomText.clickFn(() => {
        // 让相机移动到客厅
        gsap.to(camera.position, {
          duration: 1,
          x: 0,
          y: 0,
          z: 0,
          ease: "power3.inOut",
        });
        moveTagDiv("客厅");
      });

      //创建阳台
      let balconyPosition = new THREE.Vector3(-100, 0, 0);
      const balcony = new Room("balcony", 8, "./imgs/balcony", balconyPosition);
      scene.add(balcony.cube);

      // 创建客厅到阳台导航精灵
      let balconyText = new spriteText(
        "阳台",
        new THREE.Vector3(-10, 0, 0),
        camera
      );
      scene.add(balconyText.sprite);

      // 定义客厅到阳台导航精灵点击事件
      balconyText.clickFn(() => {
        // 让相机移动到阳台
        gsap.to(camera.position, {
          duration: 1,
          x: balconyPosition.x,
          y: balconyPosition.y,
          z: balconyPosition.z,
          ease: "power3.inOut",
        });
        moveTagDiv("阳台");
      });

      // 创建阳台到客厅导航精灵
      let livingText2 = new spriteText(
        "客厅",
        new THREE.Vector3(-95, 0, 0),
        camera
      );
      scene.add(livingText2.sprite);

      // 定义阳台到客厅导航精灵点击事件
      livingText2.clickFn(() => {
        // 让相机移动到客厅
        gsap.to(camera.position, {
          duration: 1,
          x: 0,
          y: 0,
          z: 0,
          ease: "power3.inOut",
        });
        moveTagDiv("客厅");
      });

      // 创建过道
      let corridorPosition = new THREE.Vector3(0, 0, -100);
      let corridorEuler = new THREE.Euler(0, -Math.PI / 2, 0);
      const corridor = new Room(
        "corridor",
        9,
        "./imgs/corridor",
        corridorPosition,
        corridorEuler
      );
      scene.add(corridor.cube);
      // 创建客厅到过道导航精灵
      let corridorText = new spriteText(
        "过道",
        new THREE.Vector3(-1, 1, -10),
        camera
      );
      scene.add(corridorText.sprite);

      // 定义客厅到过道导航精灵点击事件
      corridorText.clickFn(() => {
        // 让相机移动到过道
        gsap.to(camera.position, {
          duration: 1,
          x: corridorPosition.x,
          y: corridorPosition.y,
          z: corridorPosition.z,
          ease: "power3.inOut",
        });
        moveTagDiv("过道");
      });

      // 创建过道到客厅导航精灵
      let corridorText2 = new spriteText(
        "客厅",
        new THREE.Vector3(3, 0, -98),
        camera
      );
      scene.add(corridorText2.sprite);

      // 定义过道到客厅导航精灵点击事件
      corridorText2.clickFn(() => {
        // 让相机移动到客厅
        gsap.to(camera.position, {
          duration: 1,
          x: 0,
          y: 0,
          z: 0,
          ease: "power3.inOut",
        });
        moveTagDiv("客厅");
      });

      // 创建主卧
      let bedRoomPosition = new THREE.Vector3(100, 0, 100);
      let bedRoomEuler = new THREE.Euler(0, Math.PI / 2, 0);
      const bedRoom = new Room(
        "bedRoom",
        18,
        "./imgs/bedRoom",
        bedRoomPosition,
        bedRoomEuler
      );

      scene.add(bedRoom.cube);

      // 创建过道到主卧导航精灵
      let bedroomText = new spriteText(
        "主卧",
        new THREE.Vector3(-3, 0, -95),
        camera
      );
      scene.add(bedroomText.sprite);

      // 定义过道到主卧导航精灵点击事件
      bedroomText.clickFn(() => {
        // 让相机移动到主卧
        gsap.to(camera.position, {
          duration: 1,
          x: bedRoomPosition.x,
          y: bedRoomPosition.y,
          z: bedRoomPosition.z,
          ease: "power3.inOut",
        });
        moveTagDiv("主卧");
      });

      // 创建主卧到过道导航精灵
      let bedRoomText2 = new spriteText(
        "过道",
        new THREE.Vector3(98, 0, 90),
        camera
      );
      scene.add(bedRoomText2.sprite);

      // 定义主卧到过道导航精灵点击事件
      bedRoomText2.clickFn(() => {
        // 让相机移动到过道
        gsap.to(camera.position, {
          duration: 1,
          x: corridorPosition.x,
          y: corridorPosition.y,
          z: corridorPosition.z,
          ease: "power3.inOut",
        });
        moveTagDiv("过道");
      });
    });
    THREE.DefaultLoadingManager.onProgress = function (
      url,
      itemsLoaded,
      itemsTotal
    ) {
      progress.value = (new Number(itemsLoaded / itemsTotal) * 100).toFixed(2);
    };

    return {
      container,
      tagDiv, // 必须返回containner,tagDiv 才可以获取到ref元素。
      progress,
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

.map {
  position: absolute;
  bottom: 0;
  left: 0.1vw;
  width: 23.5vh;
  height: 20vh;
  pointer-events: none;
}

.map img {
  position: absolute;
  height: 100%;
}

.map .tagDiv {
  position: absolute;
  top: 0px;
  width: 3vw;
  height: 3vw;
  background: url("~@/assets/location.png");
  background-size: 100% 100%;
  background-position: center;
  z-index: 5;
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url(~@/assets/loading.png);
  background-size: cover;
  filter: blur(50px); /** 模糊处理 */
  z-index: 100;
}
.progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 101;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: #fff;
}
.progress > img {
  padding: 0 15px;
}

.title {
  width: 180px;
  height: 40px;
  position: fixed;
  right: 100px;
  top: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  line-height: 40px;
  text-align: center;
  color: #fff;
  border-radius: 5px;
  z-index: 110;
}
</style>
