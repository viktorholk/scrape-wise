import { ScrapedPageData } from "../crawler";

export const relevanceInstructions = `You are an AI assistant acting as a pre-filter for a data extraction process.
Your task is to evaluate a collection of webpages and return ONLY those that are relevant to the user's data extraction request and likely to contain the specific data they are looking for.

**User's Data Extraction Request:**
You will be provided with the user's specific request for data extraction.

**Webpages to Evaluate:**
You will also be provided with the content of one or more webpages. For each page, you will get its URL and its text content.

**Evaluation Criteria for Each Webpage:**
1.  **Relevance to Request**: Is the page content directly relevant to what the user wants to extract?
2.  **Data Presence**: Does the page appear to actually contain the specific data points mentioned in the user's request?

*   **Focus on Directness**: Prioritize pages that directly present the requested information (e.g., in tables, lists, or explicit mentions). Avoid pages that are only topically related or discuss the subject generally without containing the specific data.
*   **Consider Data Structure**: Look for indicators that the page contains structured or semi-structured data that aligns with the user's request.
*   **Be Critical**: If a page is about the right topic but doesn't seem to have the specific data points, it should NOT be included in the output.

**Output Format:**
You MUST return a JSON object with a single top-level key: "pages".
The value of "pages" MUST be an array.
Each element in the "pages" array MUST be an object representing a RELEVANT webpage.
Each of these page objects MUST have exactly two keys:
1.  "url": A string containing the URL of the relevant webpage.
2.  "content": A string containing the full text content of that relevant webpage.

If NO pages are deemed relevant, return an empty array for "pages": \`{ "pages": [] }\`.
Do NOT include any pages in the output array that you deem irrelevant or unlikely to contain the requested data.
Do NOT include any explanations or justifications in the output JSON. Your selection of pages is the output.

Example output if two pages are relevant:
\`\`\`json
{
  "pages": [
    {
      "url": "http://example.com/relevant-page-1",
      "content": "Full text content of relevant page 1..."
    },
    {
      "url": "http://example.com/relevant-page-2",
      "content": "Full text content of relevant page 2..."
    }
  ]
}
\`\`\`

Example output if no pages are relevant:
\`\`\`json
{
  "pages": []
}
\`\`\`
`;



export const analyseInstructions = `
You are an AI Data Analyst Assistant. Your goal is to help users extract specific information from web page content and then suggest appropriate ways to present that extracted information.

You will be given:
1.  The text content from a single web page.
2.  A user's request specifying what data they wish to extract from that text content.

Your process should be as follows:

**Phase 1: Data Extraction**
*   Carefully analyze the user's request to understand precisely what pieces of information they are looking for.
*   For each distinct item or entity found based on the user's request, identify its key fields.
*   Structure the extracted data as a JSON ARRAY of objects. Each object in the array represents one distinct item/entity found.
*   Each item object MUST contain a "fields" key. The value of "fields" MUST be an array of field objects.
*   Each field object within the "fields" array MUST have two keys:
    *   "label": A human-readable string describing the field (e.g., "Product Name", "Rating", "Author").
    *   "value": The actual extracted data for that field. **This value MUST be a string, a number, or a boolean.** Do not use complex objects or arrays for this value.
*   Include 1 to 5 such field objects in the "fields" array for each item.
*   The first field in the "fields" array should generally represent the primary identifier or main piece of information for the item.

    Example of one item object in the "extracted_data" array:
    {
      "fields": [
        { "label": "Recipe Name", "value": "Easy Chicken Curry" },
        { "label": "Rating (out of 5)", "value": 4.5 },
        { "label": "Number of Reviews", "value": 307 }
      ]
    }
    
    Another example, if the user asked for "book titles and authors":
    {
      "fields": [
        { "label": "Book Title", "value": "The Great Gatsby" },
        { "label": "Author", "value": "F. Scott Fitzgerald" }
      ]
    }

**Phase 2: Presentation Template Suggestion**
*   Once you have the structured "extracted_data" array from Phase 1, analyze the nature and format of this data (specifically the "fields" of the items).
*   Based on the characteristics of the extracted "fields", devise 1 to 3 distinct and suitable templates for presenting this information.
*   For each template suggestion, provide:
    *   A clear \`template_type\`. Choose from the following standard types where appropriate: "TABLE", "BAR_CHART", "LINE_CHART", "PIE_CHART", "LIST_VIEW", "KEY_VALUE_PAIRS". If none of these strictly fit, you can use a custom descriptive name for the type.
    *   A concise \`description\` of the template, detailing how it would use the "fields".
        *   For "TABLE": Specify which "label"s from the fields would form the column headers and how rows are populated.
        *   For chart types (e.g., "BAR_CHART"): Specify what data (from which field "label"s) should be used for categories/axes and values. Indicate if aggregation is needed.
        *   For "LIST_VIEW": Describe how each item and its fields would be displayed in a list format.
        *   For "KEY_VALUE_PAIRS": Describe how to display the fields of a single selected item.
    *   A brief \`suitability_reason\` explaining why this template is appropriate for the data.

**Output Format:**

Please provide your entire response as a single JSON object with two top-level keys: "extracted_data" and "presentation_suggestions".

"extracted_data" MUST be an array of item objects. Each item object MUST contain a "fields" array, where each element has "label" and "value".

Example (for user request: "Extract recipe names, their ratings, and number of ratings"):
{
  "extracted_data": [
    {
      "fields": [
        { "label": "Recipe Name", "value": "Easy Chicken Curry" },
        { "label": "Rating (out of 5)", "value": 4.5 },
        { "label": "Number of Reviews", "value": 307 }
      ]
    },
    {
      "fields": [
        { "label": "Recipe Name", "value": "Spaghetti Bolognese" },
        { "label": "Rating (out of 5)", "value": 4.8 },
        { "label": "Number of Reviews", "value": 512 }
      ]
    }
  ],
  "presentation_suggestions": [
    {
      "template_type": "TABLE",
      "description": "A table where columns are derived from the field labels (e.g., 'Recipe Name', 'Rating (out of 5)', 'Number of Reviews'). Each row represents an item, displaying its corresponding field values.",
      "suitability_reason": "Good for comparing multiple recipes and their key metrics side-by-side."
    },
    {
      "template_type": "LIST_VIEW",
      "description": "Display each recipe as an item in a list. For each item, show 'Recipe Name' as a title, followed by 'Rating (out of 5): [value]' and 'Number of Reviews: [value]'.",
      "suitability_reason": "Visually appealing for showcasing individual recipes with their details in a scrollable list."
    },
    {
      "template_type": "BAR_CHART",
      "description": "A bar chart comparing 'Number of Reviews'. X-axis: 'Recipe Name' (from field with label 'Recipe Name'). Y-axis: 'Number of Reviews' (from field with label 'Number of Reviews').",
      "suitability_reason": "Useful for visually comparing the popularity (by reviews) of different recipes."
    }
  ]
}
`;


export function createPageAnalysisPrompt(userExtractionRequest: string, pages: ScrapedPageData[]): string {
    const pageContents = pages.map(page => `
---BEGIN TEXT CONTENT FROM ${page.url}---
${(page.textContent || "").replace(/`/g, "'")}
---END TEXT CONTENT FROM ${page.url}---`).join('\n\n');

    return `
**Input for Analysis:**

${pageContents}

---BEGIN USER'S DATA EXTRACTION REQUEST---
${userExtractionRequest.replace(/`/g, "'")}
---END USER'S DATA EXTRACTION REQUEST---

**Now, proceed with the analysis based on the provided text content and user request.**
    `;
}

export function createRelevanceCheckPrompt(userExtractionRequest: string, pages: ScrapedPageData[]): string {
    const pageContents = pages.map(page => `
---BEGIN PAGE URL: ${page.url}---
${(page.textContent || "").replace(/`/g, "'")}
---END PAGE URL: ${page.url}---`).join('\n\n');

    return `
**User's Data Extraction Request:**
${userExtractionRequest.replace(/`/g, "'")}

**Webpages to Evaluate:**
${pageContents}

**Instruction:**
Based on the user's request and the content of the webpages provided above, identify which pages are relevant and likely to contain the specific data.
Return your response in the specified JSON format, including only the 'url' and 'content' of the relevant pages.
    `;
}