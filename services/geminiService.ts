import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface ConversionOptions {
    strictFormatting: boolean;
    mathPriority: boolean;
    noImagePlaceholders: boolean;
}

export const convertLatexToHtml = async (latexCode: string, options: ConversionOptions): Promise<string> => {
    const model = 'gemini-3-pro-preview';

    const figureInstruction = options.noImagePlaceholders
        ? `3.  **Figures:** The user has opted out of image placeholders. Completely ignore any \`\\includegraphics\` commands.`
        : `3.  **Figures:** The user has provided only the LaTeX text. Where \`\\includegraphics\` is used, you cannot access the file. Instead, create a styled placeholder \`<div>\` with the specified image path as text content and a clear border. Include the figure caption (\`\\caption\`). The placeholder should be visually distinct (e.g., a dashed gray border and a message like "Image placeholder: [path]").`;
    
    const optionsPrompt: string[] = [];
    if (options.strictFormatting || options.mathPriority) {
        optionsPrompt.push("\n**User-Defined Priorities:**");
        if (options.strictFormatting) {
            optionsPrompt.push("- **Strict Formatting:** Prioritize preserving the exact visual layout and spacing as much as HTML allows. This is a high priority.");
        }
        if (options.mathPriority) {
            optionsPrompt.push("- **Math Priority:** Ensure mathematical equations are converted to MathML with the highest possible accuracy, even if it compromises some minor text formatting.");
        }
    }

    const prompt = `
You are a world-class document conversion engine. Your task is to convert the provided LaTeX source code into a single, self-contained HTML file that Microsoft Word can open and interpret accurately.

**Conversion Requirements:**

1.  **Structure & Formatting:** Preserve the original document structure, including sections, subsections, titles, authors, abstracts, lists, and emphasis (bold, italics).
2.  **Tables:** Convert LaTeX tables (\`tabular\`, \`table\` environments) into well-formed HTML tables (\`<table>\`, \`<tr>\`, \`<td>\`, \`<th>\`). Retain captions (\`\\caption\`). Use CSS for borders and alignment.
${figureInstruction}
4.  **Mathematics:** Convert mathematical equations (both inline \`$...\$\` and display \`$$...$$\` or \`equation\` environments) into MathML for maximum compatibility with modern word processors. If MathML is not possible, use Unicode characters for simple expressions.
5.  **Citations & References:** Format citations (e.g., \`\\cite{...}\`) and bibliographies (\`thebibliography\`) as plain text within the document flow.
6.  **Styling:** Use inline CSS within a \`<style>\` tag in the HTML \`<head>\`. The style should be professional and academic (e.g., Times New Roman or similar serif font, appropriate margins, font sizes for headings). The goal is to make the HTML look as close as possible to a compiled PDF from the LaTeX source.
7.  **Output Format:** Your entire response MUST be ONLY the raw HTML code. Do not wrap it in markdown backticks (\`\`\`html ... \`\`\`) or provide any conversational text before or after the HTML. The output must start with \`<!DOCTYPE html>\` or just the \`<html>\` tag and end with \`</html>\`.
${optionsPrompt.join('\n')}

Here is the LaTeX code to convert:
---
${latexCode}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        if (response && response.text) {
             // Clean up potential markdown code block fences
            let htmlContent = response.text;
            if (htmlContent.startsWith('```html')) {
                htmlContent = htmlContent.substring(7);
            }
            if (htmlContent.endsWith('```')) {
                htmlContent = htmlContent.slice(0, -3);
            }
            return htmlContent.trim();
        } else {
            throw new Error("The model could not convert the provided LaTeX.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('API key')) {
             throw new Error("Invalid API Key. Please check your configuration.");
        }
        throw new Error("Failed to communicate with the Gemini API.");
    }
};
