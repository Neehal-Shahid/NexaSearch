export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, context, contents, systemInstruction } = req.body;

  let apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is missing' });
  }

  let formattedMessages = [];
  if (contents) {
    // If frontend sends the exact Gemini payload (like AiMode.jsx does)
    formattedMessages = contents;
  } else if (messages && Array.isArray(messages)) {
    // Legacy format
    formattedMessages = messages.map((msg, index) => {
      let text = msg.content;
      if (index === 0 && context) {
        text = `Context from search results:\n${context}\n\nUser Question: ${text}`;
      }
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text }]
      };
    });
  } else {
    return res.status(400).json({ error: 'Invalid payload: missing contents or messages' });
  }

  const generateContent = async (modelName) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: formattedMessages,
        systemInstruction: systemInstruction || {
          parts: [{ text: "You are an intelligent search assistant for the Nexa Search engine. Use the provided search context to answer the user's questions if relevant. If the context does not contain the answer, or if the user asks a general question, use your own knowledge to help them. Keep your answers brief and readable." }]
        },
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  };

  try {
    // Try user's requested model first
    try {
      const data = await generateContent('gemini-3.5-flash-lite');
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } catch (e1) {
      console.warn('Fallback 1 triggered:', e1.message);
      try {
        const data = await generateContent('gemini-3.1-flash-lite');
        return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
      } catch (e2) {
        console.warn('Fallback 2 triggered:', e2.message);
        const data = await generateContent('gemini-3.5-flash-lite');
        return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
      }
    }
  } catch (error) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
}
