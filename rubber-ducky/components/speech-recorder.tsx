"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, Play, Pause } from "lucide-react"

interface RecordingState {
  isRecording: boolean
  isPlaying: boolean 
  duration: number
  audioBlob: Blob | null
  transcript: string
  feedback: string
}

export default function SpeechRecorder() {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPlaying: false,
    duration: 0,
    audioBlob: null,
    transcript: "",
    feedback: "",
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Allows audio to be recorded in wav format
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      // Pushes data to chunks when availables
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      // When you stop recording it creates blobs from the chunks retrived from the media recorder
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" })
        // Creates a new state with previous state and adds the audio blob
        setState((prev) => ({ ...prev, audioBlob }))
        stream.getTracks().forEach((track) => track.stop())
      }

      // Start speech recognition if available
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        // Start up the transcription service
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        // call back for when we get a result and when it finishes
        recognition.onresult = (event: any) => {
          let transcript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          // Updates the transcript state
          setState((prev) => ({ ...prev, transcript }))
        }

        recognition.start()
        recognitionRef.current = recognition
      }

      // Start recording 
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()

      // Reset state and start recording
      setState((prev) => ({ ...prev, isRecording: true, duration: 0, transcript: "", feedback: "" }))

      // Start timer
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, duration: prev.duration + 1 }))
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
    

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }

    }
  }, [state.isRecording])

  // const playRecording = useCallback(() => {
  //   if (state.audioBlob && !state.isPlaying) {
  //     // Creates a url that points to temporary audio file
  //     const audioUrl = URL.createObjectURL(state.audioBlob)
  //     const audio = new Audio(audioUrl)

  //     audio.onended = () => {
  //       setState((prev) => ({ ...prev, isPlaying: false }))
  //       URL.revokeObjectURL(audioUrl)
  //     }

  //     audio.play()
  //     audioRef.current = audio
  //     setState((prev) => ({ ...prev, isPlaying: true }))
  //   }
  // }, [state.audioBlob, state.isPlaying])

  // const pausePlayback = useCallback(() => {
  //   if (audioRef.current && state.isPlaying) {
  //     audioRef.current.pause()
  //     setState((prev) => ({ ...prev, isPlaying: false }))
  //   }
  // }, [state.isPlaying])

  return (
    <div className="space-y-8">
      {/* Recording Interface */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Button
            onClick={state.isRecording ? stopRecording : startRecording}
            size="lg"
            className={`w-24 h-24 rounded-full transition-all duration-200 ${
              state.isRecording
                ? "bg-destructive hover:bg-destructive/90 animate-pulse"
                : "bg-primary hover:bg-primary/90 hover:scale-105"
            }`}
          >
            {state.isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>
        </div>

        <div className="text-2xl font-mono text-muted-foreground">{formatTime(state.duration)}</div>

        <p className="text-muted-foreground">
          {state.isRecording ? "Recording... Click to stop" : "Click to start recording"}
        </p>
      </div>
            {/* Lets you listen to your own recording */}
      {/* {state.audioBlob && (
        <div className="flex justify-center">
          <Button
            onClick={state.isPlaying ? pausePlayback : playRecording}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
          >
            {state.isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play Recording
              </>
            )}
          </Button>
        </div>
      )} */}

      {/* If it has somthing to say */}
      {state.transcript && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-card-foreground">What you said:</h3>
            <p className="text-muted-foreground leading-relaxed">{state.transcript}</p>
          </CardContent>
        </Card>
      )}

      {/* Feedback */}
      {state.feedback && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-card-foreground">AI Feedback:</h3>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{state.feedback}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


