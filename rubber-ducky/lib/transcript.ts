import { useState } from "react";
import { getAiResponse } from "./ai";

async function urlToBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    return await response.blob();
}

async function blobUrlToFile(blobUrl: string, fileName: string) {
    const blob = await urlToBlob(blobUrl);
    return new File([blob], fileName, { type: blob.type || 'audio/wav' })
}

export default function Transcribe() {
    const [script, setScript] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("");

    const transcribeAudio = async (blobUrl: string) => {
        setIsLoading(true);
        setStatus("Starting transcription...");
        
        try {
            // Step 1: Upload audio
            const audio_data = await uploadAudio(blobUrl, "https://api.gladia.io/v2/upload/");
            const audio_json = await audio_data.json();
            
            console.log('Upload result:', audio_json);
            setStatus("Audio uploaded, starting transcription...");

            // Step 2: Start transcription
            const trans_job_data = await startTranscription(audio_json.audio_url, "https://api.gladia.io/v2/pre-recorded");
            const trans_job_json = await trans_job_data.json();
            
            console.log('Transcription job started:', trans_job_json);
            setStatus("Transcription started, polling for results...");

            // Step 3: Poll for results using the result_url
            const finalResult = await pollForTranscript(trans_job_json.result_url);
            
            // Step 4: Extract transcript
            const transcriptText = finalResult.result?.transcription?.full_transcript || 
                                 finalResult.result?.transcript || 
                                 "No transcript available";
            
            setScript(transcriptText);
            setStatus("Transcription completed!");
            // console.log('Final transcript:', transcriptText);

            getAiResponse(transcriptText);

        } catch (error) {
            console.error('Transcription failed:', error);
            setStatus(`Error: ${error}`);
        } finally {
            setIsLoading(false);
        }

        return 
    }

    const uploadAudio = async (blobUrl: string, endpoint: string) => {
        const file = await blobUrlToFile(blobUrl, "audio.wav");
        const formData = new FormData();
        formData.append('audio', file);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'X-Gladia-Key': process.env.NEXT_PUBLIC_GLADIA_API_KEY || '',
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        return response;
    }

    const startTranscription = async (audioUrl: string, endpoint: string) => {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Gladia-Key': process.env.NEXT_PUBLIC_GLADIA_API_KEY || '',
            },
            body: JSON.stringify({
                audio_url: audioUrl
            })
        });

        if (!response.ok) {
            throw new Error(`Transcription start failed: ${response.status}`);
        }

        return response;
    }

    // This function constantly polls the result_url until transcription is done
    const pollForTranscript = async (resultUrl: string): Promise<any> => {
        const maxAttempts = 60; // Maximum 60 attempts (5 minutes if polling every 5 seconds)
        const pollInterval = 5000; // Poll every 5 seconds
        
        console.log(`Starting to poll: ${resultUrl}`);

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                setStatus(`Polling attempt ${attempt}/${maxAttempts}...`);
                console.log(`Polling attempt ${attempt}...`);

                const response = await fetch(resultUrl, {
                    headers: {
                        'X-Gladia-Key': process.env.NEXT_PUBLIC_GLADIA_API_KEY || '',
                    },
                });

                if (!response.ok) {
                    console.error(`Polling failed with status: ${response.status}`);
                    throw new Error(`Polling failed: ${response.status}`);
                }

                const result = await response.json();
                console.log(`Attempt ${attempt} - Status: ${result.status}`);

                // Check the transcription status
                if (result.status === 'done') {
                    console.log('Transcription completed!');
                    return result;
                } else if (result.status === 'error') {
                    throw new Error('Transcription failed with error status');
                } else {
                    // Status is likely 'queued' or 'processing'
                    console.log(`Still processing... Status: ${result.status}`);
                }

                // Wait before the next poll (only if not the last attempt)
                if (attempt < maxAttempts) {
                    console.log(`Waiting ${pollInterval/1000} seconds before next poll...`);
                    await new Promise(resolve => setTimeout(resolve, pollInterval));
                }

            } catch (error) {
                console.error(`Polling attempt ${attempt} failed:`, error);
                
                // If it's the last attempt, throw the error
                if (attempt === maxAttempts) {
                    throw new Error(`Transcription timeout after ${maxAttempts} attempts`);
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
        }

        // This should never be reached due to the throw above, but just in case
        throw new Error('Transcription timeout - maximum polling attempts reached');
    }

    // Legacy function for direct URL polling (if you want to use it separately)
    const getTranscript = async (transUrl: string) => {
        const response = await fetch(transUrl, {
            headers: {
                'X-Gladia-Key': process.env.NEXT_PUBLIC_GLADIA_API_KEY || '',
            },
        });

        if (!response.ok) {
            throw new Error(`Get transcript failed: ${response.status}`);
        }

        return response;
    }

    return { 
        transcribeAudio, // Main function to call from your component
        uploadAudio,     // Individual functions if needed
        script,          // The final transcript
        isLoading,       // Loading state
        status           // Current status message
    };
}