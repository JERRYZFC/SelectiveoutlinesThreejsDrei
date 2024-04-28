import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import Stats from 'three/addons/libs/stats.module.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import TWEEN from '@tweenjs/tween.js'

let annotations = {}
const annotationMarkers = []

const scene = new THREE.Scene()

const light = new THREE.DirectionalLight(0xffffff, Math.PI)
light.position.set(-30, 30, 30)
scene.add(light)

const light2 = new THREE.DirectionalLight(0xffffff, Math.PI)
light2.position.set(30, 30, -30)
scene.add(light2)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.x = 10
camera.position.y = 5
camera.position.z = 8

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(labelRenderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.dampingFactor = 0.2
controls.enableDamping = true
controls.target.set(8, 3, 4)

const raycaster = new THREE.Raycaster()
const sceneMeshes = new Array()

const circleTexture = new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/Sean-Bradley/Three.js-TypeScript-Boilerplate@annotations/dist/client/img/circle.png')

const progressBar = document.getElementById('progressBar')

const draco = new DRACOLoader();
//draco.setDecoderConfig({ type: 'js' });
draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

const loader = new GLTFLoader()
loader.setDRACOLoader(draco)
loader.load(
  'https://cdn.jsdelivr.net/gh/Sean-Bradley/Three.js-TypeScript-Boilerplate@annotations/dist/client/models/house-water-transformed.glb',
  (gltf) => {
    gltf.scene.traverse((c) => {
      if (c.isMesh) {
        const mesh = c
        const material = mesh.material
        if (!['sink_faiance', 'white_409', 'Ceramic'].includes(material.name)) {
          material.flatShading = true
        }
        if (
          [
            'ground_1',
            'wall_1_2',
            'room_58_344',
            'grey',
            'flltgrey',
            'flltgrey_sweethome3d_window_pane_420',
            'default',
            'Glass',
            'Glass_458',
            'flltgrey_sweethome3d_window_pane_479',
            'white_Fenetre_480',
            'white_13_526',
            'flltgrey_14_527',
            'wall_1_4',
            'glassblutint',
            'Aluminium_652',
            'Default_Texture',
            'GLASS',
            'Glass_sweethome3d_window_mirror_985',
            'cylinder_cylinder_1302',
          ].includes(material.name)
        ) {
          material.transparent = true
          material.opacity = 0.2
          material.depthWrite = false
        }
      }
    })
    scene.add(gltf.scene)
    sceneMeshes.push(gltf.scene)

    const annotationsDownload = new XMLHttpRequest()
    annotationsDownload.open('GET', 'https://cdn.jsdelivr.net/gh/Sean-Bradley/Three.js-TypeScript-Boilerplate@annotations/dist/client/data/annotations.json')
    annotationsDownload.onreadystatechange = function () {
      if (annotationsDownload.readyState === 4) {
        annotations = JSON.parse(annotationsDownload.responseText)

        const annotationsPanel = document.getElementById('annotationsPanel')
        const ul = document.createElement('ul')
        const ulElem = annotationsPanel.appendChild(ul)
        Object.keys(annotations).forEach((a) => {
          const li = document.createElement('li')
          const liElem = ulElem.appendChild(li)
          const button = document.createElement('button')
          button.innerHTML = a + ' : ' + annotations[a].title
          button.className = 'annotationButton'
          button.addEventListener('click', function () {
            gotoAnnotation(annotations[a])
          })
          liElem.appendChild(button)

          const annotationSpriteMaterial = new THREE.SpriteMaterial({
            map: circleTexture,
            depthTest: false,
            depthWrite: false,
            sizeAttenuation: false,
          })
          const annotationSprite = new THREE.Sprite(annotationSpriteMaterial)
          annotationSprite.scale.set(0.066, 0.066, 0.066)
          annotationSprite.position.copy(annotations[a].lookAt)
          annotationSprite.userData.id = a
          annotationSprite.renderOrder = 1
          scene.add(annotationSprite)
          annotationMarkers.push(annotationSprite)

          const annotationDiv = document.createElement('div')
          annotationDiv.className = 'annotationLabel'
          annotationDiv.innerHTML = a
          const annotationLabel = new CSS2DObject(annotationDiv)
          annotationLabel.position.copy(annotations[a].lookAt)
          scene.add(annotationLabel)

          if (annotations[a].description) {
            const annotationDescriptionDiv = document.createElement('div')
            annotationDescriptionDiv.className = 'annotationDescription'
            annotationDescriptionDiv.innerHTML = annotations[a].description
            annotationDiv.appendChild(annotationDescriptionDiv)
            annotations[a].descriptionDomElement = annotationDescriptionDiv
          }
        })
        progressBar.style.display = 'none'
      }
    }
    annotationsDownload.send()
  },
  (xhr) => {
    if (xhr.lengthComputable) {
      let percentComplete = (xhr.loaded / xhr.total) * 100
      progressBar.value = percentComplete
      progressBar.style.display = 'block'
    }
  }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  labelRenderer.setSize(window.innerWidth, window.innerHeight)
  render()
}

renderer.domElement.addEventListener('click', onClick, false)
function onClick(event) {
  raycaster.setFromCamera(
    {
      x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
      y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    },
    camera
  )

  const intersects = raycaster.intersectObjects(annotationMarkers, true)
  if (intersects.length > 0) {
    if (intersects[0].object.userData && intersects[0].object.userData.id) {
      gotoAnnotation(annotations[intersects[0].object.userData.id])
    }
  }
}

renderer.domElement.addEventListener('dblclick', onDoubleClick, false)
function onDoubleClick(event) {
  raycaster.setFromCamera(
    {
      x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
      y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    },
    camera
  )

  const intersects = raycaster.intersectObjects(sceneMeshes, true)

  if (intersects.length > 0) {
    const p = intersects[0].point

    new TWEEN.Tween(controls.target)
      .to(
        {
          x: p.x,
          y: p.y,
          z: p.z,
        },
        500
      )
      .easing(TWEEN.Easing.Cubic.Out)
      .start()
  }
}

function gotoAnnotation(a) {
  new TWEEN.Tween(camera.position)
    .to(
      {
        x: a.camPos.x,
        y: a.camPos.y,
        z: a.camPos.z,
      },
      500
    )
    .easing(TWEEN.Easing.Cubic.Out)
    .start()

  new TWEEN.Tween(controls.target)
    .to(
      {
        x: a.lookAt.x,
        y: a.lookAt.y,
        z: a.lookAt.z,
      },
      500
    )
    .easing(TWEEN.Easing.Cubic.Out)
    .start()

  Object.keys(annotations).forEach((annotation) => {
    if (annotations[annotation].descriptionDomElement) {
      annotations[annotation].descriptionDomElement.style.display = 'none'
    }
  })
  if (a.descriptionDomElement) {
    a.descriptionDomElement.style.display = 'block'
  }
}

const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
  requestAnimationFrame(animate)

  controls.update()

  TWEEN.update()

  render()

  stats.update()
}

function render() {
  renderer.render(scene, camera)
  labelRenderer.render(scene, camera)
}

animate()