import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'rajesh.kumar@email.com' },
    update: {},
    create: {
      email: 'rajesh.kumar@email.com',
      fullName: 'Rajesh Kumar',
      location: 'Chennai, Tamil Nadu, India',
    },
  });

  console.log('✅ Created user:', user.fullName);

  // Create user preferences
  await prisma.userPreferences.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      country: 'India',
      region: 'Tamil Nadu',
      language: 'en',
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      aiAssistance: 'moderate',
      defaultReminderDays: [1, 3, 7],
    },
  });

  console.log('✅ Created user preferences');

  // Create sample document
  const employmentDoc = await prisma.document.create({
    data: {
      userId: user.id,
      title: 'Employment Agreement - Acme Corp',
      category: 'employment',
      documentType: 'Employment Contract',
      status: 'active',
      filePath: '/documents/employment-acme-2024.pdf',
      fileType: 'application/pdf',
      fileSize: 1024000,
      pages: 12,
      signedDate: new Date('2024-01-15'),
      startDate: new Date('2024-02-01'),
      endDate: new Date('2026-01-31'),
      parties: ['Rajesh Kumar', 'Acme Corporation'],
      tags: ['employment', 'contract', 'full-time'],
      country: 'India',
      region: 'Tamil Nadu',
      language: 'en',
    },
  });

  console.log('✅ Created document:', employmentDoc.title);

  // Create events for the document
  const contractExpiry = await prisma.event.create({
    data: {
      userId: user.id,
      documentId: employmentDoc.id,
      eventType: 'contract_expiry',
      title: 'Employment Contract Expiry - Acme Corp',
      description: 'Employment contract with Acme Corporation will expire',
      eventDate: new Date('2026-01-31'),
      priority: 'high',
      status: 'upcoming',
      responsibleParty: 'Rajesh Kumar',
      advanceNoticeDays: 60,
    },
  });

  console.log('✅ Created event:', contractExpiry.title);

  // Create reminders for the event
  await prisma.reminder.createMany({
    data: [
      { eventId: contractExpiry.id, daysBefore: 7 },
      { eventId: contractExpiry.id, daysBefore: 14 },
      { eventId: contractExpiry.id, daysBefore: 30 },
    ],
  });

  console.log('✅ Created reminders for contract expiry');

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        documentId: employmentDoc.id,
        title: 'Review employment contract terms',
        description: 'Review all clauses before renewal',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2025-12-01'),
      },
      {
        userId: user.id,
        documentId: employmentDoc.id,
        eventId: contractExpiry.id,
        title: 'Discuss contract renewal with HR',
        description: 'Schedule meeting to discuss renewal terms',
        priority: 'high',
        status: 'pending',
        dueDate: new Date('2025-11-15'),
      },
    ],
  });

  console.log('✅ Created tasks');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        documentId: employmentDoc.id,
        type: 'info',
        title: 'Document Uploaded',
        message: 'Employment Agreement - Acme Corp has been successfully uploaded',
      },
      {
        userId: user.id,
        eventId: contractExpiry.id,
        type: 'warning',
        title: 'Upcoming Contract Expiry',
        message: 'Your employment contract will expire in 6 months',
      },
    ],
  });

  console.log('✅ Created notifications');

  // Create chat messages
  await prisma.chatMessage.createMany({
    data: [
      {
        userId: user.id,
        documentId: employmentDoc.id,
        role: 'user',
        content: 'What is the notice period in my employment contract?',
      },
      {
        userId: user.id,
        documentId: employmentDoc.id,
        role: 'assistant',
        content:
          'According to your employment contract with Acme Corporation, the notice period is 60 days. This means you need to provide at least 2 months notice before leaving the company.',
        sources: JSON.stringify([
          {
            documentId: employmentDoc.id,
            documentTitle: 'Employment Agreement - Acme Corp',
            section: 'Termination Clause',
            page: 8,
          },
        ]),
      },
    ],
  });

  console.log('✅ Created chat messages');

  // Create template
  await prisma.template.create({
    data: {
      title: 'Employment Contract Template (India)',
      category: 'employment',
      country: 'India',
      region: 'All Regions',
      languages: ['en', 'hi'],
      description:
        'Standard employment contract template compliant with Indian labor laws',
      fields: JSON.stringify([
        { id: '1', name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { id: '2', name: 'designation', label: 'Designation', type: 'text', required: true },
        { id: '3', name: 'salary', label: 'Annual Salary (INR)', type: 'number', required: true },
        { id: '4', name: 'startDate', label: 'Start Date', type: 'date', required: true },
      ]),
      clauses: [
        'Employment terms and responsibilities',
        'Compensation and benefits',
        'Working hours and leave policy',
        'Confidentiality and non-compete',
        'Termination clauses',
        'Dispute resolution',
      ],
    },
  });

  console.log('✅ Created template');

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log('- 1 user created');
  console.log('- 1 user preferences');
  console.log('- 1 document');
  console.log('- 1 event with 3 reminders');
  console.log('- 2 tasks');
  console.log('- 2 notifications');
  console.log('- 2 chat messages');
  console.log('- 1 template');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
