import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Configuración de la escena y la cámara
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true }); // Permitir fondo transparente
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

let object; // Almacena el modelo 3D
const objToRender = 'torso'; // Nombre del objeto a renderizar
const loader = new GLTFLoader(); // Cargador de modelos 3D
let isDrawing = false; // Variable para rastrear si el usuario está dibujando
let lineGeometry = null; // Geometría para representar la línea
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Material de la línea roja

let strokesSaved = [
  {
    name: 'Kocher', //listo
    init: new THREE.Vector3(-0.028343422471721835, 0.1913181016841219, 0.46549937116498785),
    end: new THREE.Vector3(-0.2249051203106439, 0.03666931309412669, 0.3082913752960854),
    init2: new THREE.Vector3(-0.2249051203106439, 0.03666931309412669, 0.4082913752960854),
    end2: new THREE.Vector3(-0.02837277283671147, 0.20570260306615795, 0.3638068024542034),
  },
  {
    name: 'Paramedian', //listo
    init: new THREE.Vector3(0.06612893491210103, 0.12989612214876955, 0.4656406782229975),
    end: new THREE.Vector3(0.07683948969221943, -0.09364812806239287, 0.33831560461779),
    init2: new THREE.Vector3(0.07205922910811269, -0.09367699784054662, 0.43780334173705915),
    end2: new THREE.Vector3(0.07075749840454226, 0.13915641352893338, 0.3678304798595995),
  },
  {
    name: 'Rutherford-Morrison', //listo
    init: new THREE.Vector3(0.04761937802289218, -0.297621112643078, 0.4523393464397978),
    end: new THREE.Vector3(0.24259548677653409, -0.19556166791169605, 0.2869474361551674),
    init2: new THREE.Vector3(0.22051342018641173, -0.18376118348867632, 0.40446576299033776),
    end2: new THREE.Vector3(0.047778679153882786, -0.31295034845793457, 0.34682742636652863),
  },
  {
    name: 'Battle', //listo
    init: new THREE.Vector3(-0.07109510948536979, -0.17299809974773284, 0.46004277497724744),
    end: new THREE.Vector3(-0.0493874934544708, -0.4123855703448295, 0.2911614321427368),
    init2: new THREE.Vector3(-0.04904151358389741, -0.3947841843503722, 0.40313255489435407),
    end2: new THREE.Vector3(-0.08054355474357966, -0.17766960605201387, 0.36067174678502223),
  },
  {
    name: 'McBurney', //listo
    init: new THREE.Vector3(-0.2149953718037202, -0.19300720877833966, 0.40932361454616484),
    end: new THREE.Vector3(-0.12627138686057593, -0.35210290566891356, 0.31958846265168905),
    init2: new THREE.Vector3(-0.12131925979468294, -0.3518258534045796, 0.42091069491373445),
    end2: new THREE.Vector3(-0.2370544434689985, -0.2049533209159049, 0.29120125972442756),
  },
  {
    name: 'Lanz', //listo
    init: new THREE.Vector3(-0.19601525181918655, -0.3844914554914808, 0.3609610467181512),
    end: new THREE.Vector3(-0.039235877634692495, -0.3948110186990933, 0.30301721508450197),
    init2: new THREE.Vector3(-0.03906635632950939, -0.3833386214833113, 0.41034914580491266),
    end2: new THREE.Vector3(-0.21636847196159703, -0.41470623792639405, 0.21750327820884252),
  },
]
let strokeNumber;

const getStroke = () => {

  strokeNumber = Math.floor((Math.random()) * (strokesSaved.length));

  document.getElementById('strokeName').innerHTML = 'Corte a realizar: ' + strokesSaved[strokeNumber].name;
};

getStroke();

const getNewStroke = document.getElementById('getNewStroke');
getNewStroke.addEventListener('click', getStroke);


let startLinePosition = new THREE.Vector3();
let endLinePosition = new THREE.Vector3();
// Carga el modelo 3D
loader.load(
  `models/${objToRender}/scene.gltf`,
  function (gltf) {
    object = gltf.scene;

    // recorre el array strokesSaved
    strokesSaved.forEach(stroke => {
      const initialLineGeometry = new THREE.BufferGeometry().setFromPoints([stroke.init, stroke.end]);
      const initialLine = new THREE.Line(initialLineGeometry, lineMaterial);
      scene.add(initialLine);
    });

    scene.add(object);
    object.rotation.y = Math.PI;
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded'); // Muestra el progreso de carga
  },
  function (error) {
    console.error(error); // Muestra errores de carga
  }
);

// Configuración de la cámara
camera.position.z = 2;

// Luces en la escena
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

// Función para animar la escena
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

// Agregar eventos de mouse para dibujar líneas
renderer.domElement.addEventListener('mousedown', onMouseDown);
renderer.domElement.addEventListener('mousemove', onMouseMove);
renderer.domElement.addEventListener('mouseup', onMouseUp);

// Función para iniciar el dibujo al hacer clic izquierdo
function onMouseDown(event) {
  if (event.button === 0) { // Verifica que sea el clic izquierdo
    isDrawing = true;
    lineGeometry = new THREE.BufferGeometry(); // Inicializa la geometría de la línea
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    raycaster.params = { Mesh: { cullFace: THREE.CullFaceFront } };

    const intersects = raycaster.intersectObject(object, true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const position = intersection.point;
      // Aumenta la posición Z de la línea para alejarla un poco del modelo
      position.z += 0.1;
      startLinePosition.copy(position);
      lineGeometry.setFromPoints([position.clone(), position.clone()]);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    }
  }
}

// Función para actualizar la línea mientras se mueve el mouse
function onMouseMove(event) {
  if (isDrawing && lineGeometry) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    raycaster.params = { Mesh: { cullFace: THREE.CullFaceFront } };

    const intersects = raycaster.intersectObject(object, true);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const position = intersection.point;
      const positions = lineGeometry.attributes.position.array;
      positions[3] = position.x;
      positions[4] = position.y;
      positions[5] = position.z;
      console.log(positions)
      lineGeometry.attributes.position.needsUpdate = true;
      // Actualiza la posición final mientras se mueve el mouse
      endLinePosition.copy(position);
    }
  }
}

// Función para detener el dibujo al soltar el clic izquierdo
function onMouseUp(event) {
  if (event.button === 0) { // Verifica que sea el clic izquierdo
    isDrawing = false;
    lineGeometry = null;

    if (startLinePosition && endLinePosition) {

      console.log('Posición Inicial:', startLinePosition);
      console.log('Posición Final:', endLinePosition);
      // Comprobar la posición inicial y final de acuerdo con el trazo predefinido
      let thresholdDistance = 0.05; // Ajusta este valor según la sensibilidad que desees

      let initDistance = startLinePosition.distanceTo(strokesSaved[strokeNumber].init);
      let endDistance = endLinePosition.distanceTo(strokesSaved[strokeNumber].end);

      let initDistance2 = startLinePosition.distanceTo(strokesSaved[strokeNumber].init2);
      let endDistance2 = endLinePosition.distanceTo(strokesSaved[strokeNumber].end2);

      const info = document.getElementById('info');

      const removeClasses = (successClass) => {
        info.innerHTML = '';
        info.classList.remove('p-3', `text-${successClass}-emphasis`, `bg-${successClass}-subtle`, 'border', `border-${successClass}-subtle`, 'rounded-3', 'position-relative');
      };

      if (
        (initDistance < thresholdDistance && endDistance < thresholdDistance) ||
        (initDistance2 < thresholdDistance && endDistance2 < thresholdDistance)
      ) {
        // El trazo coincide con el trazo predefinido
        info.classList.add('p-3', `text-success-emphasis`, `bg-success-subtle`, 'border', `border-success-subtle`, 'rounded-3', 'position-relative', 'text-center');

        info.innerHTML = `El trazo coincide con ${strokesSaved[strokeNumber].name}`
        // after 5 seconds, remove the content of info
        setTimeout(() => {
          info.innerHTML = '';
          removeClasses('success');
        }, 5000);

      } else {
        info.classList.add('p-3', `text-warning-emphasis`, `bg-warning-subtle`, 'border', `border-warning-subtle`, 'rounded-3', 'position-relative', 'text-center');
        info.innerHTML = 'Intentalo de nuevo'

        // after 5 seconds, remove the content of info
        setTimeout(() => {
          info.innerHTML = '';
          removeClasses('warning');
        }, 5000);
      }
    }
  }
}

// Listener para redimensionar la ventana y la cámara
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const resetBtn = document.getElementById('resetBtn');
resetBtn.addEventListener('click', reset);

// Función para borrar los trazos
function reset() {
  for (let i = 0; i < 5; i++) {
    // Remover todas las líneas de la escena
    scene.children.forEach(child => {
      if (child instanceof THREE.Line) {
        scene.remove(child);
      }
    });
  }
}

// Iniciar la animación de la escena
animate();
