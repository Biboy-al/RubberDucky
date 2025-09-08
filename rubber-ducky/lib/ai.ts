import { GoogleGenAI } from "@google/genai";



export async function getAiResponse(trans: string){

    const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY" });


    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Explain how AI works in a few words",
      });

    console.log(response.text);

}