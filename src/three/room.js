import * as THREE from "three";

// 创建房间的类
export default class Room {
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
        this.cube = cube;

    }
}
