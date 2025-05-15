import openai, { OpenAI } from "openai";
import { ScrapedPageData } from "../crawler";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { relevanceInstructions } from "./instructions";
import { analyseInstructions, createPageAnalysisPrompt } from "./instructions";


const relevanceOutputSchema = z.object({
    pages: z.array(z.object({
        url: z.string(),
        content: z.string(),
    })),
});

const fieldSchema = z.object({
    label: z.string(),
    value: z.union([z.string(), z.number(), z.boolean()]),
});

const extractedDataItemSchema = z.object({
    fields: z.array(fieldSchema),
});

const analyseOutputSchema = z.object({
    extracted_data: z.array(extractedDataItemSchema),
    presentation_suggestions: z.array(
        z.object({
            template_type: z.string(),
            description: z.string(),
            suitability_reason: z.string(),
        })
    ),
});

export type OpenAIAnalysisResult = z.infer<typeof analyseOutputSchema> & { pageUrl: string };

export async function analyseResults(userExtractionRequest: string, results: ScrapedPageData[]) {
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    console.log("Sending relevance prompt to OpenAI");


    console.log(JSON.stringify([            {
        role: "developer",
        content: relevanceInstructions
    },
    {
        role: "user",
        content: createPageAnalysisPrompt(userExtractionRequest, results)
    }], null, 2));


    const relevanceResponse = await client.responses.create({
        model: "gpt-4o-mini",
        input: [
            {
                role: "developer",
                content: relevanceInstructions
            },
            {
                role: "user",
                content: createPageAnalysisPrompt(userExtractionRequest, results)
            }
        ],
        text: {
            format: zodTextFormat(relevanceOutputSchema, "output")
        }
    });

    const relevanceOutput = relevanceResponse.output_text;

    if (!relevanceOutput) {
        throw new Error("No relevance output received from OpenAI");
    }

    try {
        const relevanceOutputData = JSON.parse(relevanceOutput);
        console.log(JSON.stringify(relevanceOutputData, null, 2));
    } catch (error) {
        throw new Error("Invalid relevance output received from OpenAI");
    }

    const analysisPrompt = createPageAnalysisPrompt(userExtractionRequest, results);
    console.log("Sending prompt to OpenAI");

    console.log(JSON.stringify([
        {
            role: "developer",
            content: analyseInstructions
        },
        {
            role: "user",
            content: analysisPrompt
        }
    ], null, 2));

    const response = await client.responses.create({
        model: "gpt-4o-mini",
        input: [
            {
                role: "developer",
                content: analyseInstructions
            },
            {
                role: "user",
                content: analysisPrompt
            }
        ],

        text: {
            format: zodTextFormat(analyseOutputSchema, "output")
        }

    });

    const content = response.output_text;

    if (!content) {
        throw new Error("No content received from OpenAI");
    }

    try {
        const output = JSON.parse(content);
        console.log(JSON.stringify(output, null, 2));
        return output;
    } catch (error) {
        throw new Error("Invalid JSON received from OpenAI");
    }
}