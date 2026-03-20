const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      username: 'admin',
      password: passwordHash,
      role: 'ADMIN',
      bio: 'Platform Administrator',
    },
  });

  // Users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@test.com' },
    update: {},
    create: {
      email: 'alice@test.com',
      username: 'alice_wonder',
      password: passwordHash,
      bio: 'Travel enthusiast and photographer 📸',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@test.com' },
    update: {},
    create: {
      email: 'bob@test.com',
      username: 'bobby_tables',
      password: passwordHash,
      bio: 'Just a guy who loves tech and coffee ☕',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@test.com' },
    update: {},
    create: {
      email: 'charlie@test.com',
      username: 'charlie_barkin',
      password: passwordHash,
      bio: 'Dog Dad. Nature Lover. 🌲',
      profilePicture: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&q=80&w=150',
    },
  });

  // Follows
  // Ensure bob follows alice
  const existingFollow = await prisma.follower.findFirst({
      where: { followerId: bob.id, followingId: alice.id }
  });
  if (!existingFollow) {
      await prisma.follower.create({ data: { followerId: bob.id, followingId: alice.id }});
  }

  // Posts
  // Create a post for Alice if she doesn't have any
  const alicePosts = await prisma.post.findMany({ where: { authorId: alice.id } });
  let post1;
  if (alicePosts.length === 0) {
    post1 = await prisma.post.create({
      data: {
        content: 'Exploring the mountains today! The view is absolutely breathtaking! 🏔️✨',
        mediaUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
        mediaType: 'image',
        authorId: alice.id,
      },
    });
  } else {
      post1 = alicePosts[0];
  }

  // Create a post for Bob if he doesn't have any
  const bobPosts = await prisma.post.findMany({ where: { authorId: bob.id } });
  let post2;
  if (bobPosts.length === 0) {
    post2 = await prisma.post.create({
      data: {
        content: 'My new setup is finally complete! Ready to code all night. 💻🚀',
        mediaUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
        mediaType: 'image',
        authorId: bob.id,
      },
    });
  }

  // Comments
  // Charlie comments on Alice's post
  const charlieComments = await prisma.comment.findMany({ where: { authorId: charlie.id, postId: post1.id } });
  if (charlieComments.length === 0) {
      await prisma.comment.create({
          data: {
              content: 'Wow, that looks amazing! Which trail is this?',
              postId: post1.id,
              authorId: charlie.id
          }
      });
  }

  // Likes
  // Bob likes Alice's post
  const bobLikes = await prisma.like.findFirst({ where: { userId: bob.id, postId: post1.id } });
  if (!bobLikes) {
      await prisma.like.create({
          data: {
              userId: bob.id,
              postId: post1.id
          }
      });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
