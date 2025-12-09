// FIX: Import GenerateContentResponse to correctly type API call results.
import { GoogleGenAI, Chat, Type, Part, GenerateContentResponse } from "@google/genai";
// FIX: Import CriterionScore to correctly type the getEssayFeedback placeholder.
import { IeltsTest, TestTask, EssayFeedback, Improvement, Task1BandScores, Task2BandScores, VocabularyItem, ChatMessage, DrillCriterion, DrillContent, DrillType, CriterionScore, StaticDrillModule, DetailedFeedback } from "../types";
import { TASK_1_BAND_DESCRIPTORS, TASK_2_BAND_DESCRIPTORS } from "../bandDescriptors";
import { retrieveContext } from "./ragService";

const API_KEY_STORAGE_KEY = 'lexis-ai-api-key';

/**
 * A robust JSON parser that extracts a JSON object or array from a string,
 * even if it's wrapped in markdown backticks.
 * @param text The raw string response from the AI.
 * @returns The parsed JSON object of type T.
 * @throws An error if no valid JSON is found or if parsing fails.
 */
const parseJsonResponse = <T>(text: string): T => {
  // Regex to find a JSON object or array, which might be wrapped in ```json ... ```
  const jsonRegex = /```json\s*([\s\S]*?)\s*```|({[\s\S]*}|\[[\s\S]*])/;
  const match = text.match(jsonRegex);

  if (!match) {
    console.error("Fatal: No JSON found in response text:", text);
    throw new Error("Failed to parse JSON response: No JSON object or array was found in the AI's output.");
  }
  
  // Group 1 is for markdown-wrapped JSON, Group 2 is for raw JSON object/array.
  let jsonString = (match[1] || match[2] || '').trim();

  if (!jsonString) {
      console.error("Fatal: Regex matched but extracted empty JSON string from text:", text);
      throw new Error("Failed to parse JSON response: A JSON block was detected but it was empty.");
  }
  
  // FIX: Robustness for trailing commas
  jsonString = jsonString.replace(/,(?=\s*[}\]])/g, '');

  try {
    return JSON.parse(jsonString);
  } catch (e: any) {
    console.error("Fatal: Failed to parse extracted JSON string.", {
      originalText: text,
      extractedJson: jsonString,
      error: e.message,
    });
    throw new Error(`Failed to parse JSON response. The AI returned malformed JSON. Details: ${e.message}`);
  }
};


const withRetry = async <T,>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 2000
): Promise<T> => {
  let retries = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await apiCall();
    } catch (error: any) {
      const errorMessage = error.toString();
      const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');

      if (isRateLimitError && retries < maxRetries) {
        retries++;
        console.warn(`Rate limit exceeded. Retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error(`API call failed after ${retries} retries or due to a non-retriable error.`);
        throw error;
      }
    }
  }
};

/**
 * Validates a Gemini API key by making a simple, low-cost API call.
 * Throws a specific, user-friendly error if validation fails.
 * @param apiKey The API key to validate.
 * @returns A promise that resolves if the key is valid.
 */
export const validateApiKey = async (apiKey: string): Promise<void> => {
    if (!apiKey) {
        throw new Error("API Key cannot be empty.");
    }
    try {
        const ai = new GoogleGenAI({ apiKey });
        await withRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'hello',
        }), 1, 1000);
    } catch (error: any) {
        console.error("API Key validation failed:", error);
        const errorMessage = error.toString();
        
        if (errorMessage.includes('Failed to execute') && (errorMessage.includes('Headers') || errorMessage.includes('ISO-8859-1'))) {
             throw new Error("The API Key contains invalid characters. Please ensure you have copied the key correctly without any extra spaces or symbols.");
        }
        
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("API Rate Limit Reached. This can happen if you perform actions too quickly or if your API key is being used on another device. Please wait one minute and try again.");
        }
        
        if (errorMessage.includes('API key not valid') || errorMessage.includes('400')) {
             throw new Error("The provided Gemini API Key is invalid. Please double-check that you have copied it correctly and try again.");
        }
        
        throw new Error("Could not verify the API Key. It may be invalid, lack the necessary permissions, or there could be a network issue.");
    }
};


const getAiClient = (explicitKey?: string): GoogleGenAI => {
    const apiKey = explicitKey || sessionStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
        // Fallback if process.env is available (e.g. configured build)
        if (typeof process !== 'undefined' && process.env.API_KEY) {
             return new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
        throw new Error("API Key not found. Please log in or provide a valid API Key.");
    }
    return new GoogleGenAI({ apiKey });
};


const parseVocabularyAndText = (text: string): { text: string; vocabulary: VocabularyItem[]; suggestions: string[] } => {
  const vocabRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(vocabRegex);
  // Always strip the JSON block from the text to be displayed, regardless of parse success.
  const cleanedText = text.replace(vocabRegex, '').trim();

  if (match && match[1]) {
    try {
      let jsonString = match[1].trim();
      // Remove trailing commas before closing braces/brackets to prevent parsing errors
      jsonString = jsonString.replace(/,(?=\s*[}\]])/g, '');

      const parsedJson = JSON.parse(jsonString);
      let vocabulary: VocabularyItem[] = [];
      let suggestions: string[] = [];

      if (Array.isArray(parsedJson)) {
        vocabulary = parsedJson;
      } else if (typeof parsedJson === 'object' && parsedJson !== null) { // Check for null
        if (Array.isArray(parsedJson.vocabulary)) {
          vocabulary = parsedJson.vocabulary;
        }
        if (Array.isArray(parsedJson.suggestions)) {
          suggestions = parsedJson.suggestions.map((s: any) => String(s));
        }
      }
      
      const validVocabulary: VocabularyItem[] = vocabulary.filter(
        (item: any) => item && typeof item.word === 'string' && typeof item.definition === 'string' && typeof item.example === 'string'
      );
      
      return { text: cleanedText, vocabulary: validVocabulary, suggestions };
    } catch (e) {
      console.error("Failed to parse JSON from chat response:", { error: e, originalJson: match[1] });
      // Return cleaned text even if JSON is invalid, so raw JSON is not displayed.
      return { text: cleanedText, vocabulary: [], suggestions: [] };
    }
  }

  // No JSON block found, return original text.
  return { text, vocabulary: [], suggestions: [] };
};


export const startPreparationChat = async (test: IeltsTest, taskNumber: 1 | 2, targetScore: number, language: 'en' | 'vi'): Promise<{ session: Chat, firstMessage: string, vocabulary: VocabularyItem[], suggestions: string[] }> => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash';
  const languageName = language === 'vi' ? 'Vietnamese' : 'English';
  const task = test.tasks[taskNumber - 1];
  
  const commonRules = `
**LANGUAGE RULE:** You MUST conduct this entire conversation in ${languageName}.
**STYLING RULE:** You MUST use Markdown's "bold" syntax (**text**) to emphasize critical keywords or phrases.
**READABILITY RULE:** Your responses MUST be easy to read. Use short, distinct paragraphs separated by a line break. Use bulleted lists (* item) for examples or multiple points. Keep sentences concise and direct.
**TERMINOLOGY RULE:** All specific IELTS terminology (e.g., Task 1, Task 2, Coherence and Cohesion, Lexical Resource) MUST ALWAYS remain in English.
**OUTPUT FORMAT RULE:** At the very end of *every* response, you MUST provide a JSON block enclosed in \`\`\`json ... \`\`\`. This JSON object MUST contain two keys:
1. "vocabulary": An array of objects (keys: 'word', 'definition', 'example') if you explicitly introduced new vocabulary in the text, otherwise an empty array.
2. "suggestions": An array of **exactly 3** short, direct questions in ${languageName} that follow these strict rules:
    - **Relevance:** Suggestions MUST be highly relevant and context-aware, guiding the student to the very next logical step in analyzing the specific chart/prompt.
    - **Conciseness:** Each suggestion MUST be a short, direct question, ideally under 10 words.
    - **Forbidden Content:** Do NOT ask generic questions about IELTS skills (e.g., 'What is paraphrasing?'). The focus must be on applying the skill to the current task.`;

  const vocabularyPrompting = `In Step 6 (or whenever you introduce vocabulary), first provide a concise list in the text. Then, ensure the full details are included in the "vocabulary" array of the JSON block at the end.`;

  const concludingPrompt = `Immediately after providing the vocabulary, you MUST conclude your response by asking if they feel ready to start writing. Remind them to click the "I'm Ready to Write!" button when they are ready. Do not add any other text after this.`;

  const ragInstruction = `
**KNOWLEDGE BASE RULE:** You have access to supplementary knowledge from an expert knowledge base called CONTEXT to help you answer student questions accurately. Use this information to inform your responses. However, you MUST NEVER mention the terms 'CONTEXT', 'knowledge base', 'provided information', or 'supplementary knowledge' in your conversation. Answer all questions naturally as if the knowledge is your own. If the provided CONTEXT is not relevant to the question, simply use your general expertise without mentioning the external information at all.`;
  
  const dataGroundingInstruction = task.keyInformation ? `
**CRITICAL DATA SOURCE:** You MUST use the following key information as the single source of truth for all statistics in this task. Do not infer or invent data. If the student mentions a number that contradicts this information, gently correct them using this data.
---
${task.keyInformation}
---
` : '';


  const task1SystemInstruction = `You are an expert IELTS writing tutor. Your student is aiming for a band score of ${targetScore}. 
Your goal is to guide them through analyzing Task 1.
${commonRules}
${ragInstruction}
${dataGroundingInstruction}

Follow this structured 6-step process. Ask one question at a time. Do not move to the next step until the current one is complete.

Step 1: ANALYZE PROMPT. Ask the student to analyze the prompt by identifying the chart type, what it measures, and the time period. Guide them to paraphrase this for their introduction.

Step 2: IDENTIFY OVERVIEW. Ask the student to identify the single most outstanding feature or main trend from the chart/diagram. This will form their overview paragraph. Guide them until they have a clear, high-level understanding.

Step 3: IDENTIFY INDIVIDUAL TRENDS. Ask the student to describe the specific trend or key information for EACH subject/category shown in the data.

Step 4: ORGANIZE PARAGRAPHS. After identifying all individual trends, ask the student how they would group these subjects into separate body paragraphs. Guide them towards a logical grouping (e.g., by similarity, by contrast).

Step 5: DETAIL THE PARAGRAPHS. Once the groups are decided, go through each planned body paragraph one by one. For each paragraph, ask the student to provide the specific data, numbers, and details they would write about for the subjects in that group. Check their numbers for accuracy against the prompt if possible.

Step 6: PROVIDE VOCABULARY. ONLY AFTER the student has detailed the content for BOTH body paragraphs, will you provide relevant vocabulary.
${vocabularyPrompting}

${concludingPrompt}

Keep your other responses concise and encouraging. Start the conversation now by introducing Task 1 and asking your first question for Step 1.`;
  
  const task2SystemInstruction = `You are an expert IELTS writing tutor. Your student is aiming for a band score of ${targetScore}. 
Your goal is to guide them through analyzing Task 2.
${commonRules}
${ragInstruction}

Follow this structured 6-step process. Ask one question at a time. Do not move to the next step until the current one is complete.

Step 1: UNDERSTAND THE PROMPT. Help the student to understand the question type and what it asks for.

Step 2: BRAINSTORM IDEAS. Guide them to brainstorm 2-3 main ideas that will become their body paragraphs.

Step 3: PLAN INTRODUCTION. After brainstorming, guide the student to plan their introduction, including how they will paraphrase the question and write a clear thesis statement that mentions their main ideas.

Step 4: DEVELOP BODY PARAGRAPHS. For each main idea, ask the student to think of a specific example or supporting detail.

Step 5: PLAN CONCLUSION. Guide the student to plan their conclusion by explaining how they will summarize their main points and restate their thesis.

Step 6: PROVIDE VOCABULARY. ONLY AFTER the student has a complete plan (intro, body paragraphs, and conclusion), will you provide relevant vocabulary.
${vocabularyPrompting}

${concludingPrompt}

Keep your other responses concise and encouraging. Start the conversation now by introducing Task 2 and asking your first question for Step 1.`;

  const systemInstruction = taskNumber === 1 ? task1SystemInstruction : task2SystemInstruction;


  const chatSession = ai.chats.create({
    model: model,
    config: { systemInstruction },
  });

  const textPrompt = `Here is the IELTS writing Task ${taskNumber} for our session:
Prompt: ${task.prompt}
Please begin the guided preparation for this task.`;

  const imageUrl = task.imageUrl;
  let messagePayload: string | (string | Part)[] = textPrompt;

  if (imageUrl) {
    const match = imageUrl.match(/^data:(image\/.*?);base64,(.*)$/);
    if (match) {
        const mimeType = match[1];
        const data = match[2];
        const imagePart = {
            inlineData: {
                mimeType,
                data,
            }
        };
        messagePayload = [imagePart, textPrompt];
    }
  }

  const response = await withRetry<GenerateContentResponse>(() => chatSession.sendMessage({ message: messagePayload }));
  const { text, vocabulary, suggestions } = parseVocabularyAndText(response.text);
  return { session: chatSession, firstMessage: text, vocabulary, suggestions };
};

export const continuePreparationChat = async (session: Chat, message: string): Promise<{ text: string, vocabulary: VocabularyItem[], suggestions: string[] }> => {
  if (!session) {
    throw new Error("Chat session not initialized.");
  }
  const context = retrieveContext(message);
  const augmentedMessage = `
---
CONTEXT:
${context}
---

Based primarily on the CONTEXT above, please answer my question.
My Question: "${message}"
`;
  const response = await withRetry<GenerateContentResponse>(() => session.sendMessage({ message: augmentedMessage }));
  return parseVocabularyAndText(response.text);
};


export const getEssayOutlines = async (
  test: IeltsTest,
  chatHistoryTask1: ChatMessage[],
  chatHistoryTask2: ChatMessage[],
  targetScore: number,
  language: 'en' | 'vi'
): Promise<{ task1Outline?: string; task2Outline?: string }> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash'; // Use flash model for cost-effectiveness
    const languageInstruction = language === 'vi' ? 'The entire outline MUST be in Vietnamese.' : 'The entire outline MUST be in English.';

    const createPrompt = (taskNum: 1 | 2, history: ChatMessage[]) => {
        if (history.length <= 1) return ""; // Not enough context
        return `
        --- TASK ${taskNum} CONTEXT ---
        Prompt: ${test.tasks[taskNum-1].prompt}
        Student's Chat History (for brainstorming ideas):
        ${history.map(m => `${m.sender}: ${m.text}`).join('\n')}

        Based on the chat history, create a clear, well-structured essay outline for Task ${taskNum}.
        Use Markdown for structure (headings, bullet points).
        This outline should guide a student aiming for a band score of ${targetScore}.
        ${languageInstruction}
        ---
        `;
    };

    const prompt = `
        You are an IELTS tutor. Based on the provided chat histories where you helped a student plan their essays, generate a final, structured essay outline for each task.

        If a task has no meaningful chat history, state that an outline cannot be generated for it.

        Return a JSON object with two keys: "task1Outline" and "task2Outline".

        ${createPrompt(1, chatHistoryTask1)}
        ${createPrompt(2, chatHistoryTask2)}
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            task1Outline: { type: Type.STRING },
            task2Outline: { type: Type.STRING },
        }
    };

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    }));

    return parseJsonResponse<{ task1Outline?: string; task2Outline?: string }>(response.text);
};

// --- TWO-PASS FEEDBACK REFACTOR ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface EditorFindings {
  improvements: Improvement[];
}

const getEditorFeedback = async (
  task: TestTask,
  essay: string,
  taskNumber: 1 | 2
): Promise<EditorFindings> => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash';

  const dataGroundingInstruction = task.keyInformation ? `
**FACT-CHECKING SOURCE:** You MUST use the following key information as the single source of truth for all statistics and facts in this task. Any deviation in the student's essay from this data should be flagged as an error under the 'TaskAchievement' or 'TaskResponse' criterion.
---
${task.keyInformation}
---
` : '';

  const prompt = `
  You are an AI Editor, focused solely on identifying errors and areas for improvement in an IELTS essay. Your task is to act as the first pass in a two-pass analysis system.
  
  **CRITICAL INSTRUCTIONS:**
  1.  **JSON ONLY:** Your entire response MUST be a single, valid JSON object that conforms to the provided schema.
  2.  **DO NOT SCORE:** You MUST NOT provide any band scores or overall performance judgments. Your job is only to find and list errors.
  3.  **FOCUS:** Your analysis must be limited to:
      -   **Grammar & Accuracy:** Grammatical errors, punctuation mistakes, incorrect sentence structure.
      -   **Lexical Resource:** Repetitive vocabulary, informal language, incorrect word choice (collocation).
      -   **Fact-Checking (if applicable):** Compare the essay against the provided 'KEY INFORMATION' and flag any factual inaccuracies.
      
  **TASK DATA:**
  - Task Prompt: ${task.prompt}
  ${dataGroundingInstruction}
  - Student's Essay: ${essay}

  **YOUR TASK:**
  Generate a list of "improvement" objects. Follow these rules STRICTLY for each object:
  -   'id': A unique ID for this improvement, e.g., "imp-1", "imp-2".
  -   'taskNumber': The task number, which is ${taskNumber}.
  -   'originalText': Quote the SHORTEST possible string from the essay that contains an error or could be improved. This MUST be a short phrase (2-5 words), NOT a full sentence.
  -   'improvedText': Provide ONLY the corrected or improved version of the 'originalText'.
  -   'explanation': Provide a short, clear reason for the change.
  -   'criterion': Link the improvement to ONE of the four official IELTS criteria ('TaskAchievement', 'TaskResponse', 'CoherenceAndCohesion', 'LexicalResource', 'GrammaticalRangeAndAccuracy').
  -   'source': This should always be 'AI'.
  `;

  const improvementSchema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      taskNumber: { type: Type.INTEGER },
      originalText: { type: Type.STRING },
      improvedText: { type: Type.STRING },
      explanation: { type: Type.STRING },
      criterion: { type: Type.STRING, enum: ['TaskAchievement', 'TaskResponse', 'CoherenceAndCohesion', 'LexicalResource', 'GrammaticalRangeAndAccuracy'] },
      source: { type: Type.STRING, enum: ['AI'] }
    },
    required: ['id', 'taskNumber', 'originalText', 'improvedText', 'explanation', 'criterion', 'source']
  };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      improvements: { type: Type.ARRAY, items: improvementSchema }
    },
    required: ['improvements']
  };

  const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  }));

  const result = parseJsonResponse<EditorFindings>(response.text);

  if (result.improvements) {
    // Ensure IDs are sequentially correct in case the AI messes up
    result.improvements.forEach((imp: Improvement, index: number) => {
        imp.id = `imp-${index + 1}`;
    });
  }
  return result;
};


const getExaminerFeedback = async (
  task: TestTask,
  essay: string,
  targetScore: number,
  editorFindings: EditorFindings,
  taskNumber: 1 | 2,
  language: 'en' | 'vi'
) => {
  const ai = getAiClient();
  const model = 'gemini-3-pro-preview'; // UPGRADED MODEL FOR ACCURACY
  const languageInstruction = language === 'vi' ? 'All feedback and explanations MUST be in Vietnamese, but keep IELTS-specific terms (like "Lexical Resource") in English.' : 'All feedback and explanations MUST be in English.';
  const bandDescriptors = taskNumber === 1 ? TASK_1_BAND_DESCRIPTORS : TASK_2_BAND_DESCRIPTORS;

  const prompt = `
  You are a Senior IELTS Examiner with 15 years of experience. You are performing the SECOND PASS of a two-pass analysis. The first pass, done by an "Editor", has already identified specific errors. Your job is to use these findings as EVIDENCE to provide a holistic, criteria-based score.

  **CRITICAL INSTRUCTIONS:**
  1.  **JSON ONLY:** Your entire response MUST be a single, valid JSON object that conforms to the provided schema for a single task.
  2.  **STRICT & ANALYTICAL:** You MUST be a strict grader. Justify your scores by explaining **how the essay meets the descriptors for that band and fails to meet the descriptors for the next band up.**
  3.  **USE THE EVIDENCE:** You MUST reference the 'Editor's Findings' below to justify your scores for Lexical Resource and Grammar. For example, if the editor found 5 grammatical errors, you must explain how this prevents the student from achieving a higher band score in Grammatical Range & Accuracy.
  4.  **HOLISTIC VIEW:** Your analysis for Task Achievement/Response and Coherence & Cohesion should be based on your own reading of the full essay.
  5.  **BAND CALIBRATION:** Calibrate all feedback to the student's target band score of ${targetScore}.

  **EXAMPLE OF JUSTIFICATION:**
  For a score of 6.0 in Lexical Resource, you might write in the 'detail' field: "The writer uses a sufficient range of vocabulary (e.g., 'mitigate', 'consequently'), meeting the Band 6 descriptor. **However**, occasional imprecise word choices (e.g., 'big problem' instead of 'significant issue') and a lack of less common vocabulary prevent a score of 7."

  **TEST & STUDENT DATA:**
  - Task Prompt: ${task.prompt}
  - Student's Essay: ${essay}
  - Editor's Findings (Evidence of Errors):
    ${JSON.stringify(editorFindings.improvements, null, 2)}
  
  - IELTS Band Descriptors (for your reference):
    ${bandDescriptors}

  **YOUR TASK:**
  Provide a detailed evaluation for this single task. Adhere strictly to the JSON schema.
  -   **Score Generation:** For each of the 4 criteria, provide a score and detailed feedback (positive, negative, suggestions).
  -   **overallTaskFeedback:** Write a constructive summary for THIS TASK ONLY.
  -   **strengths & areasForImprovement:** Identify 2-3 strengths and 2-3 weaknesses for THIS TASK ONLY.
  `;

    const structuredFeedbackDetailSchema = {
      type: Type.OBJECT,
      properties: {
          summary: { type: Type.STRING, description: "A single, concise summary sentence of the feedback point." },
          detail: { type: Type.STRING, description: "A detailed paragraph. Use Markdown's **bold** syntax to highlight critical keywords/phrases." }
      },
      required: ['summary', 'detail']
    };

    const detailedFeedbackSchema = {
      type: Type.OBJECT,
      properties: {
        positive: structuredFeedbackDetailSchema,
        negative: structuredFeedbackDetailSchema,
        suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 2-3 short, actionable suggestion strings presented as a checklist."
        },
      },
      required: ['positive', 'negative', 'suggestions']
    };

    const criterionScoreSchema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        feedback: detailedFeedbackSchema,
      },
      required: ['score', 'feedback']
    };

    const areaForImprovementSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            feedback: { type: Type.STRING }
        },
        required: ['title', 'feedback']
    };

    const task1Schema = {
      type: Type.OBJECT,
      properties: {
        TaskAchievement: criterionScoreSchema,
        CoherenceAndCohesion: criterionScoreSchema,
        LexicalResource: criterionScoreSchema,
        GrammaticalRangeAndAccuracy: criterionScoreSchema,
      },
      required: ['TaskAchievement', 'CoherenceAndCohesion', 'LexicalResource', 'GrammaticalRangeAndAccuracy']
    };

    const task2Schema = {
      type: Type.OBJECT,
      properties: {
        TaskResponse: criterionScoreSchema,
        CoherenceAndCohesion: criterionScoreSchema,
        LexicalResource: criterionScoreSchema,
        GrammaticalRangeAndAccuracy: criterionScoreSchema,
      },
      required: ['TaskResponse', 'CoherenceAndCohesion', 'LexicalResource', 'GrammaticalRangeAndAccuracy']
    };
    
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        overallTaskFeedback: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        areasForImprovement: { type: Type.ARRAY, items: areaForImprovementSchema },
        detailedScores: taskNumber === 1 ? task1Schema : task2Schema,
      },
      required: ['overallTaskFeedback', 'strengths', 'areasForImprovement', 'detailedScores']
    };

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    }));

    return parseJsonResponse<any>(response.text);
};


export const getEssayFeedback = async (
  test: IeltsTest,
  essay1: string,
  essay2: string,
  targetScore: number,
  language: 'en' | 'vi',
  onProgress: (status: string) => void
): Promise<EssayFeedback> => {
  const hasTask1 = essay1 && essay1.trim().length > 0;
  const hasTask2 = essay2 && essay2.trim().length > 0;
  const totalSteps = (hasTask1 ? 2 : 0) + (hasTask2 ? 2 : 0);
  let currentStep = 0;

  const COOL_DOWN_MS = 30000;

  let editorFindings1: EditorFindings | null = null;
  let editorFindings2: EditorFindings | null = null;
  let examinerFeedback1: any = null;
  let examinerFeedback2: any = null;

  if (hasTask1) {
    currentStep++;
    onProgress(`Step ${currentStep}/${totalSteps}: Analyzing Task 1 text for errors...`);
    editorFindings1 = await getEditorFeedback(test.tasks[0], essay1, 1);
    // BUG FIX: Prefix all Task 1 IDs to ensure uniqueness
    editorFindings1.improvements.forEach(imp => { imp.id = `t1-${imp.id}`; });
    
    onProgress(`Cooling down... (30s)`);
    await delay(COOL_DOWN_MS);

    currentStep++;
    onProgress(`Step ${currentStep}/${totalSteps}: Grading Task 1 based on findings...`);
    examinerFeedback1 = await getExaminerFeedback(test.tasks[0], essay1, targetScore, editorFindings1, 1, language);

    if (hasTask2) {
      onProgress(`Cooling down... (30s)`);
      await delay(COOL_DOWN_MS);
    }
  }

  if (hasTask2) {
    currentStep++;
    onProgress(`Step ${currentStep}/${totalSteps}: Analyzing Task 2 text for errors...`);
    editorFindings2 = await getEditorFeedback(test.tasks[1], essay2, 2);
    // BUG FIX: Prefix all Task 2 IDs to ensure uniqueness
    editorFindings2.improvements.forEach(imp => { imp.id = `t2-${imp.id}`; });

    onProgress(`Cooling down... (30s)`);
    await delay(COOL_DOWN_MS);

    currentStep++;
    onProgress(`Step ${currentStep}/${totalSteps}: Grading Task 2 based on findings...`);
    examinerFeedback2 = await getExaminerFeedback(test.tasks[1], essay2, targetScore, editorFindings2, 2, language);
  }

  onProgress("Finalizing scores and report...");

  const allImprovements = [
    ...(editorFindings1?.improvements || []),
    ...(editorFindings2?.improvements || [])
  ];
  
  const overallFeedback = [examinerFeedback1?.overallTaskFeedback, examinerFeedback2?.overallTaskFeedback].filter(Boolean).join('\n\n');
  const strengths = [...(examinerFeedback1?.strengths || []), ...(examinerFeedback2?.strengths || [])];
  const areasForImprovement = [...(examinerFeedback1?.areasForImprovement || []), ...(examinerFeedback2?.areasForImprovement || [])];
  
  const boilerplateScore: CriterionScore = { score: 0, feedback: { positive: { summary: 'Not submitted.', detail: '' }, negative: { summary: 'Not submitted.', detail: '' }, suggestions: [] } };
  
  const finalDetailedScores = {
    task1: examinerFeedback1?.detailedScores || { TaskAchievement: boilerplateScore, CoherenceAndCohesion: boilerplateScore, LexicalResource: boilerplateScore, GrammaticalRangeAndAccuracy: boilerplateScore },
    task2: examinerFeedback2?.detailedScores || { TaskResponse: boilerplateScore, CoherenceAndCohesion: boilerplateScore, LexicalResource: boilerplateScore, GrammaticalRangeAndAccuracy: boilerplateScore }
  };

  const roundToHalf = (value: number): number => Math.round(value * 2) / 2;
  const calculateTaskAverage = (scores: any, task: 1 | 2): number => {
    if (!scores) return 0;
    const criteria = task === 1 
      ? [scores.TaskAchievement, scores.CoherenceAndCohesion, scores.LexicalResource, scores.GrammaticalRangeAndAccuracy]
      : [scores.TaskResponse, scores.CoherenceAndCohesion, scores.LexicalResource, scores.GrammaticalRangeAndAccuracy];
    const validScores = criteria.filter(c => c && typeof c.score === 'number').map(c => c!.score);
    if (validScores.length === 0) return 0;
    return validScores.reduce((a, b) => a + b, 0) / validScores.length;
  };

  const task1Average = calculateTaskAverage(finalDetailedScores.task1, 1);
  const task2Average = calculateTaskAverage(finalDetailedScores.task2, 2);

  let rawOverallScore = 0;
  if (hasTask1 && hasTask2) {
    rawOverallScore = (task1Average + (task2Average * 2)) / 3;
  } else if (hasTask1) {
    rawOverallScore = task1Average;
  } else if (hasTask2) {
    rawOverallScore = task2Average;
  }
  
  const finalOverallScore = roundToHalf(rawOverallScore);

  const finalResult: EssayFeedback = {
    overallScore: finalOverallScore,
    overallFeedback,
    improvements: allImprovements,
    strengths,
    areasForImprovement,
    detailedScores: finalDetailedScores,
  };
  
  return finalResult;
};


export const generateModelAnswer = async (prompt: string, taskNumber: 1 | 2): Promise<string> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash'; // Use Flash for speed and higher rate limits

    const systemInstruction = `You are an expert IELTS writer. Write a band 9 model answer for the given IELTS Writing Task ${taskNumber}. The response should be a well-structured, academic-style essay. Do not include any extra commentary, just the essay itself.`;

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model,
        contents: prompt,
        config: { systemInstruction },
    }));

    return response.text;
};


export const generateDrillContent = async (criterion: DrillCriterion, topic: string): Promise<DrillContent> => {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';

    const drillTypeMap: { [key in DrillCriterion]: DrillType[] } = {
        TaskFulfillment: ['SUPPORTING_IDEA'],
        CoherenceAndCohesion: ['CONNECTOR_CHOICE', 'SENTENCE_COMBINING'],
        LexicalResource: ['VOCABULARY_REPLACEMENT'],
        GrammaticalRangeAndAccuracy: ['GRAMMAR_ERROR_CORRECTION', 'SENTENCE_REWRITE_ERROR', 'VERB_CONJUGATION', 'PUNCTUATION_CHOICE']
    };

    const drillTypes = drillTypeMap[criterion];
    const selectedType = drillTypes[Math.floor(Math.random() * drillTypes.length)];

    const prompt = `
    Create a single, short IELTS writing drill based on the following parameters. Respond strictly with a JSON object matching the schema.

    - **Criterion to Target:** ${criterion}
    - **Topic:** ${topic}
    - **Drill Type:** ${selectedType}

    **Instructions for Drill Types:**
    - **SUPPORTING_IDEA:** Provide a main idea. The choices should be one relevant supporting example and three irrelevant ones.
    - **CONNECTOR_CHOICE:** Provide a sentence with a blank. The choices should be one correct linking word and three incorrect ones.
    - **VOCABULARY_REPLACEMENT:** Provide a sentence with a basic word/phrase. The 'modelAnswer' should be the sentence with a more advanced, academic equivalent. Provide an explanation.
    - **SENTENCE_COMBINING:** Provide two simple sentences. The 'modelAnswer' should be one complex sentence that combines them logically.
    - **GRAMMAR_ERROR_CORRECTION:** Provide a sentence with a common grammatical error (e.g., subject-verb agreement, tense). The choices should be variations, one of which is correct.
    - **SENTENCE_REWRITE_ERROR:** Provide an incorrect sentence. The student must rewrite it correctly in a text box. Provide a 'modelAnswer' and 'explanation'.
    - **VERB_CONJUGATION:** Provide a sentence with a verb in parentheses. The student must type the correct form.
    - **PUNCTUATION_CHOICE:** Provide 4 sentences as choices, one of which is correctly punctuated.

    Make the drill relevant to the given topic. The title should be concise and engaging.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, enum: Object.values(drillTypeMap).flat() },
            title: { type: Type.STRING },
            instructions: { type: Type.STRING },
            taskContent: { type: Type.STRING },
            modelAnswer: { type: Type.STRING },
            choices: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
        },
        required: ['type', 'title', 'instructions', 'taskContent']
    };

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    }));

    return parseJsonResponse<DrillContent>(response.text);
};


export const generateDrillFromRawText = async (rawText: string, apiKey?: string): Promise<StaticDrillModule> => {
    const ai = getAiClient(apiKey);
    const model = 'gemini-2.5-flash';

    const prompt = `
    Analyze this educational text. Extract the key teaching points into a Markdown lesson summary. 
    Then, generate structured Question Groups based strictly on this content.
    
    Your goal is to help a student learn the concepts in the text.
    
    Raw Text:
    """
    ${rawText}
    """
    
    Return the result as a JSON object matching the hierarchical schema provided.
    Create at least 2 Groups.
    
    - For 'MCQ' groups: Provide questions with options.
    - For 'NOTES_COMPLETION' groups: Provide a 'content' string with placeholders like {{q1}}, {{q2}} and a corresponding 'questions' array where the ID matches (e.g. "q1").
    - For 'MATCHING' groups: Provide 'sharedOptions' (the answers) and 'questions' (the terms/prompts).
    
    For the 'category' field, choose from: 'Grammar', 'Vocabulary', 'Coherence', 'Task Response'.
    For the 'difficulty' field, choose from: 'Beginner', 'Intermediate', 'Advanced'.
    For 'tags', extract 3-5 relevant keywords.
    `;

    const questionSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING, description: "Question prompt or matching term" },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Options for MCQ only" },
            correctAnswer: { type: Type.STRING, description: "The answer string or index" },
            explanation: { type: Type.STRING }
        },
        required: ['id', 'correctAnswer']
    };

    const groupSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['MCQ', 'NOTES_COMPLETION', 'MATCHING'] },
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            content: { type: Type.STRING, description: "HTML text for Notes Completion with {{id}} placeholders" },
            sharedOptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Shared options for Matching" },
            questions: { type: Type.ARRAY, items: questionSchema }
        },
        required: ['id', 'type', 'questions']
    };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Grammar', 'Vocabulary', 'Coherence', 'Task Response'] },
            difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            lessonContent: { type: Type.STRING },
            groups: { 
                type: Type.ARRAY, 
                items: groupSchema
            }
        },
        required: ['title', 'description', 'category', 'difficulty', 'tags', 'lessonContent', 'groups']
    };

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    }));

    return parseJsonResponse<StaticDrillModule>(response.text);
};