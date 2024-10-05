
const { PrismaClient } = require('@prisma/client'); // Import PrismaClient
const prisma = new PrismaClient(); // Create an instance of PrismaClient
const crypto = require('crypto'); // Import the crypto module

function generateUUID() {
  return crypto.randomUUID();
}

async function main() {
  // Delete existing records to avoid unique constraint violations
  await prisma.activeEditor.deleteMany();
  await prisma.sharedNote.deleteMany();
  await prisma.noteTag.deleteMany();
  await prisma.note.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.account.deleteMany();
  await prisma.userAuthMethod.deleteMany();
  await prisma.user.deleteMany();

  console.log('Deleted existing records.');

  // Create users and get their IDs
  const alice = await prisma.user.create({
    data: {
      id: generateUUID(),
      username: 'alice_smith',
      password_hash: '$2b$12$e.gO4Wg6IvR1ZAl/Fr8Uuey4BfV6gi3EYuk/JOnUNy6Br1ZeF59ye',
      email: 'alice@example.com',
      emailVerified: new Date(),
      image: 'https://example.com/images/alice.jpg',
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: generateUUID(),
      username: 'bob_johnson',
      password_hash: '$2b$12$e.gO4Wg6IvR1ZAl/Fr8Uuey4BfV6gi3EYuk/JOnUNy6Br1ZeF59ye',
      email: 'bob@example.com',
      emailVerified: null,
      image: 'https://example.com/images/bob.jpg',
    },
  });

  const charlie = await prisma.user.create({
    data: {
      id: generateUUID(),
      username: 'charlie_brown',
      password_hash: '$2b$12$e.gO4Wg6IvR1ZAl/Fr8Uuey4BfV6gi3EYuk/JOnUNy6Br1ZeF59ye',
      email: 'charlie@example.com',
      emailVerified: new Date(),
      image: 'https://example.com/images/charlie.jpg',
    },
  });

  // Insert mock user authentication methods
  await prisma.userAuthMethod.createMany({
    data: [
      { user_id: alice.id, isOAuth: true, isManual: false },
      { user_id: bob.id, isOAuth: false, isManual: true },
      { user_id: charlie.id, isOAuth: true, isManual: true },
    ],
  });

  // Insert mock accounts
  await prisma.account.createMany({
    data: [
      {
        user_id: alice.id,
        type: 'oauth',
        provider: 'google',
        provider_account_id: 'google-provider-account',
        refresh_token: 'refresh_token_1',
        access_token: 'access_token_1',
        token_type: 'Bearer',
      },
      {
        user_id: bob.id,
        type: 'oauth',
        provider: 'github',
        provider_account_id: 'github-provider-account',
        refresh_token: 'refresh_token_2',
        access_token: 'access_token_2',
        token_type: 'Bearer',
      },
      {
        user_id: charlie.id,
        type: 'manual',
        provider: 'email',
        provider_account_id: 'email-provider-account',
      },
    ],
  });

  // Insert mock sessions
  await prisma.session.createMany({
    data: [
      {
        user_id: alice.id,
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
        sessionToken: 'session-token-alice',
      },
      {
        user_id: bob.id,
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
        sessionToken: 'session-token-bob',
      },
      {
        user_id: charlie.id,
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
        sessionToken: 'session-token-charlie',
      },
    ],
  });

  // Insert mock verification tokens
  await prisma.verificationToken.createMany({
    data: [
      {
        identifier: 'alice@example.com',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
        token: 'verification-token-alice',
      },
      {
        identifier: 'bob@example.com',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
        token: 'verification-token-bob',
      },
      {
        identifier: 'charlie@example.com',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day later
        token: 'verification-token-charlie',
      },
    ],
  });

  // Insert mock tags with updated_at
  // Get current date for updated_at field
  const now = new Date();

  // Insert Tags with updated_at field
  const importantTag = await prisma.tag.create({
    data: { 
      name: 'Important',
      updated_at: now 
    }
  });
  
  const urgentTag = await prisma.tag.create({
    data: { 
      name: 'Urgent',
      updated_at: now 
    }
  });
  
  const personalTag = await prisma.tag.create({
    data: { 
      name: 'Personal',
      updated_at: now 
    }
  });
  
  const workTag = await prisma.tag.create({
    data: { 
      name: 'Work',
      updated_at: now 
    }
  });
  
  const ideasTag = await prisma.tag.create({
    data: { 
      name: 'Ideas',
      updated_at: now 
    }
  });

  // Insert mock notes
  const meetingNote = await prisma.note.create({
    data: {
      title: 'Meeting Notes',
      content: 'Notes from the team meeting.',
      user_id: alice.id,
      updated_at: new Date(),
    },
  });

  const projectPlanNote = await prisma.note.create({
    data: {
      title: 'Project Plan',
      content: 'Plan for the new project.',
      user_id: bob.id,
      updated_at: new Date(),
    },
  });

  const groceryListNote = await prisma.note.create({
    data: {
      title: 'Grocery List',
      content: 'Eggs, Milk, Bread',
      user_id: charlie.id,
      updated_at: new Date(),
    },
  });

  // Now we can use the note IDs for the NoteTag relationships
  await prisma.noteTag.createMany({
    data: [
      { note_id: meetingNote.note_id, tag_id: importantTag.tag_id },  // Meeting Notes - Important
      { note_id: meetingNote.note_id, tag_id: workTag.tag_id },      // Meeting Notes - Work
      { note_id: projectPlanNote.note_id, tag_id: urgentTag.tag_id }, // Project Plan - Urgent
      { note_id: groceryListNote.note_id, tag_id: personalTag.tag_id }, // Grocery List - Personal
    ],
  });

  // Insert mock shared notes
  await prisma.sharedNote.createMany({
    data: [
      { note_id: meetingNote.note_id, shared_with_user_id: bob.id, can_edit: true }, // Meeting Notes shared with Bob
      { note_id: projectPlanNote.note_id, shared_with_user_id: charlie.id, can_edit: false }, // Project Plan shared with Charlie
    ],
  });

  // Insert mock active editors
  await prisma.activeEditor.createMany({
    data: [
      { note_id: meetingNote.note_id, user_id: bob.id }, // Bob is editing Meeting Notes
      { note_id: projectPlanNote.note_id, user_id: charlie.id }, // Charlie is editing Project Plan
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
