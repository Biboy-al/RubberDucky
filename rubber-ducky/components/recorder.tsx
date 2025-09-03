"use client"

import { Speech } from "lucide-react";
import { Button } from "./ui/button";
import { ReactMediaRecorder } from "react-media-recorder";


export default function Recorder() {
    
    const SpeechRecogniton = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecogniton();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';



    return (
        <>
            <div className="flex flex-col items-center w-full text-white">
                <h1>HII</h1>

                <ReactMediaRecorder render={ ({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                    <div>
                        audioContext.create
                        <p>{status}</p>
                        <Button onClick={startRecording} className="mr-4">Start Recording</Button>
                        <Button onClick={stopRecording}>Stop Recording</Button>
                        <audio src={mediaBlobUrl} controls />
                    </div>
                )}/>
            </div>
            
        </>
    );

}