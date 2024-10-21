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
    console.error('Invalid request method:', req.method);
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  // Retrieve the OpenAI API key from the environment variables
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error('Error: Missing OpenAI API key');
    return res.status(500).json({ message: 'API key not configured' });
  }

  try {
    // Log the incoming request body
    console.log('Incoming request body:', req.body);

    // Ensure req.body has the correct structure
    if (!req.body || !req.body.messages) {
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ message: 'Invalid request body' });
    }

    // Call the OpenAI API with the request body
    console.log('Calling OpenAI API...');
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

    // Log the response status and headers
    console.log('OpenAI API response status:', openAIResponse.status);
    console.log('OpenAI API response headers:', openAIResponse.headers);

    // Check if the response is okay
    if (!openAIResponse.ok) {
      const errorDetails = await openAIResponse.text();
      console.error('OpenAI API error response:', errorDetails);
      return res.status(openAIResponse.status).json({ message: 'Failed to communicate with OpenAI', details: errorDetails });
    }

    // Parse the JSON response from OpenAI
    const data = await openAIResponse.json();
    console.log('OpenAI API response data:', data);

    // Send the response back to the client
    res.status(200).json(data);
  } catch (error) {
    console.error('Error during OpenAI API call:', error);
    res.status(500).json({ message: 'Error communicating with OpenAI', error: error.message });
  }
}
