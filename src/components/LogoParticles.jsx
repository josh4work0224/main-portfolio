// LogoParticles.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

const LogoParticles = ({ particleSize = 1.5, particleAmount = 5000 }) => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // 初始化移动设备检测
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 991);
    };

    // 初始检查
    checkMobile();

    // 添加resize监听器
    window.addEventListener("resize", checkMobile);

    // 清理函数
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 组件挂载后初始化Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    // 避免重复初始化
    if (containerRef.current.hasChildNodes()) return;

    let scene, camera, renderer;
    let particles, geometryCopy;
    let particleImg;

    // 初始化状态和变量
    const mouse = new THREE.Vector2(-200, 200);
    const raycaster = new THREE.Raycaster();
    const colorChange = new THREE.Color();
    let isMouseDown = false;
    let currenPosition;

    const data = {
      amount: particleAmount,
      particleSize: particleSize,
      particleColor: 0xffffff,
      area: 150, // 从250改为150，使粒子更密集
      ease: 0.03, // 从0.05改为0.03，使粒子回到原位更慢一些
    };

    // Logo SVG路径数据
    const logoSvgData = `
      <svg width="692" height="346" viewBox="0 0 692 346" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M692 173H623.261V207.738H588.892V0L541.05 48.094L540.569 47.9556C488.672 32.4548 428.25 24.22 365.767 24.22C186.497 24.22 46.1333 89.5448 46.1333 173C46.1333 256.455 186.497 321.78 365.767 321.78C394.981 321.78 423.714 319.912 451.415 316.382V346H588.892V276.938H657.631V242.2H692V173ZM365.767 301.02C203.682 301.02 66.7548 242.408 66.7548 173C66.7548 103.592 203.682 44.98 365.767 44.98C422.201 44.98 476.642 51.9692 524.278 64.9788L313.938 276.8H451.415V295.484C423.782 299.152 395.05 301.02 365.767 301.02Z" fill="white"/>
      </svg>
    `;

    // 预加载资源
    const loadResources = () => {
      return new Promise((resolve) => {
        const manager = new THREE.LoadingManager();
        manager.onLoad = resolve;

        particleImg = new THREE.TextureLoader(manager).load(
          "https://res.cloudinary.com/dfvtkoboz/image/upload/v1605013866/particle_a64uzf.png"
        );
      });
    };

    // 设置THREE场景
    const setupScene = () => {
      scene = new THREE.Scene();

      // 创建相机
      camera = new THREE.PerspectiveCamera(
        isMobile ? 75 : 65, // 移动设备使用更大的FOV
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        1,
        10000
      );
      camera.position.set(0, 0, isMobile ? 80 : 100); // 移动设备使用更近的相机位置

      // 创建渲染器
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;

      containerRef.current.appendChild(renderer.domElement);

      // 创建检测鼠标交互的区域平面
      const geometry = new THREE.PlaneGeometry(
        visibleWidthAtZDepth(100, camera),
        visibleHeightAtZDepth(100, camera)
      );
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0,
      });
      const planeArea = new THREE.Mesh(geometry, material);
      scene.add(planeArea);

      // 创建SVG粒子
      createSVGParticles();

      // 绑定事件
      window.addEventListener("resize", onWindowResize);
      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      // 开始动画循环
      renderer.setAnimationLoop(render);

      // 引用外部定义的事件处理函数

      // 渲染函数
      function render() {
        const time = ((0.001 * performance.now()) % 12) / 12;
        const zigzagTime = (1 + Math.sin(time * 2 * Math.PI)) / 6;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(planeArea);

        if (intersects.length > 0 && particles) {
          const pos = particles.geometry.attributes.position;
          const copy = geometryCopy.attributes.position;
          const colors = particles.geometry.attributes.customColor;
          const size = particles.geometry.attributes.size;

          const mx = intersects[0].point.x;
          const my = intersects[0].point.y;
          const mz = intersects[0].point.z;

          for (let i = 0, l = pos.count; i < l; i++) {
            const initX = copy.getX(i);
            const initY = copy.getY(i);
            const initZ = copy.getZ(i);

            let px = pos.getX(i);
            let py = pos.getY(i);
            let pz = pos.getZ(i);

            colorChange.setHSL(0.5, 1, 1);
            colors.setXYZ(i, colorChange.r, colorChange.g, colorChange.b);
            colors.needsUpdate = true;

            size.array[i] = data.particleSize;
            size.needsUpdate = true;

            let dx = mx - px;
            let dy = my - py;

            const mouseDistance = distance(mx, my, px, py);
            let d = (dx = mx - px) * dx + (dy = my - py) * dy;
            const f = -data.area / d;

            if (isMouseDown) {
              const t = Math.atan2(dy, dx);
              px -= f * Math.cos(t);
              py -= f * Math.sin(t);

              colorChange.setHex(0xccfc7e);
              colors.setXYZ(i, colorChange.r, colorChange.g, colorChange.b);
              colors.needsUpdate = true;

              if (
                px > initX + 70 ||
                px < initX - 70 ||
                py > initY + 70 ||
                py < initY - 70
              ) {
                colorChange.setHex(0xccfc7e);
                colors.setXYZ(i, colorChange.r, colorChange.g, colorChange.b);
                colors.needsUpdate = true;
              }
            } else {
              if (mouseDistance < data.area) {
                if (i % 5 == 0) {
                  const t = Math.atan2(dy, dx);
                  px -= 0.03 * Math.cos(t);
                  py -= 0.03 * Math.sin(t);

                  colorChange.setHex(0xccfc7e);
                  colors.setXYZ(i, colorChange.r, colorChange.g, colorChange.b);
                  colors.needsUpdate = true;

                  size.array[i] = data.particleSize / 1.2;
                  size.needsUpdate = true;
                } else {
                  const t = Math.atan2(dy, dx);
                  px += f * Math.cos(t);
                  py += f * Math.sin(t);

                  pos.setXYZ(i, px, py, pz);
                  pos.needsUpdate = true;

                  size.array[i] = data.particleSize * 1.3;
                  size.needsUpdate = true;
                }

                if (
                  px > initX + 10 ||
                  px < initX - 10 ||
                  py > initY + 10 ||
                  py < initY - 10
                ) {
                  colorChange.setHex(0xccfc7e);
                  colors.setXYZ(i, colorChange.r, colorChange.g, colorChange.b);
                  colors.needsUpdate = true;

                  size.array[i] = data.particleSize / 1.8;
                  size.needsUpdate = true;
                }
              }
            }

            px += (initX - px) * data.ease;
            py += (initY - py) * data.ease;
            pz += (initZ - pz) * data.ease;

            pos.setXYZ(i, px, py, pz);
            pos.needsUpdate = true;
          }
        }

        renderer.render(scene, camera);
      }
    };

    // 创建SVG粒子系统
    const createSVGParticles = () => {
      // 创建一个解析SVG的虚拟DOM元素
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(logoSvgData, "image/svg+xml");
      const svgElement = svgDoc.documentElement;

      // 使用SVGLoader解析SVG路径
      const svgLoader = new SVGLoader();
      const svgData = svgLoader.parse(svgElement.outerHTML);

      // 获取SVG的尺寸和路径
      const svgPaths = svgData.paths;

      // 计算SVG边界
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;

      svgPaths.forEach((path) => {
        path.subPaths.forEach((subPath) => {
          const points = subPath.getPoints();
          points.forEach((point) => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
          });
        });
      });

      const svgWidth = maxX - minX;
      const svgHeight = maxY - minY;

      // 收集所有的点
      let thePoints = [];
      let colors = [];
      let sizes = [];

      // 设置缩放比例以适应屏幕
      // 减小scale值可以让logo更大
      const scale = isMobile ? 6 : 8; // 移动设备使用更小的scale值
      const scaleFactor =
        (Math.min(
          window.innerWidth / svgWidth,
          window.innerHeight / svgHeight
        ) *
          (isMobile ? 0.7 : 0.6)) / // 移动设备使用更大的缩放系数
        scale;

      // 从路径中获取点
      svgPaths.forEach((path) => {
        const fillColor = path.color;

        path.subPaths.forEach((subPath) => {
          // 使用更精确的方法获取点
          // 增加divisions参数以获取更多点
          const divisions = Math.ceil(
            data.amount / svgPaths.length / path.subPaths.length
          );
          const points = subPath.getSpacedPoints(divisions);
          const totalPoints = points.length;

          // 对于每个点，创建一个粒子
          for (let i = 0; i < totalPoints; i++) {
            const point = points[i];

            // 应用缩放并居中
            const x = (point.x - (minX + svgWidth / 2)) * scaleFactor;
            // 在Three.js中，Y轴是向上的，而在SVG中是向下的，所以我们需要翻转Y坐标
            const y = -(point.y - (minY + svgHeight / 2)) * scaleFactor;

            const a = new THREE.Vector3(x, y, 0);
            thePoints.push(a);
            colors.push(colorChange.r, colorChange.g, colorChange.b);
            sizes.push(1);
          }
        });
      });

      // 确保我们不超过最大点数
      if (thePoints.length > data.amount) {
        const stride = Math.ceil(thePoints.length / data.amount);
        const filteredPoints = [];
        const filteredColors = [];
        const filteredSizes = [];

        for (let i = 0; i < thePoints.length; i += stride) {
          filteredPoints.push(thePoints[i]);
          filteredColors.push(
            colors[i * 3],
            colors[i * 3 + 1],
            colors[i * 3 + 2]
          );
          filteredSizes.push(sizes[i]);
        }

        thePoints = filteredPoints;
        colors = filteredColors;
        sizes = filteredSizes;
      }

      // 如果采样后点数不足，添加额外的点
      if (thePoints.length < data.amount) {
        const needed = data.amount - thePoints.length;
        for (let i = 0; i < needed; i++) {
          const randomIndex = Math.floor(Math.random() * thePoints.length);
          const randomPoint = thePoints[randomIndex].clone();

          // 添加微小的随机偏移
          randomPoint.x += (Math.random() - 0.5) * 2;
          randomPoint.y += (Math.random() - 0.5) * 2;

          thePoints.push(randomPoint);
          colors.push(colorChange.r, colorChange.g, colorChange.b);
          sizes.push(1);
        }
      }

      // 创建几何体
      let geoParticles = new THREE.BufferGeometry().setFromPoints(thePoints);

      geoParticles.setAttribute(
        "customColor",
        new THREE.Float32BufferAttribute(colors, 3)
      );
      geoParticles.setAttribute(
        "size",
        new THREE.Float32BufferAttribute(sizes, 1)
      );

      // 创建着色器材质
      const material = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffffff) },
          pointTexture: { value: particleImg },
        },
        vertexShader: `
          attribute float size;
          attribute vec3 customColor;
          varying vec3 vColor;
          void main() {
            vColor = customColor;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_PointSize = size * ( 300.0 / -mvPosition.z );
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform sampler2D pointTexture;
          varying vec3 vColor;
          void main() {
            gl_FragColor = vec4( color * vColor, 1.0 );
            gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
          }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
      });

      particles = new THREE.Points(geoParticles, material);
      scene.add(particles);

      geometryCopy = new THREE.BufferGeometry();
      geometryCopy.copy(particles.geometry);
    };

    // 辅助函数 - 计算在特定深度时可见的高度
    function visibleHeightAtZDepth(depth, camera) {
      const cameraOffset = camera.position.z;
      if (depth < cameraOffset) depth -= cameraOffset;
      else depth += cameraOffset;

      const vFOV = (camera.fov * Math.PI) / 180;

      return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
    }

    // 辅助函数 - 计算在特定深度时可见的宽度
    function visibleWidthAtZDepth(depth, camera) {
      const height = visibleHeightAtZDepth(depth, camera);
      return height * camera.aspect;
    }

    // 辅助函数 - 计算两点之间的距离
    function distance(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    // 辅助函数 - 窗口大小调整处理
    const onWindowResize = () => {
      if (camera && renderer && containerRef.current) {
        camera.aspect =
          containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    };

    // 鼠标事件处理函数，定义在闭包外部以便清理时使用
    const onMouseDown = (event) => {
      isMouseDown = true;
      data.ease = 0.01;

      updateMousePosition(event);

      const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      currenPosition = camera.position
        .clone()
        .add(dir.multiplyScalar(distance));
    };

    const onMouseUp = () => {
      isMouseDown = false;
      data.ease = 0.05;
    };

    const onMouseMove = (event) => {
      updateMousePosition(event);
    };

    const updateMousePosition = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // 初始化Three.js
    const init = async () => {
      await loadResources();
      setupScene();
    };

    init();

    // 组件卸载时清理
    return () => {
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer = null;
      }

      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [particleSize, particleAmount, isMobile]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        width: "100%",
        height: "100vh",
        display: "block",
        top: 0,
        left: 0,
        zIndex: 10,
      }}
    />
  );
};

export default LogoParticles;
