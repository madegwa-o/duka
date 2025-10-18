"use client"

import { useEffect, useRef } from "react"

export function ShaderBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas size
        const setCanvasSize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio
            canvas.height = canvas.offsetHeight * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }
        setCanvasSize()

        let animationFrameId: number
        let time = 0

        const animate = () => {
            time += 0.003
            const width = canvas.offsetWidth
            const height = canvas.offsetHeight

            // Create multiple overlapping gradients for depth
            const gradient1 = ctx.createRadialGradient(
                width * 0.3 + Math.sin(time * 0.5) * width * 0.2,
                height * 0.3 + Math.cos(time * 0.7) * height * 0.2,
                0,
                width * 0.5,
                height * 0.5,
                Math.max(width, height) * 0.8,
            )

            gradient1.addColorStop(0, `hsla(180, 75%, 55%, ${0.08 + Math.sin(time) * 0.03})`)
            gradient1.addColorStop(0.5, `hsla(190, 70%, 60%, ${0.05 + Math.cos(time * 1.2) * 0.02})`)
            gradient1.addColorStop(1, "hsla(200, 65%, 65%, 0)")

            const gradient2 = ctx.createRadialGradient(
                width * 0.7 + Math.cos(time * 0.6) * width * 0.2,
                height * 0.6 + Math.sin(time * 0.8) * height * 0.2,
                0,
                width * 0.5,
                height * 0.5,
                Math.max(width, height) * 0.8,
            )

            gradient2.addColorStop(0, `hsla(170, 70%, 50%, ${0.06 + Math.cos(time * 1.5) * 0.02})`)
            gradient2.addColorStop(0.5, `hsla(185, 65%, 55%, ${0.04 + Math.sin(time * 0.9) * 0.02})`)
            gradient2.addColorStop(1, "hsla(195, 60%, 60%, 0)")

            // Clear and draw gradients
            ctx.clearRect(0, 0, width, height)
            ctx.fillStyle = gradient1
            ctx.fillRect(0, 0, width, height)
            ctx.fillStyle = gradient2
            ctx.fillRect(0, 0, width, height)

            // Add subtle animated particles
            for (let i = 0; i < 30; i++) {
                const x = (Math.sin(time * 0.3 + i) * 0.5 + 0.5) * width
                const y = (Math.cos(time * 0.4 + i * 0.5) * 0.5 + 0.5) * height
                const size = Math.sin(time + i) * 1.5 + 2
                const opacity = Math.sin(time * 2 + i) * 0.05 + 0.05

                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
                ctx.beginPath()
                ctx.arc(x, y, size, 0, Math.PI * 2)
                ctx.fill()
            }

            animationFrameId = requestAnimationFrame(animate)
        }
        // </CHANGE>

        animate()

        // Handle resize
        const handleResize = () => {
            setCanvasSize()
        }
        window.addEventListener("resize", handleResize)

        return () => {
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full opacity-60"
            style={{ mixBlendMode: "screen" }}
            aria-hidden="true"
        />
    )
}
