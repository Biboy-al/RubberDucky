"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Video, Square, Play, Pause, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

type RecordingMode = "audio" | "video"

interface RecordingState {
  isRecording: boolean
  isPlaying: boolean
  duration: number
  audioBlob: Blob | null
  videoBlob: Blob | null
  transcript: string
  feedback: string
  mode: RecordingMode
}

export function VideoRecorder() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPlaying: false,
    duration: 0,
    audioBlob: null,
    videoBlob: null,
    transcript: "",
    feedback: "",
    mode: "audio",
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const previewVideoRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = useCallback(async () => {
    try {
      const constraints =
        state.mode === "video" ? { audio: true, video: { width: 1280, height: 720 } } : { audio: true }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Show preview for video mode
      if (state.mode === "video" && previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream
        previewVideoRef.current.play()
      }

      const mediaRecorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, {
          type: state.mode === "video" ? "video/webm" : "audio/wav",
        })

        if (state.mode === "video") {
          setState((prev) => ({ ...prev, videoBlob: blob }))
        } else {
          setState((prev) => ({ ...prev, audioBlob: blob }))
        }

        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null

        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = null
        }
      }

      // Start speech recognition for both modes
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onresult = (event: any) => {
          let transcript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          setState((prev) => ({ ...prev, transcript }))
        }

        recognition.start()
        recognitionRef.current = recognition
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()

      setState((prev) => ({
        ...prev,
        isRecording: true,
        duration: 0,
        transcript: "",
        feedback: "",
        audioBlob: null,
        videoBlob: null,
      }))

      // Start timer
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }, [state.mode])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
      setState((prev) => ({ ...prev, isRecording: false }))

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }

      // Generate feedback after a short delay
      setTimeout(() => {
        generateFeedback()
      }, 1000)
    }
  }, [state.isRecording])

  const generateFeedback = useCallback(() => {
    const transcript = state.transcript.trim()
    if (!transcript) {
      setState((prev) => ({
        ...prev,
        feedback: "No speech detected. Try speaking more clearly into your microphone.",
      }))
      return
    }

    // Enhanced feedback generation
    const wordCount = transcript.split(" ").length
    const avgWordLength = transcript.replace(/\s/g, "").length / wordCount
    const hasFillerWords = /\b(um|uh|like|you know|actually|so|well)\b/gi.test(transcript)
    const fillerCount = (transcript.match(/\b(um|uh|like|you know|actually|so|well)\b/gi) || []).length
    const speakingRate = wordCount / (state.duration / 60) // words per minute

    let feedback = `## ${state.mode === "video" ? "Video" : "Audio"} Analysis Results\n\n`

    // Content analysis
    feedback += "### 📝 Content Analysis\n"
    if (wordCount < 15) {
      feedback += "• **Length**: Try speaking for longer to get more comprehensive feedback\n"
    } else if (wordCount > 100) {
      feedback += "• **Length**: Excellent! You covered substantial content\n"
    } else {
      feedback += "• **Length**: Good amount of content covered\n"
    }

    if (avgWordLength > 5) {
      feedback += "• **Vocabulary**: Great use of sophisticated vocabulary!\n"
    } else if (avgWordLength < 4) {
      feedback += "• **Vocabulary**: Consider using more varied vocabulary\n"
    }

    // Delivery analysis
    feedback += "\n### 🎤 Delivery Analysis\n"
    if (speakingRate > 180) {
      feedback += "• **Pace**: You're speaking quite fast - consider slowing down for clarity\n"
    } else if (speakingRate < 120) {
      feedback += "• **Pace**: Good measured pace - easy to follow\n"
    } else {
      feedback += "• **Pace**: Excellent speaking rate - clear and engaging\n"
    }

    if (hasFillerWords) {
      const fillerPercentage = ((fillerCount / wordCount) * 100).toFixed(1)
      feedback += `• **Clarity**: ${fillerCount} filler words detected (${fillerPercentage}% of speech). Try to reduce words like 'um', 'uh', 'like'\n`
    } else {
      feedback += "• **Clarity**: Excellent! No noticeable filler words detected\n"
    }

    // Video-specific feedback
    if (state.mode === "video") {
      feedback += "\n### 📹 Presentation Tips\n"
      feedback += "• **Visual Presence**: Great job recording on video! This helps with body language awareness\n"
      feedback += "• **Eye Contact**: Remember to look at the camera to simulate eye contact with your audience\n"
      feedback += "• **Posture**: Maintain good posture and use natural gestures to enhance your message\n"
    }

    // Overall score
    let score = 85
    if (hasFillerWords) score -= fillerCount * 2
    if (speakingRate > 200 || speakingRate < 100) score -= 10
    if (wordCount < 15) score -= 15
    if (avgWordLength > 5) score += 5

    feedback += `\n### 🎯 Overall Score: ${Math.max(60, Math.min(100, score))}/100\n`
    feedback += "Keep practicing to improve your communication skills!"

    setState((prev) => ({ ...prev, feedback }))
  }, [state.transcript, state.duration, state.mode])

  const playRecording = useCallback(() => {
    const blob = state.mode === "video" ? state.videoBlob : state.audioBlob
    if (blob && !state.isPlaying) {
      const url = URL.createObjectURL(blob)

      if (state.mode === "video" && videoRef.current) {
        videoRef.current.src = url
        videoRef.current.onended = () => {
          setState((prev) => ({ ...prev, isPlaying: false }))
          URL.revokeObjectURL(url)
        }
        videoRef.current.play()
      } else if (state.mode === "audio") {
        const audio = new Audio(url)
        audio.onended = () => {
          setState((prev) => ({ ...prev, isPlaying: false }))
          URL.revokeObjectURL(url)
        }
        audio.play()
        audioRef.current = audio
      }

      setState((prev) => ({ ...prev, isPlaying: true }))
    }
  }, [state.audioBlob, state.videoBlob, state.isPlaying, state.mode])

  const pausePlayback = useCallback(() => {
    if (state.isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (videoRef.current) {
        videoRef.current.pause()
      }
      setState((prev) => ({ ...prev, isPlaying: false }))
    }
  }, [state.isPlaying])

  const resetRecording = useCallback(() => {
    setState({
      isRecording: false,
      isPlaying: false,
      duration: 0,
      audioBlob: null,
      videoBlob: null,
      transcript: "",
      feedback: "",
      mode: state.mode,
    })
  }, [state.mode])

  const switchMode = useCallback(
    (mode: RecordingMode) => {
      if (!state.isRecording) {
        setState((prev) => ({
          ...prev,
          mode,
          audioBlob: null,
          videoBlob: null,
          transcript: "",
          feedback: "",
          duration: 0,
        }))
      }
    },
    [state.isRecording],
  )

  const hasRecording = state.mode === "video" ? state.videoBlob : state.audioBlob

  return (
    <div className="space-y-8">
      {/* Mode Selection */}
      <div className="flex justify-center">
        <div className="bg-slate-800/60 backdrop-blur-md p-1 rounded-xl border border-slate-700/50 shadow-lg shadow-blue-500/10">
          <Button
            onClick={() => switchMode("audio")}
            variant={state.mode === "audio" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "gap-2 transition-all duration-200 backdrop-blur-sm",
              state.mode === "audio"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30"
                : "hover:bg-slate-700/50 text-slate-300",
            )}
            disabled={state.isRecording}
          >
            <Mic className="w-4 h-4" />
            Audio Only
          </Button>
          <Button
            onClick={() => switchMode("video")}
            variant={state.mode === "video" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "gap-2 transition-all duration-200 backdrop-blur-sm",
              state.mode === "video"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30"
                : "hover:bg-slate-700/50 text-slate-300",
            )}
            disabled={state.isRecording}
          >
            <Video className="w-4 h-4" />
            Video + Audio
          </Button>
        </div>
      </div>

      {/* Video Preview */}
      {state.mode === "video" && (
        <div className="flex justify-center">
          <div className="relative">
            <div className="p-2 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl shadow-blue-500/10">
              <video
                ref={previewVideoRef}
                className={cn(
                  "w-80 h-60 bg-slate-900/50 rounded-xl border-2 transition-all duration-300",
                  state.isRecording ? "border-red-500/60 shadow-lg shadow-red-500/20" : "border-slate-600/40",
                )}
                muted
                playsInline
              />
              {state.isRecording && (
                <div className="absolute top-6 right-6 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  REC
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recording Interface */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-3 bg-slate-800/40 backdrop-blur-md rounded-full border border-slate-700/50 shadow-2xl shadow-blue-500/20">
            <Button
              onClick={state.isRecording ? stopRecording : startRecording}
              size="lg"
              className={cn(
                "w-28 h-28 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm",
                state.isRecording
                  ? "bg-red-500/90 hover:bg-red-500 animate-pulse scale-110 shadow-red-500/40 border border-red-400/30"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-blue-500/40 border border-blue-500/30 text-white",
              )}
            >
              {state.isRecording ? (
                <Square className="w-10 h-10" />
              ) : state.mode === "video" ? (
                <Video className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </Button>
          </div>
        </div>

        <div className="inline-block px-6 py-3 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg shadow-blue-500/10">
          <div className="text-3xl font-mono text-white font-bold">{formatTime(state.duration)}</div>
        </div>

        <p className="text-slate-300 text-lg font-medium">
          {state.isRecording ? `Recording ${state.mode}... Click to stop` : `Click to start ${state.mode} recording`}
        </p>
      </div>

      {/* Control Buttons */}
      {hasRecording && (
        <div className="flex justify-center gap-3">
          <Button
            onClick={state.isPlaying ? pausePlayback : playRecording}
            variant="outline"
            size="sm"
            className="gap-2 bg-slate-800/60 backdrop-blur-md border-slate-700/50 hover:bg-slate-700/60 text-slate-300 hover:text-white shadow-lg shadow-blue-500/10"
          >
            {state.isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play {state.mode === "video" ? "Video" : "Recording"}
              </>
            )}
          </Button>
          <Button
            onClick={resetRecording}
            variant="outline"
            size="sm"
            className="gap-2 bg-slate-800/60 backdrop-blur-md border-slate-700/50 hover:bg-slate-700/60 text-slate-300 hover:text-white shadow-lg shadow-blue-500/10"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      )}

      {/* Video Playback */}
      {state.mode === "video" && state.videoBlob && (
        <div className="flex justify-center">
          <div className="p-3 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl shadow-blue-500/10">
            <video
              ref={videoRef}
              className="w-96 h-72 bg-slate-900/50 rounded-xl border border-slate-600/40 shadow-lg"
              controls
              playsInline
            />
          </div>
        </div>
      )}

      {/* Live Transcript */}
      {state.isRecording && state.transcript && (
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl shadow-blue-500/10">
          <div className="p-6">
            <h3 className="font-semibold mb-3 text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Live Transcript:
            </h3>
            <p className="text-slate-300 leading-relaxed">{state.transcript}</p>
          </div>
        </div>
      )}

      {/* Final Transcript */}
      {!state.isRecording && state.transcript && (
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl shadow-blue-500/10">
          <div className="p-6">
            <h3 className="font-semibold mb-3 text-white">What you said:</h3>
            <p className="text-slate-300 leading-relaxed">{state.transcript}</p>
          </div>
        </div>
      )}

      {/* AI Feedback */}
      {state.feedback && (
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl shadow-blue-500/10">
          <div className="p-6">
            <h3 className="font-semibold mb-4 text-white text-lg">AI Feedback Analysis:</h3>
            <div className="prose prose-sm max-w-none text-slate-300">
              {state.feedback.split("\n").map((line, index) => {
                if (line.startsWith("##")) {
                  return (
                    <h2 key={index} className="text-lg font-bold text-white mt-4 mb-2">
                      {line.replace("##", "").trim()}
                    </h2>
                  )
                } else if (line.startsWith("###")) {
                  return (
                    <h3 key={index} className="text-base font-semibold text-blue-300 mt-3 mb-2">
                      {line.replace("###", "").trim()}
                    </h3>
                  )
                } else if (line.startsWith("•")) {
                  return (
                    <p key={index} className="ml-4 mb-1">
                      {line}
                    </p>
                  )
                } else if (line.trim()) {
                  return (
                    <p key={index} className="mb-2">
                      {line}
                    </p>
                  )
                }
                return <br key={index} />
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
