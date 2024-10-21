// File: api/openai.js

export default async function handler(req, res) {
  // Set CORS headers to allow requests from your GitHub Pages site
  res.setHeader('Access-Control-Allow-Origin', 'https://vixdom.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  // Retrieve the OpenAI API key from the environment variables
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ message: 'API key not configured' });
  }

  try {
    // Call the OpenAI API with the request body
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: req.body.messages,
      }),
    });

    // Check if the response is okay
    if (!openAIResponse.ok) {
      throw new Error('Failed to communicate with OpenAI');
    }

    // Parse the JSON response from OpenAI
    const data = await openAIResponse.json();

    // Send the response back to the client
    res.status(200).json(data);
  } catch (error) {
    console.error('Error during OpenAI API call:', error);
    res.status(500).json({ message: 'Error communicating with OpenAI', error: error.message });
  }
}
