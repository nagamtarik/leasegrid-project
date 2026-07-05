import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { T } from "../lib/theme";

/* ------------------------------------------------------------------ */
/*  3D SPACE VIEWER                                                    */
/* ------------------------------------------------------------------ */
export function Space3D({ space, showFurniture, statusColor }) {
  const mountRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 320;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(T.ink);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const { w, l, h } = space.dims;

    const grid = new THREE.GridHelper(Math.max(w, l) + 4, 12, 0x2a3b5c, 0x18243c);
    group.add(grid);

    const boxGeo = new THREE.BoxGeometry(w, h, l);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const wireColor = new THREE.Color(statusColor || "#E8A33D");
    const wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: wireColor }));
    wire.position.y = h / 2;
    group.add(wire);

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x12213d, transparent: true, opacity: 0.5 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, l), floorMat);
    floor.rotation.x = -Math.PI / 2;
    group.add(floor);

    scene.add(new THREE.AmbientLight(0x8899bb, 0.7));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(w, h * 3, l);
    scene.add(dl);

    camera.position.set(w * 1.1, h * 1.6, l * 1.5);
    camera.lookAt(0, h / 3, 0);

    const furnitureGroup = new THREE.Group();
    group.add(furnitureGroup);

    function buildFurniture(on) {
      while (furnitureGroup.children.length) furnitureGroup.remove(furnitureGroup.children[0]);
      if (!on) return;
      const items = [
        { w: Math.min(w * 0.5, 2.4), h: 1.0, l: 0.55, x: 0, z: -l / 2 + 0.4, color: 0x4fd1c5 },
        { w: 0.45, h: 1.7, l: l * 0.55, x: -w / 2 + 0.3, z: 0.2, color: 0xc98a3d },
        { w: 0.45, h: 1.7, l: l * 0.55, x: w / 2 - 0.3, z: 0.2, color: 0xc98a3d },
        { w: 0.9, h: 0.05, l: 0.4, x: 0, z: -l / 2 + 0.4, color: 0xedeae2, y: 1.02 },
      ];
      items.forEach((it) => {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(it.w, it.h, it.l),
          new THREE.MeshStandardMaterial({ color: it.color })
        );
        m.position.set(it.x, it.y !== undefined ? it.y : it.h / 2, it.z);
        furnitureGroup.add(m);
      });
    }
    buildFurniture(showFurniture);

    const drag = { on: false, x: 0, y: 0 };
    let rotY = 0.65, rotX = -0.28;
    function down(e) { drag.on = true; drag.x = e.clientX; drag.y = e.clientY; }
    function up() { drag.on = false; }
    function move(e) {
      if (!drag.on) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      rotY += dx * 0.008;
      rotX = Math.max(-0.6, Math.min(0.05, rotX + dy * 0.005));
    }
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", move);

    let raf;
    function animate() {
      group.rotation.y = rotY;
      group.rotation.x = rotX;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    animate();

    apiRef.current = { buildFurniture };

    return () => {
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", move);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [space.id, statusColor]);

  useEffect(() => {
    if (apiRef.current) apiRef.current.buildFurniture(showFurniture);
  }, [showFurniture]);

  return <div ref={mountRef} style={{ width: "100%", height: 320, borderRadius: 10, overflow: "hidden" }} />;
}

