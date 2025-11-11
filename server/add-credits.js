require('dotenv').config();
const { Clerk } = require('@clerk/backend');

// Initialize Clerk client
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const userId = 'user_35JpfNnpZnaEqOpFouFhwZAONOg'; // From server logs
const creditsToAdd = 1000;

async function addCredits() {
  try {
    console.log(`Adding ${creditsToAdd} credits to user ${userId}...`);

    // Get current credits
    const user = await clerk.users.getUser(userId);
    const currentCredits = parseInt(user.publicMetadata.credits || 0);
    console.log(`Current credits: ${currentCredits}`);

    // Add credits
    const newCredits = currentCredits + creditsToAdd;
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        credits: newCredits
      }
    });

    console.log(`Successfully added ${creditsToAdd} credits!`);
    console.log(`New balance: ${newCredits}`);
  } catch (error) {
    console.error('Error adding credits:', error);
  }
}

addCredits();
