import { GoogleGenAI } from "@google/genai";



export async function getAiResponse(aiLevel:string, trans: string){

    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });


    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Write a short, curious, and simple reply as if you’re a ${aiLevel} hearing the explanation. This should include questions, confusion, or excitement a child might naturally express.]

            Also include areas of feedback in areas like: 

            Understanding Check:

            Did the explanation make sense overall?

            What parts were clear and easy to follow?

            What parts might have been confusing or hard to understand?

            Gaps in Knowledge:

            Point out missing details or assumptions the explainer made.

            Highlight areas where the explanation could go deeper or give more context.

            How to Improve & Make It More Engaging:

            Suggest ways to simplify complex parts (e.g., analogies, examples, stories).

            Recommend improvements to flow, clarity, or word choice.

            Suggest techniques to make it fun or memorable (e.g., visuals, metaphors, playful language).

            This is the user explaination: ${trans}
         `
      });

    console.log(response.text);

}