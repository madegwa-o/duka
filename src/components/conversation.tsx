"use client"

import { useConversation } from "@elevenlabs/react"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"

export function Conversation() {
    const conversation = useConversation({
        onConnect: () => console.log("[v0] ElevenLabs connected"),
        onDisconnect: () => console.log("[v0] ElevenLabs disconnected"),
        onMessage: (message) => console.log("[v0] Message received:", message),
        onError: (error) => console.error("[v0] ElevenLabs error:", error),
    })

    const startConversation = useCallback(async () => {
        try {
            // Request microphone permission
            await navigator.mediaDevices.getUserMedia({ audio: true })

            // Start the conversation with your agent
            await conversation.startSession({
                agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "YOUR_AGENT_ID",
                connectionType: "webrtc",
            })
        } catch (error) {
            console.error("[v0] Failed to start conversation:", error)
        }
    }, [conversation])

    const stopConversation = useCallback(async () => {
        await conversation.endSession()
    }, [conversation])

    const isConnecting = conversation.status === "connecting"
    const isConnected = conversation.status === "connected"

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-4">
                {/* Status Indicator */}
                <div className="relative">
                    <div
                        className={`flex h-32 w-32 items-center justify-center rounded-full transition-all ${
                            isConnected ? "bg-primary/20 ring-4 ring-primary/30" : "bg-muted"
                        }`}
                    >
                        {isConnecting ? (
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        ) : isConnected ? (
                            <Mic className={`h-12 w-12 text-primary ${conversation.isSpeaking ? "animate-pulse" : ""}`} />
                        ) : (
                            <MicOff className="h-12 w-12 text-muted-foreground" />
                        )}
                    </div>
                    {isConnected && conversation.isSpeaking && (
                        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                    )}
                </div>

                {/* Status Text */}
                <div className="text-center">
                    <p className="font-sans text-lg font-semibold text-foreground">
                        {isConnecting && "Connecting..."}
                        {isConnected && (conversation.isSpeaking ? "AI is speaking" : "Listening...")}
                        {!isConnecting && !isConnected && "Ready to start"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">Status: {conversation.status}</p>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
                <Button onClick={startConversation} disabled={isConnected || isConnecting} className="min-w-[160px]">
                    {isConnecting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting
                        </>
                    ) : (
                        <>
                            <Mic className="mr-2 h-4 w-4" />
                            Start Consult
                        </>
                    )}
                </Button>
                <Button
                    onClick={stopConversation}
                    disabled={!isConnected}
                    variant="destructive"
                    className="min-w-[160px]"
                >
                    <MicOff className="mr-2 h-4 w-4" />
                    End Consult
                </Button>
            </div>
        </div>
    )
}
