const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { genkit, z } = require("genkit");
const { googleAI } = require("@genkit-ai/google-genai");

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

exports.vibeMatcher = onRequest({ secrets: [GEMINI_API_KEY], cors: true }, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    const prompt = req.body.prompt || "";
    if (!prompt || prompt.length < 10) {
        res.status(400).json({ success: false, error: "Prompt must be at least 10 characters." });
        return;
    }

    try {
        const ai = genkit({
            plugins: [googleAI({ apiKey: GEMINI_API_KEY.value() })],
        });

        const vibeMatcherPrompt = ai.definePrompt({
            name: 'vibeMatcherPrompt',
            model: 'googleai/gemini-2.5-flash',
            input: { schema: z.object({ prompt: z.string() }) },
            output: { 
                schema: z.object({ 
                    movie: z.object({ title: z.string(), type: z.literal("movie"), vibeReason: z.string() }),
                    show: z.object({ title: z.string(), type: z.literal("tv"), vibeReason: z.string() })
                }) 
            },
            prompt: `You are "The Vibe Matcher", a minimalist movie and TV show expert.
Based on the user's mood or scenario, suggest exactly one movie and one TV show that perfectly matches their vibe.
For each suggestion, provide the title, the type ("movie" or "tv"), and a short explanation (vibeReason) of why it fits their mood.

User's Vibe: {{{prompt}}}
`,
        });

        const result = await vibeMatcherPrompt({ prompt });
        
        res.status(200).json({
            success: true,
            data: result.output
        });
    } catch (error) {
        console.error("Vibe Matcher Error:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});
