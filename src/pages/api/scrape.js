export const POST = async ({ request }) => {
    try {
        const { domain } = await request.json();

        let websiteText = "";
        try {
            let url = domain.trim();
            if (!/^https?:\/\//i.test(url)) {
                url = 'https://' + url;
            }
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
                signal: AbortSignal.timeout(5000) // 5 seconds timeout
            });
            if (res.ok) {
                const html = await res.text();
                // Strip scripts, styles, and HTML tags to get raw text
                websiteText = html
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 10000); // Send up to 10k chars to LLM
            }
        } catch (e) {
            console.log("Could not fetch domain directly. Falling back to LLM internal knowledge.", e.message);
        }

        const prompt = `
You are an HR data extraction agent. The user has provided a candidate or Chartered Accountant firm website: "${domain}".

${websiteText ? `Here is the scraped text from their website:\n\n${websiteText}\n\nBased on this text, carefully extract the candidate's or firm's address.` : `Based ONLY on your internal database regarding this firm or person, please provide their actual address.`}

Return a STRICT JSON object containing:
- "complete_address": (The full address found on the website. This will be used as the candidate's residential/communication address).

Important:
- ONLY output valid JSON. No markdown formatting, no explanations.
`;

        const apiKey = import.meta.env.GROQ_API_KEY || process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("GROQ_API_KEY is not defined in environment variables");
            throw new Error("Missing API Key");
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are a specialized JSON-generating assistant. Always output valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Groq API error:", errorText);
            throw new Error(`Groq API returned ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content || "{}";
        const result = JSON.parse(responseText);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });

    } catch (error) {
        console.error("Error scraping domain:", error);
        return new Response(JSON.stringify({ error: "Failed to process domain" }), {
            status: 500
        });
    }
};
