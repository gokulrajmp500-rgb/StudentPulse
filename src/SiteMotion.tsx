import { useEffect, useRef, type PointerEvent, type ReactNode } from "react"

import type * as THREE from "three"

import "./SiteMotion.css"

export function SiteAmbientScene() {
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = sceneRef.current

    if (!host) return

    let disposed = false

    let disposeScene = () => {}

    void import("three")
      .then((THREE) => {
        if (disposed) return

        let renderer: THREE.WebGLRenderer

        try {
          renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
        } catch (error) {
          console.error(
            "Unable to initialize the StudentPulse 3D background.",
            error,
          )

          return
        }

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25))

        renderer.setSize(host.clientWidth, host.clientHeight, false)

        renderer.domElement.setAttribute("aria-hidden", "true")

        host.appendChild(renderer.domElement)

        const scene = new THREE.Scene()

        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 40)

        camera.position.z = 10

        const orbit = new THREE.Group()

        scene.add(orbit)

        const outerGeometry = new THREE.TorusGeometry(2.15, 0.012, 6, 112)

        const innerGeometry = new THREE.TorusGeometry(1.55, 0.01, 6, 96)

        const outerMaterial = new THREE.MeshBasicMaterial({
          color: 0x2563eb,

          transparent: true,

          opacity: 0.18,
        })

        const innerMaterial = new THREE.MeshBasicMaterial({
          color: 0x16a394,

          transparent: true,

          opacity: 0.14,
        })

        const outerRing = new THREE.Mesh(outerGeometry, outerMaterial)

        const innerRing = new THREE.Mesh(innerGeometry, innerMaterial)

        outerRing.rotation.x = 0.85

        innerRing.rotation.set(1.1, 0.35, 0.3)

        orbit.add(outerRing, innerRing)

        const pointPositions = new Float32Array(42 * 3)

        for (let index = 0; index < 42; index++) {
          const angle = index * 2.39996

          const radius = 0.65 + (index % 7) * 0.29

          pointPositions[index * 3] = Math.cos(angle) * radius

          pointPositions[index * 3 + 1] = Math.sin(angle) * radius

          pointPositions[index * 3 + 2] = Math.sin(index * 1.7) * 0.42
        }

        const pointsGeometry = new THREE.BufferGeometry()

        pointsGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(pointPositions, 3),
        )

        const pointsMaterial = new THREE.PointsMaterial({
          color: 0x4384e8,

          size: 0.035,

          transparent: true,

          opacity: 0.42,

          sizeAttenuation: true,
        })

        orbit.add(new THREE.Points(pointsGeometry, pointsMaterial))

        const resize = () => {
          const width = host.clientWidth

          const height = host.clientHeight

          if (!width || !height) return

          renderer.setSize(width, height, false)

          camera.aspect = width / height

          camera.position.z = 10

          camera.updateProjectionMatrix()

          const viewHeight =
            2 *
            camera.position.z *
            Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))

          orbit.position.set(
            viewHeight * camera.aspect * 0.29,
            viewHeight * 0.18,
            -1.5,
          )

          renderer.render(scene, camera)
        }

        const observer = new ResizeObserver(resize)

        observer.observe(host)

        resize()

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches

        let frame = 0

        const animate = (time: number) => {
          if (disposed) return

          orbit.rotation.z = Math.sin(time * 0.00012) * 0.055

          outerRing.rotation.y = 0.85 + Math.sin(time * 0.00018) * 0.08

          innerRing.rotation.x = 1.1 + Math.cos(time * 0.00015) * 0.07

          renderer.render(scene, camera)

          frame = requestAnimationFrame(animate)
        }

        if (!reduceMotion) frame = requestAnimationFrame(animate)

        disposeScene = () => {
          cancelAnimationFrame(frame)

          observer.disconnect()

          outerGeometry.dispose()

          innerGeometry.dispose()

          pointsGeometry.dispose()

          outerMaterial.dispose()

          innerMaterial.dispose()

          pointsMaterial.dispose()

          renderer.dispose()

          renderer.domElement.remove()
        }
      })
      .catch((error) =>
        console.error("Unable to load the StudentPulse 3D background.", error),
      )

    return () => {
      disposed = true

      disposeScene()
    }
  }, [])

  return (
    <div className="site-ambient-scene" ref={sceneRef} aria-hidden="true" />
  )
}

export function SitePageMotion({
  page,
  children,
}: {
  page: string
  children: ReactNode
}) {
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !(event.target instanceof Element)
    ) {
      return
    }

    const card = event.target.closest<HTMLElement>(".card")

    if (!card) return

    const bounds = card.getBoundingClientRect()

    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5

    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5

    card.style.setProperty(
      "--card-tilt-x",
      `${(horizontal * 1.5).toFixed(2)}deg`,
    )

    card.style.setProperty(
      "--card-tilt-y",
      `${(-vertical * 1.5).toFixed(2)}deg`,
    )
  }

  const onPointerOut = (event: PointerEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) return

    const card = event.target.closest<HTMLElement>(".card")

    if (
      !card ||
      (event.relatedTarget instanceof Node &&
        card.contains(event.relatedTarget))
    )
      return

    card.style.setProperty("--card-tilt-x", "0deg")

    card.style.setProperty("--card-tilt-y", "0deg")
  }

  return (
    <div
      key={page}
      className="site-page-motion"
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
    >
      {children}
    </div>
  )
}
