import { createTelemedAgent } from '../src';

// Basic usage example
async function main() {
    // Initialize the agent with minimal configuration
    const agent = createTelemedAgent({
        llm: {
            provider: 'openai',
            apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
        },
        organization: {
            name: 'Example Clinic',
            supportEmail: 'support@example.com',
        },
    });

    console.log('=== Telemed AI Agent - Basic Usage Example ===\n');

    // Get welcome message
    const welcome = agent.getWelcomeMessage();
    console.log('Welcome Message:');
    console.log(welcome);
    console.log('\n---\n');

    // Example 1: Simple symptom inquiry
    console.log('Example 1: Simple Symptom Inquiry');
    const response1 = await agent.chat({
        message: 'I have a headache that started this morning',
        sessionId: 'example-session-1',
    });
    console.log('User: I have a headache that started this morning');
    console.log('Agent:', response1.message);
    console.log('\n---\n');

    // Example 2: Follow-up question
    console.log('Example 2: Follow-up Question');
    const response2 = await agent.chat({
        message: "It's about a 6 out of 10 in severity",
        sessionId: 'example-session-1',
    });
    console.log("User: It's about a 6 out of 10 in severity");
    console.log('Agent:', response2.message);
    console.log('\n---\n');

    // Example 3: Emergency detection
    console.log('Example 3: Emergency Detection');
    const response3 = await agent.chat({
        message: 'I have crushing chest pain and difficulty breathing',
        sessionId: 'example-session-2',
    });
    console.log('User: I have crushing chest pain and difficulty breathing');
    console.log('Agent:', response3.message);
    if (response3.metadata?.emergencyDetected) {
        console.log('\n⚠️  EMERGENCY DETECTED!');
        console.log('Emergency Type:', response3.metadata.emergencyType);
    }
    console.log('\n---\n');

    console.log('Examples completed!');
}

// Run the example
main().catch(console.error);
