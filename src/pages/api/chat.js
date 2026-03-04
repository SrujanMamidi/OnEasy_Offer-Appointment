export const POST = async ({ request }) => {
    try {
        const { message, extractedData } = await request.json();

        const prompt = `
You are an intelligent, professional HR document assistant.

Your goal is to collect exactly these 5 required fields from the user to generate an Offer & Appointment Letter:
1. employee_full_name (e.g., John Doe)
2. employee_title (e.g., Mr., Ms., or Mrs.)
3. complete_address (CANDIDATE'S Home/Residential Address)
4. designation (e.g., Audit Manager)
5. annual_ctc (number in figures, e.g. 600000)
6. reporting_manager (Manager's designation, e.g., Senior Partner)

### CRITICAL RULES (MANUAL MODE BEHAVIOR)
- Ask questions ONE AT A TIME in a logical order. DO NOT ask multiple questions at once!
- If the user provides multiple fields in a single message, extract all of them, update state, and skip those questions.
- NEVER repeat a question if the information is already extracted in the Current State.
- If the user gives their home address, map it strictly to \`complete_address\`.
- If the user provides a name/title like "Srujan Mamidi" or "Mr. Srujan", immediately capture both "employee_full_name" and "employee_title" (inferring title if obvious from context, else leave title blank but DO NOT re-ask for the name).

### Current State
We have already extracted these fields:
${JSON.stringify(extractedData, null, 2)}

### User Message
"${message}"

### Task
1. Analyze the User Message. Extract any new fields from the list above that the user is providing.
2. If the user provides a CTC, extract \`annual_ctc\` as a plain number (e.g., "10 lakh" -> "1000000", "25,00,000" -> "2500000").
3. DO NOT extract or invent date fields.
4. Check the extracted fields against the required 6 fields list. Pick EXACTLY 1 missing field that you still need.
5. Create a VERY SHORT, simple, and direct question for that 1 missing field. DO NOT repeat what the user already told you. Acknowledge received information briefly before moving forward.
   Example Good Reply: "Thank you. Now please provide the employee's designation."
   Example Good Reply: "Got it. What is the candidate's complete address?"
6. Return your response STRICTLY as a JSON object matching this schema:
{
  "extracted": {
    "field_name": "value"
  },
  "reply": "[Your 1 sentence direct question here]"
}

Do not include markdown blocks like \`\`\`json around your response. Return ONLY valid JSON.
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
            throw new Error(`Groq API returned ${response.status} `);
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
        console.error("Error calling Groq:", error);
        return new Response(JSON.stringify({ error: "Failed to process chat" }), {
            status: 500
        });
    }
};
