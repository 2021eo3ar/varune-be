export interface BrandNarrativeParams {
  industry: string;
  brandValues: string[];
  targetAudience: string;
  brandMission: string;
  brandVision: string;
  usp: string;
  brandPersonality: string;
  toneOfVoice: string;
  keyProducts: string[];
  brandStory: string;
  narrativeLength: "short" | "long";
}

export const buildPrompt = (
  params?: BrandNarrativeParams,
  chatHistory?: { role: string; content: string }[],
  originalTask?: string,
  newInstruction?: string
): string => {
  let prompt = "";

  if (originalTask) {
    prompt += `Original Task/Goal: ${originalTask}\n`;
  } else {
    const {
      industry,
      brandValues,
      targetAudience,
      brandMission,
      brandVision,
      usp,
      brandPersonality,
      toneOfVoice,
      keyProducts,
      brandStory,
      narrativeLength,
    } = params;

    prompt += `You are a luxury brand strategist. Craft a compelling and emotionally engaging brand narrative based on the following inputs:\n\n`;
    prompt += `Industry: ${industry}\n`;
    prompt += `Brand Values: ${brandValues.join(", ")}\n`;
    prompt += `Target Audience: ${targetAudience}\n`;
    prompt += `Brand Mission: ${brandMission}\n`;
    prompt += `Brand Vision: ${brandVision}\n`;
    prompt += `Unique Selling Proposition: ${usp}\n`;
    prompt += `Brand Personality: ${brandPersonality}\n`;
    prompt += `Tone of Voice: ${toneOfVoice}\n`;
    prompt += `Key Products/Services: ${keyProducts.join(", ")}\n`;
    prompt += `Brand Story/Background: ${brandStory}\n\n`;

    prompt += `The narrative should emphasize exclusivity, emotion, and connection to high-end consumers.\n`;
    prompt += `Please generate a ${
      narrativeLength === "short"
        ? "concise (1-2 paragraphs)"
        : "detailed (3-5 paragraphs)"
    } narrative.\n\n`;

    // 👉 Format instruction
    prompt += `**Output Format:**\n`;
    prompt += `Title of Narrative: <Insert a short, captivating title here>\n`;
    prompt += `Narrative: <Write the brand narrative in paragraph form>\n`;
  }

  if (chatHistory && chatHistory.length > 0) {
    prompt += `\nChat History (for context):\n`;
    const lastMsg = chatHistory[chatHistory.length - 1];
    if (lastMsg) {
      prompt += `[${lastMsg.role.toUpperCase()}]: ${lastMsg.content}\n`;
    }
  }

  if (newInstruction) {
    prompt += `\nUser Follow-up Instruction: ${newInstruction}\n`;
  }

  return prompt;
};

