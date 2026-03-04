export const POST = async ({ request }) => {
    try {
        const { orgName } = await request.json();

        if (!orgName || !orgName.trim()) {
            return new Response(JSON.stringify({ error: "Organization name is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Try to find the organization's website and scrape it
        let websiteText = "";
        let foundUrl = "";

        // Common domain patterns to try
        const domainGuesses = [
            `${orgName.trim().toLowerCase().replace(/\s+/g, '')}.com`,
            `${orgName.trim().toLowerCase().replace(/\s+/g, '')}.in`,
            `${orgName.trim().toLowerCase().replace(/\s+/g, '-')}.com`,
            `www.${orgName.trim().toLowerCase().replace(/\s+/g, '')}.com`,
        ];

        for (const domain of domainGuesses) {
            try {
                const url = `https://${domain}`;
                const res = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                    },
                    signal: AbortSignal.timeout(4000)
                });
                if (res.ok) {
                    const html = await res.text();
                    websiteText = html
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
                        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
                        .replace(/<[^>]+>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim()
                        .slice(0, 12000);
                    foundUrl = url;
                    break;
                }
            } catch (e) {
                // try next domain
            }
        }

        const prompt = `
You are an intelligent business data extraction assistant. The user has provided an organization name: "${orgName}".

${websiteText ? `I found their website at ${foundUrl}. Here is the scraped text:\n\n${websiteText}\n\nBased on this text, extract the organization's details.` : `I could not find their website. Based on your internal knowledge and database, provide the organization's details if you know them. If you don't know, provide reasonable empty values.`}

Return a STRICT JSON object containing:
- "office_address": (The full registered office address of the organization. Include building/floor, street, city, state, pincode. If not found, return "")
- "entity_type": (One of: "Company", "Proprietorship", "Partnership", "LLP", "Firm". Determine from the organization's legal name or registration. For names ending in "Private Limited" or "Limited" use "Company", for "LLP" use "LLP", etc. If unsure, return "")
- "org_full_name": (The full legal name of the organization as registered. If unsure, return the input name as-is)

Important:
- ONLY output valid JSON. No markdown formatting, no explanations.
- For Indian organizations, prefer addresses from MCA/ROC records if known.
- If the organization name has "Pvt Ltd", "Private Limited", "Limited", "Inc" etc., the entity_type is "Company".
- If it has "LLP", entity_type is "LLP".
`;

        const apiKey = import.meta.env.GROQ_API_KEY || process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("GROQ_API_KEY is not defined");
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
                        content: "You are a specialized JSON-generating assistant for Indian business/organization data. Always output valid JSON."
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
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error looking up organization:", error);
        return new Response(JSON.stringify({ error: "Failed to look up organization" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
