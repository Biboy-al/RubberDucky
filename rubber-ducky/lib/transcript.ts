import { useEffect, useState } from "react";
import { Form } from "react-hook-form";

async function urlToBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    return await response.blob();
}

async function blobUrlToFile(blobUrl: string, fileName:string){
    const blob = await urlToBlob(blobUrl);
    return new File([blob], fileName, {type:blob.type || 'audio/wav'})
}


export default function Transcribe() {
    const [script, setScript] = useState<string>("");

    const uploadAudio = async (blobUrl: string,endpoint: string) =>{
        const file = await blobUrlToFile(blobUrl, "audio.wav");
        const formData = new FormData();
        formData
        formData.append('audio', file);
    
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'x-gladia-key': process.env.NEXT_PUBLIC_GLADIA_API_KEY || '',
            },
            body: formData
        });

        const data = await response.json();

        console.log(data.audio_url)
    }

    return {uploadAudio};
}