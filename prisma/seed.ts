import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.refreshToken.deleteMany();
  await prisma.bookLoan.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Existing data cleared');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@bibliptheque.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  const librarian = await prisma.user.create({
    data: {
      email: 'librarian@bibliptheque.com',
      password: hashedPassword,
      firstName: 'Librarian',
      lastName: 'Staff',
      role: Role.LIBRARIAN,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: Role.USER,
    },
  });

  console.log('Users created');

  // Create categories
  const fictionCategory = await prisma.category.create({
    data: {
      name: 'Fiction',
      description: 'Fictional literature and novels',
    },
  });

  const scienceCategory = await prisma.category.create({
    data: {
      name: 'Science',
      description: 'Scientific books and research publications',
    },
  });

  const historyCategory = await prisma.category.create({
    data: {
      name: 'History',
      description: 'Historical events and figures',
    },
  });

  const technologyCategory = await prisma.category.create({
    data: {
      name: 'Technology',
      description: 'Books about technology, programming, and computing',
    },
  });

  const philosophyCategory = await prisma.category.create({
    data: {
      name: 'Philosophy',
      description: 'Philosophical works and theories',
    },
  });

  console.log('Categories created');

  // Create books
  const books = await Promise.all([
    // Fiction books
    prisma.book.create({
      data: {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        publicationYear: 1960,
        publisher: 'HarperCollins',
        description: 'A novel about racial inequality in the American South',
        quantity: 5,
        categoryId: fictionCategory.id,
      },
    }),
    prisma.book.create({
      data: {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        publicationYear: 1949,
        publisher: 'Penguin Books',
        description: 'A dystopian novel about totalitarianism and surveillance',
        quantity: 3,
        categoryId: fictionCategory.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        publicationYear: 1925,
        publisher: 'Scribner',
        description: 'A novel about the American Dream in the Jazz Age',
        quantity: 4,
        categoryId: fictionCategory.id,
      },
    }),

    // Science books
    prisma.book.create({
      data: {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '9780553380163',
        publicationYear: 1988,
        publisher: 'Bantam Books',
        description: 'A book about cosmology and the universe',
        quantity: 2,
        categoryId: scienceCategory.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Origin of Species',
        author: 'Charles Darwin',
        isbn: '9780451529060',
        publicationYear: 1859,
        publisher: 'Signet Classics',
        description: 'A foundational work in evolutionary biology',
        quantity: 1,
        categoryId: scienceCategory.id,
      },
    }),

    // History books
    prisma.book.create({
      data: {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '9780062316097',
        publicationYear: 2014,
        publisher: 'Harper',
        description: 'A book about the history of Homo sapiens',
        quantity: 3,
        categoryId: historyCategory.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Guns, Germs, and Steel',
        author: 'Jared Diamond',
        isbn: '9780393317558',
        publicationYear: 1997,
        publisher: 'W. W. Norton',
        description: 'A book about the geographical and environmental factors that shaped human history',
        quantity: 2,
        categoryId: historyCategory.id,
      },
    }),

    // Technology books
    prisma.book.create({
      data: {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        publicationYear: 2008,
        publisher: 'Prentice Hall',
        description: 'A handbook of agile software craftsmanship',
        quantity: 4,
        categoryId: technologyCategory.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt and David Thomas',
        isbn: '9780201616224',
        publicationYear: 1999,
        publisher: 'Addison-Wesley',
        description: 'A book about software engineering best practices',
        quantity: 3,
        categoryId: technologyCategory.id,
      },
    }),

    // Philosophy books
    prisma.book.create({
      data: {
        title: 'Meditations',
        author: 'Marcus Aurelius',
        isbn: '9780812968255',
        publicationYear: 180,
        publisher: 'Modern Library',
        description: 'A series of personal writings by the Roman Emperor Marcus Aurelius',
        quantity: 2,
        categoryId: philosophyCategory.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'Beyond Good and Evil',
        author: 'Friedrich Nietzsche',
        isbn: '9780679724650',
        publicationYear: 1886,
        publisher: 'Vintage Books',
        description: 'A philosophical work that expands on the ideas of Nietzsche\'s previous work',
        quantity: 1,
        categoryId: philosophyCategory.id,
      },
    }),
  ]);

  console.log(`${books.length} books created`);

  // Create some loans and reservations
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 14); // 2 weeks loan period

  // Create a loan for user1
  await prisma.bookLoan.create({
    data: {
      userId: user1.id,
      bookId: books[0].id, // To Kill a Mockingbird
      dueDate,
      status: 'ACTIVE',
    },
  });

  // Create a loan for user2
  await prisma.bookLoan.create({
    data: {
      userId: user2.id,
      bookId: books[3].id, // A Brief History of Time
      dueDate,
      status: 'ACTIVE',
    },
  });

  // Create a reservation for user1
  await prisma.reservation.create({
    data: {
      userId: user1.id,
      bookId: books[7].id, // Clean Code
      status: 'PENDING',
    },
  });

  console.log('Loans and reservations created');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
