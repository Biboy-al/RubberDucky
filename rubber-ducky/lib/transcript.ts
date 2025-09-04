import { useEffect, useState } from "react";
import { Form } from "react-hook-form";
import { start } from "repl";

async function urlToBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    return await response.blob();
}

async function blobUrlToFile(blobUrl: string, fileName:string){

    const blob = await urlToBlob(blobUrl);
    return new File([blob], fileName, {type:blob.type || 'audio/wav'})
}

export default function Transcribe() {

    const transctibeAudio = async (blobUrl: string) =>{

        const audio_data = await uploadAudio(blobUrl,"https://api.gladia.io/v2/upload");
        const audio_json = await audio_data.json();

        const trans_job_data = await startTranscription(audio_json.audio_url, "https://api.gladia.io/v2/pre-recorded");
        const trans_job_json = await trans_job_data.json();

        const trans_data = await getTranscript(trans_job_json.result_url, "https://api.gladia.io/v2/pre-recorded");
        const trans_json = await trans_data.json();

        return trans_json.result.transcript

    }

    const uploadAudio = async (blobUrl: string,endpoint: string) =>{
        const file = await blobUrlToFile(blobUrl, "audio.wav");
        const formData = new FormData();
        formData.append('audio', file);
    
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'x-gladia-key': process.env.NEXT_PUBLIC_GLADIA_API_KEY || '',
            },
            body: formData
        });

        return response;

    }


    const startTranscription = async (audioUrl: string, endpoint: string) =>{

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-gladia-key': process.env.NEXT_PUBLIC_GLADIA_API_KEY || '',
            },
            body: JSON.stringify({
                audio_url: audioUrl
            })
        });

        return response;

    }

    const getTranscript = async(transUrl: string, endpoint: string) =>{

        const params = new URLSearchParams();
        params.append("id", transUrl);

        const response = await fetch(`${endpoint}${params}`, {
            headers: {
                'x-gladia-key': process.env.NEXT_PUBLIC_GLADIA_API_KEY || '',
            },
        });

        return response;
    }


    return {uploadAudio};
}
