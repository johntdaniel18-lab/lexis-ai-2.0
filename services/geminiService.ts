// FIX: Import GenerateContentResponse to correctly type API call results.
import { GoogleGenAI, Chat, Type, Part, GenerateContentResponse } from "@google/genai";
import { IeltsTest, EssayFeedback, Improvement, Task1BandScores, Task2BandScores, VocabularyItem, ChatMessage } from "../types";
import { TASK_1_BAND_DESCRIPTORS, TASK_2_BAND_DESCRIPTORS } from "../bandDescriptors";
import { retrieveContext } from "./ragService";

const API_KEY_STORAGE_KEY = 'lexis-ai-api-key';

const withRetry = async <T,>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
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
        // This is a fallback; the UI should prevent empty submissions.
        throw new Error("API Key cannot be empty.");
    }
    try {
        // Use a temporary client for validation
        const ai = new GoogleGenAI({ apiKey });
        // A simple, low-cost call to verify the key, now with retry logic
        await withRetry(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'hello',
        }), 2, 500); // Retry twice with 500ms initial delay for login validation
        // If the call succeeds, the promise resolves, indicating a valid key.
    } catch (error: any) {
        console.error("API Key validation failed:", error);
        const errorMessage = error.toString();
        
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            throw new Error("API rate limit exceeded. Your key seems valid, but you've made too many requests. Please wait a moment and try again.");
        }
        
        if (errorMessage.includes('API key not valid') || errorMessage.includes('400')) {
             throw new Error("The provided Gemini API Key is invalid. Please double-check that you have copied it correctly and try again.");
        }
        
        // This can catch permission errors (403) or other issues.
        throw new Error("Could not verify the API Key. It may be invalid, lack the necessary permissions, or there could be a network issue.");
    }
};


const getAiClient = (): GoogleGenAI => {
    const apiKey = sessionStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
        throw new Error("API Key not found in session storage. Please log in again.");
    }
    return new GoogleGenAI({ apiKey });
};


const parseVocabularyAndText = (text: string): { text: string; vocabulary: VocabularyItem[] } => {
  const vocabRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(vocabRegex);

  if (match && match[1]) {
    try {
      let parsedJson = JSON.parse(match[1]);
      if (!Array.isArray(parsedJson)) {
        parsedJson = [parsedJson];
      }
      
      const vocabulary: VocabularyItem[] = parsedJson.filter(
        (item: any) => item && typeof item.word === 'string' && typeof item.definition === 'string' && typeof item.example === 'string'
      );
      
      const cleanedText = text.replace(vocabRegex, '').trim();
      return { text: cleanedText, vocabulary };
    } catch (e) {
      console.error("Failed to parse vocabulary JSON:", e);
      return { text, vocabulary: [] };
    }
  }

  return { text, vocabulary: [] };
};


export const startPreparationChat = async (test: IeltsTest, taskNumber: 1 | 2, targetScore: number, language: 'en' | 'vi'): Promise<{ session: Chat, firstMessage: string, vocabulary: VocabularyItem[] }> => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash';
  const task = test.tasks[taskNumber - 1];
  const languageName = language === 'vi' ? 'Vietnamese' : 'English';

  const commonRules = `
**LANGUAGE RULE:** You MUST conduct this entire conversation in ${languageName}.
**TERMINOLOGY RULE:** All specific IELTS terminology (e.g., Task 1, Task 2, Coherence and Cohesion, Lexical Resource) MUST ALWAYS remain in English.
**VOCABULARY RULE:** All vocabulary you provide in the JSON block (the word, its definition, and the example) MUST ALWAYS remain in English.`;

  const vocabularyPrompting = `First, in your conversational text, provide a concise list of 5-7 words. Next to each word, you MUST add a brief parenthetical explanation of why it's useful for this task. For example: "Here is some useful vocabulary: significant (to describe important changes), fluctuate (for data that goes up and down), steadily (for consistent trends)."
Second, immediately after that list, provide a separate JSON block with the full details for those words. The JSON should be enclosed in triple backticks like this: \`\`\`json [...] \`\`\`. Each item in the JSON array must have 'word' (string), 'definition' (string), and 'example' (string) keys. Ensure the JSON is well-formed and **entirely in English**.`;

  const concludingPrompt = `Immediately after providing the vocabulary, you MUST conclude your response by asking if they feel ready to start writing. Remind them to click the "I'm Ready to Write!" button when they are ready. Do not add any other text after this.`;

  const ragInstruction = `
**CORE INSTRUCTION:** For every question the student asks, you will be provided with CONTEXT from an expert knowledge base. You MUST base your answer primarily on this provided CONTEXT. If the context is not relevant, you can use your general knowledge but state that the provided information wasn't a perfect match.`;

  const task1SystemInstruction = `You are an expert IELTS writing tutor. Your student is aiming for a band score of ${targetScore}. 
Your goal is to guide them through analyzing Task 1.
${commonRules}
${ragInstruction}

Follow this structured 6-step process. Ask one question at a time. Do not move to the next step until the current one is complete.

Step 1: ANALYZE PROMPT. Ask the student to analyze the prompt by identifying the chart type, what it measures, and the time period. Guide them to paraphrase this for their introduction.

Step 2: IDENTIFY OVERVIEW. Ask the student to identify the single most outstanding feature or main trend from the chart/diagram. This will form their overview paragraph. Guide them until they have a clear, high-level understanding.

Step 3: IDENTIFY INDIVIDUAL TRENDS. Ask the student to describe the specific trend or key information for EACH subject/category shown in the data.

Step 4: ORGANIZE PARAGRAPHS. After identifying all individual trends, ask the student how they would group these subjects into two separate body paragraphs. Guide them towards a logical grouping (e.g., by similarity, by contrast).

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

Step 1: UNDERSTAND THE PROMPT. Help the student understand the question type and what it asks for.

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

  // FIX: Explicitly type the return value of withRetry to resolve 'unknown' type on response.
  const response = await withRetry<GenerateContentResponse>(() => chatSession.sendMessage({ message: messagePayload }));
  const { text, vocabulary } = parseVocabularyAndText(response.text);
  return { session: chatSession, firstMessage: text, vocabulary };
};

export const continuePreparationChat = async (session: Chat, message: string): Promise<{ text: string, vocabulary: VocabularyItem[] }> => {
  if (!session) {
    throw new Error("Chat session not initialized.");
  }

  // 1. Retrieve context from our local knowledge base
  const context = retrieveContext(message);
  
  // 2. Augment the user's message with the retrieved context and instructions
  const augmentedMessage = `
---
CONTEXT:
${context}
---

Based primarily on the CONTEXT above, please answer my question.
My Question: "${message}"
`;

  // 3. Send the augmented message to Gemini
  const response = await withRetry<GenerateContentResponse>(() => session.sendMessage({ message: augmentedMessage }));
  
  // 4. Parse the response as usual
  return parseVocabularyAndText(response.text);
};

export const getEssayOutlines = async (
  test: IeltsTest,
  chatHistoryTask1: ChatMessage[],
  chatHistoryTask2: ChatMessage[],
  targetScore: number,
  language: 'en' | 'vi'
): Promise<{ task1Outline?: string, task2Outline?: string }> => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash';
  const languageName = language === 'vi' ? 'Vietnamese' : 'English';

  const formatChatHistory = (history: ChatMessage[]): string => {
    if (history.length === 0) return "No conversation was had for this task.";
    // Filter out the augmented prompt details to keep the history clean
    return history.map(msg => {
        if (msg.sender === 'user' && msg.text.includes('CONTEXT:')) {
            const match = msg.text.match(/My Question: "([\s\S]*)"/);
            const cleanText = match ? match[1] : msg.text;
            return `Student: ${cleanText}`;
        }
        return `${msg.sender === 'ai' ? 'Tutor' : 'Student'}: ${msg.text}`;
    }).join('\n');
  };

  const hasTask1History = chatHistoryTask1.some(m => m.sender === 'user');
  const hasTask2History = chatHistoryTask2.some(m => m.sender === 'user');
  
  if (!hasTask1History && !hasTask2History) {
      return Promise.resolve({});
  }

  const prompt = `You are an expert IELTS writing tutor. Your student is aiming for a band score of ${targetScore}. 
  You have just completed a preparation session with them.
  Based on the test prompts and the conversation history provided below, your task is to generate a concise, bullet-pointed essay outline for the tasks they discussed.
  
  **GENERAL INSTRUCTIONS:**
  1.  **Language:** The entire outline MUST be written in ${languageName}.
  2.  **Format:** Use markdown. You MUST follow the structure specified for each task.

  ---
  ${hasTask1History ? `
  **TASK 1 DETAILS:**
  - **Task 1 Prompt:** "${test.tasks[0].prompt}"
  - **Task 1 Conversation History:**
  ---
  ${formatChatHistory(chatHistoryTask1)}
  ---

  **TASK 1 OUTLINE INSTRUCTIONS:**
  - You MUST generate an outline for Task 1.
  - The outline should NOT have topic sentences for body paragraphs.
  - It MUST be structured with headings (**Introduction**, **Overview**, **Body Paragraph 1**, **Body Paragraph 2**).
  - Under the body paragraph headings, list the specific, detailed data points and comparisons the student planned to write about, as discussed in the conversation.
  ` : `
  **TASK 1 INSTRUCTIONS:** The student did not discuss Task 1. Do not generate an outline for it.
  `}
  ---
  ${hasTask2History ? `
  **TASK 2 DETAILS:**
  - **Task 2 Prompt:** "${test.tasks[1].prompt}"
  - **Task 2 Conversation History:**
  ---
  ${formatChatHistory(chatHistoryTask2)}
  ---

  **TASK 2 OUTLINE INSTRUCTIONS:**
  - You MUST generate an outline for Task 2.
  - The outline MUST be structured with headings (**Introduction**, **Body Paragraph 1**, **Body Paragraph 2**, **Conclusion**).
  - Under each heading, use bullet points for the content (e.g., * Topic Sentence, * Supporting Idea, * Example).
  - Synthesize the key ideas and examples from the conversation.
  ` : `
  **TASK 2 INSTRUCTIONS:** The student did not discuss Task 2. Do not generate an outline for it.
  `}
  ---

  **YOUR RESPONSE:**
  Provide your response as a single JSON object. Do not include any text, markdown, or explanations outside of the JSON structure.
  The JSON object must only have keys for the tasks you were instructed to create outlines for. For example, if you created an outline for Task 1 but not Task 2, the JSON should only contain the "task1Outline" key.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      task1Outline: { type: Type.STRING, description: "A concise, markdown outline for the Task 1 essay, if one was requested." },
      task2Outline: { type: Type.STRING, description: "A concise, markdown outline for the Task 2 essay, if one was requested." }
    }
  };

  const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  }));

  return JSON.parse(response.text);
};


export const getEssayFeedback = async (test: IeltsTest, essay1: string, essay2: string, targetScore: number, language: 'en' | 'vi'): Promise<EssayFeedback> => {
  // Caching layer to ensure identical inputs get identical outputs
  const cacheKey = `feedback-cache::${essay1}::${essay2}::${targetScore}::${language}`;
  try {
    const cachedFeedback = sessionStorage.getItem(cacheKey);
    if (cachedFeedback) {
      console.log("Returning cached feedback.");
      return JSON.parse(cachedFeedback);
    }
  } catch (error) {
    console.warn("Could not read from session cache.", error);
  }

  const ai = getAiClient();
  const model = 'gemini-2.5-pro';
  
  const languageName = language === 'vi' ? 'Vietnamese' : 'English';
  
  const prompt = `You are an expert IELTS examiner evaluating two essays from an IELTS Academic Writing test. The student's target band score is ${targetScore}. Please tailor your feedback to help them bridge the gap between their current writing and their target. Produce a detailed analysis in JSON format.

**OFFICIAL IELTS WRITING BAND DESCRIPTORS (For your reference):**
---
[Band Descriptors for Task 1 and 2 are used for your internal evaluation]
---

**STUDENT'S GOAL & ESSAYS:**

**Target Band Score:** ${targetScore}

**Test Prompts:**
- Task 1: "${test.tasks[0].prompt}"
- Task 2: "${test.tasks[1].prompt}"

**Student's Essays:**
- Task 1 Essay:
---
${essay1}
---
- Task 2 Essay:
---
${essay2}
---


**YOUR EVALUATION INSTRUCTIONS (MUST be followed exactly):**
**CRITICAL SCORING RULE:** Your evaluation MUST be a direct and rigorous application of the provided IELTS Band Descriptors. Avoid holistic impressions; base your score purely on the evidence you have documented in the feedback text for each criterion. Your final score must be a logical consequence of this step-by-step analysis.

**Chain-of-Thought Scoring Process:** For each of the 4 criteria in BOTH tasks, you MUST follow this internal thought process before assigning a score:
    a. First, internally analyze the essay against the band descriptors for that specific criterion.
    b. Second, write down the detailed, actionable feedback paragraph explaining the strengths and weaknesses that justify a specific band score.
    c. FINALLY, based ONLY on the evidence documented in step 'b', assign the numerical score (1-9).

1.  **Language Requirement:** You MUST write all textual feedback (e.g., \`overallFeedback\`, the \`feedback\` for each criterion, \`strengths\`, \`areasForImprovement\`, and the \`explanation\` for each improvement) in **${languageName}**.
2.  **Terminology Rule:** All IELTS criteria keys (e.g., 'TaskAchievement', 'LexicalResource'), the names of the tasks ("Task 1", "Task 2"), and the overall JSON structure itself MUST remain in English. **Do not translate the JSON keys.**
3.  **Handle Empty or Underlength Essays:**
    - If the 'Task 1 Essay' is empty or has fewer than 20 words, you MUST assign a score of 1.0 for ALL Task 1 criteria (TaskAchievement, CoherenceAndCohesion, LexicalResource, GrammaticalRangeAndAccuracy) and provide feedback stating that the task was not attempted (in ${languageName}).
    - If the 'Task 2 Essay' is empty or has fewer than 20 words, you MUST assign a score of 1.0 for ALL Task 2 criteria (TaskResponse, CoherenceAndCohesion, LexicalResource, GrammaticalRangeAndAccuracy) and provide feedback stating that the task was not attempted (in ${languageName}).
4.  **Analyze Both Essays:** Read the prompts and the student's essays carefully.
5.  **Determine Individual Scores & Detailed Feedback:** For EACH task, provide a band score (1-9) AND a detailed, actionable feedback paragraph (2-3 sentences in ${languageName}) for each of the 4 criteria. The feedback MUST explain *why* the student received that score, referencing the official band descriptors, and provide specific advice on how to improve to reach their target score of ${targetScore}. The score and feedback must be in a nested object.
6.  **Determine Overall Score & Feedback:** Based on the individual scores, determine a single overall band score (1-9) for the entire test. Write a concise summary (in ${languageName}) of overall strengths and weaknesses, keeping the student's target score of ${targetScore} in mind.
7.  **Identify Strengths:** Provide 2-3 specific, positive comments (in ${languageName}) about what the student did well across both essays. Each strength should be a single string in an array.
8.  **Identify Areas for Improvement:** Provide the 3 most important areas for improvement that will help the student reach their target score of ${targetScore}. For each, provide a 'title' (in English, e.g., "Task Response") and 'feedback' (a short, actionable paragraph in ${languageName}).
9.  **Generate Specific Improvements:** Create a list of 10-15 specific, text-level improvement suggestions across both essays. Each improvement must include:
    - \`taskNumber\`: The task (1 or 2) where the original text is found.
    - \`originalText\`: The exact, shortest possible text snippet from the essay.
    - \`improvedText\`: The corrected or improved version. When a specific word or phrase is changed, you MUST use the markdown format "~~old text~~ **new text**" to clearly show the change.
    - \`explanation\`: A clear, concise explanation (in ${languageName}) of why the change helps.
    - \`criterion\`: The relevant official evaluation criterion (in English).
10. **Format Your Response:** You MUST respond ONLY with a JSON object that strictly follows the provided schema. Do not include any text, markdown, or explanations outside of the JSON structure.`;

  const criterionSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: "The score for this criterion (1-9)." },
        feedback: { type: Type.STRING, description: "Detailed feedback for this criterion." }
    },
    required: ['score', 'feedback']
  };

  const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.NUMBER, description: "Overall band score (1-9)." },
      overallFeedback: { type: Type.STRING, description: "A summary of strengths and areas for improvement." },
      detailedScores: {
        type: Type.OBJECT,
        description: "Band scores for each criterion for both tasks.",
        properties: {
          task1: {
            type: Type.OBJECT,
            properties: {
              TaskAchievement: criterionSchema,
              CoherenceAndCohesion: criterionSchema,
              LexicalResource: criterionSchema,
              GrammaticalRangeAndAccuracy: criterionSchema,
            },
            required: ['TaskAchievement', 'CoherenceAndCohesion', 'LexicalResource', 'GrammaticalRangeAndAccuracy']
          },
          task2: {
            type: Type.OBJECT,
            properties: {
              TaskResponse: criterionSchema,
              CoherenceAndCohesion: criterionSchema,
              LexicalResource: criterionSchema,
              GrammaticalRangeAndAccuracy: criterionSchema,
            },
            required: ['TaskResponse', 'CoherenceAndCohesion', 'LexicalResource', 'GrammaticalRangeAndAccuracy']
          }
        },
        required: ['task1', 'task2']
      },
      strengths: {
        type: Type.ARRAY,
        description: "An array of strings, where each string is a specific positive comment.",
        items: { type: Type.STRING }
      },
      areasForImprovement: {
        type: Type.ARRAY,
        description: "An array of objects detailing areas that need improvement.",
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Category of the improvement, e.g., 'Task Response'." },
                feedback: { type: Type.STRING, description: "Actionable feedback for this area." }
            },
            required: ['title', 'feedback']
        }
      },
      improvements: {
        type: Type.ARRAY,
        description: "A detailed list of specific text-level corrections.",
        items: {
            type: Type.OBJECT,
            properties: {
                taskNumber: { type: Type.NUMBER },
                originalText: { type: Type.STRING },
                improvedText: { type: Type.STRING },
                explanation: { type: Type.STRING },
                criterion: { type: Type.STRING, enum: ['TaskAchievement', 'TaskResponse', 'CoherenceAndCohesion', 'LexicalResource', 'GrammaticalRangeAndAccuracy'] },
            },
            required: ['taskNumber', 'originalText', 'improvedText', 'explanation', 'criterion']
        }
      },
    },
    required: ['overallScore', 'overallFeedback', 'detailedScores', 'strengths', 'areasForImprovement', 'improvements']
  };

  // FIX: Explicitly type the return value of withRetry to resolve 'unknown' type on response.
  const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: feedbackSchema,
      temperature: 0.1,
    },
  }));

  type ParsedFeedback = Omit<EssayFeedback, 'improvements'> & { improvements: Omit<Improvement, 'id' | 'source'>[] };
  const parsedFeedback = JSON.parse(response.text) as ParsedFeedback;
  
  // Post-process to add unique IDs and source
  const processedFeedback: EssayFeedback = {
    ...parsedFeedback,
    improvements: parsedFeedback.improvements.map((imp, index) => ({
      ...imp,
      id: `ai-${index}-${Date.now()}`,
      source: 'AI',
    }))
  };

  // Save to cache after successful API call
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(processedFeedback));
    console.log("Saved feedback to session cache.");
  } catch (error) {
    console.warn("Could not save feedback to session cache.", error);
  }

  return processedFeedback;
};