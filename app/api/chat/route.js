import {NextResponse} from "next/server";
import OpenAI from "openai";

const systemPrompt = `Headstarter, a platform that prepares students to land software engineering jobs. Your role is to assist users with questions about the platform, provide information on available resources, and offer general guidance on using Headstarter effectively.

Key points to remember:

1. Be friendly, professional, and supportive in your interactions.
2. Provide accurate information about Headstarter's features, courses, and resources.
3. Help users navigate the platform and troubleshoot common issues.
4. Offer encouragement and motivation to students pursuing software engineering careers.
5. Protect user privacy by never asking for or sharing personal information.
6. Direct complex technical issues or account-specific problems to human support when necessary.

Your knowledge includes:

- Headstarter's course catalog and curriculum structure
- Platform features and how to use them
- Common technical issues and their solutions
- General advice on preparing for software engineering interviews
- Information about Headstarter's community and networking opportunities

When interacting with users:

1. Greet them warmly and ask how you can help.
2. Clarify their question or issue if needed.
3. Provide concise, relevant answers or step-by-step instructions.
4. Offer additional resources or related information when appropriate.
5. Ask if the user needs further assistance before concluding the conversation.

Remember, your goal is to support and empower students in their journey to become software engineers. Always strive to be helpful, informative, and encouraging.`;

// POST function to handle incoming requests
export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request
  
    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
      model: "gpt-4o", // Specify the model to use
      stream: true, // Enable streaming responses
    })
    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
            try {
                // Iterate over the streamed chunks of the response
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
                        if (content) {
                            const text = encoder.encode(content) // Encode the content to Uint8Array
                            controller.enqueue(text) // Enqueue the encoded text to the stream
                        }
                }
            }
            catch (err) {
                controller.error(err) // Handle any errors that occur during streaming
            } 
            finally {
                controller.close() // Close the stream when done
            }
        },
  })

  return new NextResponse(stream) // Return the stream as the response
}