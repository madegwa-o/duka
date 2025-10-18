"use client"

import { useEffect, useState, useRef } from "react"
import Vapi from "@vapi-ai/web"
import { Phone, PhoneOff, Mic, MicOff, AlertCircle, Volume2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY

interface Message {
    time: string
    type: "user" | "assistant" | "system"
    content: string
}

export default function ConsultPage() {
    const [vapi, setVapi] = useState<Vapi | null>(null)
    const [connected, setConnected] = useState(false)
    const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false)
    const [volumeLevel, setVolumeLevel] = useState(0)
    const [isMuted, setIsMuted] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [isInitializing, setIsInitializing] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!VAPI_PUBLIC_KEY) {
            console.error("NEXT_PUBLIC_VAPI_PUBLIC_KEY is required")
            return
        }

        const vapiInstance = new Vapi(VAPI_PUBLIC_KEY)
        setVapi(vapiInstance)

        // Set up Vapi event listeners
        vapiInstance.on("call-start", () => {
            console.log("[v0] Call started")
            setConnected(true)
            setIsInitializing(false)
            addMessage("system", "Voice consultation connected")
        })

        vapiInstance.on("call-end", () => {
            console.log("[v0] Call ended")
            setConnected(false)
            setAssistantIsSpeaking(false)
            setVolumeLevel(0)
            setIsInitializing(false)
            addMessage("system", "Voice consultation ended")
        })

        vapiInstance.on("speech-start", () => {
            console.log("[v0] Assistant started speaking")
            setAssistantIsSpeaking(true)
        })

        vapiInstance.on("speech-end", () => {
            console.log("[v0] Assistant stopped speaking")
            setAssistantIsSpeaking(false)
        })

        vapiInstance.on("volume-level", (volume: number) => {
            setVolumeLevel(volume)
        })

        vapiInstance.on("message", (message) => {
            console.log("[v0] Received message:", message)

            if (message.type === "transcript") {
                if (message.transcriptType === "final") {
                    if (message.role === "user") {
                        addMessage("user", message.transcript)
                    } else if (message.role === "assistant") {
                        addMessage("assistant", message.transcript)
                    }
                }
            } else if (message.type === "function-call") {
                addMessage("system", `Function called: ${message.functionCall.name}`)
            } else if (message.type === "hang") {
                addMessage("system", "Call ended by assistant")
            }
        })

        vapiInstance.on("error", (error) => {
            console.error("[v0] Vapi error:", error)
            addMessage("system", `Error: ${error.message || error}`)
            setIsInitializing(false)
        })

        return () => {
            vapiInstance.stop()
        }
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const addMessage = (type: "user" | "assistant" | "system", content: string) => {
        setMessages((prev) => [
            ...prev,
            {
                time: new Date().toLocaleTimeString(),
                type,
                content,
            },
        ])
    }

    const startCall = async () => {
        if (!vapi) return

        try {
            setIsInitializing(true)
            addMessage("system", "Initializing voice consultation...")

            await vapi.start({
                model: {
                    provider: "openai",
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `You are Kia, a professional health AI assistant. Your role is to:
1. Listen carefully to the patient's symptoms and concerns
2. Ask relevant follow-up questions to understand their condition better
3. Provide preliminary guidance on what type of medical professional they should see (e.g., general practitioner, specialist, urgent care, emergency room)
4. Suggest next steps for finding appropriate care
5. Always remind patients that you provide guidance only and are not a substitute for professional medical advice

Keep your responses conversational, empathetic, and concise. If the patient describes emergency symptoms (severe chest pain, difficulty breathing, severe bleeding, etc.), immediately advise them to call emergency services.

Be professional but warm. Use simple language and avoid medical jargon unless necessary.`,
                        },
                    ],
                },
                voice: {
                    provider: "11labs",
                    voiceId: "z0gdR3nhVl1Ig2kiEigL",
                },
                transcriber: {
                    provider: "deepgram",
                    model: "nova-2",
                    language: "en-US",
                },
                firstMessage:
                    "Hello, I'm Kia, your health AI assistant. I'm here to help you understand your symptoms and guide you to the right care. What brings you in today?",
                endCallMessage: "Thank you for consulting with me. Take care and feel better soon!",
                endCallPhrases: ["goodbye", "bye", "end consultation", "hang up", "that's all"],
                maxDurationSeconds: 1800, // 30 minutes
            })
        } catch (error) {
            console.error("[v0] Error starting call:", error)
            addMessage("system", `Failed to start consultation: ${error}`)
            setIsInitializing(false)
        }
    }

    const stopCall = () => {
        if (vapi) {
            vapi.stop()
        }
    }

    const toggleMute = () => {
        if (!vapi) return
        const newMutedState = !isMuted
        vapi.setMuted(newMutedState)
        setIsMuted(newMutedState)
        addMessage("system", newMutedState ? "Microphone muted" : "Microphone unmuted")
    }

    if (!VAPI_PUBLIC_KEY) {
        return (
            <main className="container px-4 py-8 max-w-4xl mx-auto">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Voice consultation is not configured. Please add your VAPI_PUBLIC_KEY to environment variables.
                    </AlertDescription>
                </Alert>
            </main>
        )
    }

    return (
        <main className="container px-4 py-8 max-w-4xl mx-auto">

            {/* Conversation Transcript */}
            <Card className="mb-6">
                <CardHeader className="border-b">
                    <CardTitle className="text-lg">Conversation Transcript</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center">

                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Phone className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">Ready for Voice Consultation</h3>
                                <p className="text-muted-foreground text-sm max-w-md">
                                    Click &#34;Start Consultation&#34; to begin a voice conversation with Kia. Make sure your microphone is
                                    enabled and you&#39;re in a quiet environment.
                                </p>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                        message.type === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : message.type === "assistant"
                                                ? "bg-muted text-foreground"
                                                : "bg-secondary text-secondary-foreground"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-xs">
                      {message.type === "user" ? "You" : message.type === "assistant" ? "Kia" : "System"}
                    </span>
                                        <span className="text-xs opacity-70">{message.time}</span>
                                    </div>
                                    <div className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</div>
                                </div>
                            </div>
                        ))}

                        <div ref={messagesEndRef} />
                    </div>
                </CardContent>
            </Card>

            {/* Status Card */}
            <Card >
                <CardHeader className="border-b">
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span>Consultation Status</span>
                        {connected && (
                            <Badge variant={assistantIsSpeaking ? "default" : "secondary"} className="ml-2">
                                {assistantIsSpeaking ? "Kia is speaking" : "Listening"}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                                <span className="font-medium text-sm">
                  {isInitializing ? "Connecting..." : connected ? "Connected" : "Disconnected"}
                </span>
                            </div>

                            {connected && (
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Volume2 className="h-4 w-4" />
                                        <span>{Math.round(volumeLevel * 100)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isMuted ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
                                        <span>{isMuted ? "Muted" : "Active"}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Control Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={startCall}
                                disabled={connected || isInitializing}
                                className="flex-1 mb-4 h-16 w-16 items-center justify-center rounded-full "
                                size="lg"
                                variant="default"
                            >
                                {isInitializing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Phone className="mr-2 h-4 w-4" />
                                        Start Consultation
                                    </>
                                )}
                            </Button>

                            <Button onClick={stopCall} disabled={!connected} size="lg"
                                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full "
                                    variant="destructive">
                                <PhoneOff className="mr-2 h-4 w-4" />
                            </Button>

                            <Button onClick={toggleMute}
                                    disabled={!connected}
                                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full "
                                    size="lg" variant="outline">
                                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </main>
    )
}
