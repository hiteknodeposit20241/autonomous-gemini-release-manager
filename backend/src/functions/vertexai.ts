import {
  HarmCategory,
  HarmBlockThreshold,
  VertexAI,
} from '@google-cloud/vertexai';

export async function vertexGenerateContent({
  userContent,
  systemContent,
  model = 'gemini-1.5-flash-002',
}: {
  userContent: string;
  systemContent?: string;
  model?: string;
}) {
  // Initialize Vertex with your Cloud project and location
  const vertex_ai = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT_ID,
    location: process.env.GOOGLE_CLOUD_LOCATION,
  });

  // Instantiate the models
  const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 1,
      topP: 0.95,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  });

  const result = await generativeModel.generateContent({
    contents: [
      ...(systemContent
        ? [{ role: 'assistant', parts: [{ text: systemContent }] }]
        : []),
      { role: 'user', parts: [{ text: userContent }] },
    ],
  });
  return result.response.candidates?.[0].content.parts?.[0].text;
}
