import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('password', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@henry.com' },
    update: {},
    create: {
      email: 'admin@henry.com',
      name: 'Henry Agyemang',
      password: hashedPassword,
      role: 'ADMIN',
      bio: 'Portfolio Administrator',
      location: 'Ghana',
    },
  });

  console.log('Created admin user:', adminUser);

  // Create some sample projects
  const project1 = await prisma.project.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce solution with React, Node.js, and Stripe integration.',
      longDesc: 'A comprehensive e-commerce platform built with modern technologies. Features include user authentication, product catalog, shopping cart, payment processing with Stripe, and admin dashboard for managing products and orders.',
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      status: 'PUBLISHED',
      demoUrl: 'https://demo.example.com',
      githubUrl: 'https://github.com/henryagyemang/ecommerce',
      isPaid: false,
      order: 1,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: '2' },
    update: {},
    create: {
      id: '2',
      title: 'Task Management App',
      description: 'Collaborative task management application with real-time updates.',
      longDesc: 'A modern task management application that enables teams to collaborate effectively. Features real-time updates, drag-and-drop task organization, user assignments, and progress tracking.',
      tags: ['React', 'Socket.io', 'Express', 'PostgreSQL'],
      status: 'DRAFT',
      demoUrl: 'https://tasks.example.com',
      githubUrl: 'https://github.com/henryagyemang/tasks',
      isPaid: true,
      order: 2,
    },
  });

  console.log('Created sample projects:', { project1, project2 });

  // Create some sample services
  const services = [
    {
      id: 'service-1',
      title: 'Web Development',
      description: 'Building responsive, modern websites and web applications using the latest technologies.',
      icon: 'Code',
      isActive: true,
      order: 1,
    },
    {
      id: 'service-2',
      title: 'Mobile Development',
      description: 'Creating cross-platform mobile applications that deliver native performance.',
      icon: 'Smartphone',
      isActive: true,
      order: 2,
    },
    {
      id: 'service-3',
      title: 'Cloud Solutions',
      description: 'Deploying and managing applications on cloud platforms with focus on scalability.',
      icon: 'Cloud',
      isActive: true,
      order: 3,
    },
    {
      id: 'service-4',
      title: 'Backend Development',
      description: 'Designing and implementing robust APIs, databases, and server-side architectures.',
      icon: 'Database',
      isActive: true,
      order: 4,
    },
    {
      id: 'service-5',
      title: 'UI/UX Design',
      description: 'Creating intuitive and visually appealing user interfaces.',
      icon: 'Palette',
      isActive: false,
      order: 5,
    },
    {
      id: 'service-6',
      title: 'Performance Optimization',
      description: 'Optimizing applications for speed, efficiency, and better user engagement.',
      icon: 'Zap',
      isActive: true,
      order: 6,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {},
      create: service,
    });
  }

  console.log('Created sample services');

  // Create some sample skills
  const skills = [
    { name: 'React/Next.js', percentage: 95, category: 'Frontend', color: 'bg-blue-500', isActive: true, order: 1 },
    { name: 'Node.js/Express', percentage: 90, category: 'Backend', color: 'bg-green-500', isActive: true, order: 2 },
    { name: 'TypeScript', percentage: 88, category: 'Language', color: 'bg-blue-600', isActive: true, order: 3 },
    { name: 'Python/Django', percentage: 85, category: 'Backend', color: 'bg-yellow-500', isActive: true, order: 4 },
    { name: 'PostgreSQL/MongoDB', percentage: 82, category: 'Database', color: 'bg-purple-500', isActive: true, order: 5 },
    { name: 'AWS/Cloud', percentage: 80, category: 'DevOps', color: 'bg-orange-500', isActive: true, order: 6 },
    { name: 'Docker/Kubernetes', percentage: 75, category: 'DevOps', color: 'bg-cyan-500', isActive: true, order: 7 },
    { name: 'GraphQL', percentage: 70, category: 'API', color: 'bg-pink-500', isActive: false, order: 8 },
  ];

  for (const skill of skills) {
    await prisma.skill.create({
      data: skill,
    });
  }

  console.log('Created sample skills');

  // Create some sample technologies
  const technologies = [
    { name: 'Docker', isActive: true, order: 1 },
    { name: 'Kubernetes', isActive: true, order: 2 },
    { name: 'Redis', isActive: true, order: 3 },
    { name: 'GraphQL', isActive: true, order: 4 },
    { name: 'Jest', isActive: true, order: 5 },
    { name: 'Webpack', isActive: true, order: 6 },
    { name: 'Socket.io', isActive: true, order: 7 },
    { name: 'Prisma', isActive: true, order: 8 },
    { name: 'Tailwind CSS', isActive: true, order: 9 },
    { name: 'Git', isActive: true, order: 10 },
  ];

  for (const tech of technologies) {
    await prisma.technology.create({
      data: tech,
    });
  }

  console.log('Created sample technologies');

  // Create some sample notifications
  const notifications = [
    {
      userId: adminUser.id,
      title: 'Welcome to your Portfolio Dashboard',
      message: 'Your portfolio admin panel is ready! You can now manage your projects, skills, and content.',
      type: 'SUCCESS' as const,
      isRead: false,
      actionUrl: '/admin',
    },
    {
      userId: adminUser.id,
      title: 'New Contact Message',
      message: 'You have received a new contact message from John Smith.',
      type: 'CONTACT' as const,
      isRead: false,
      actionUrl: '/admin/contacts',
      metadata: {
        contactName: 'John Smith',
        contactEmail: 'john@example.com',
      },
    },
    {
      userId: adminUser.id,
      title: 'System Update Available',
      message: 'A new system update is available with improved security features.',
      type: 'INFO' as const,
      isRead: true,
      actionUrl: '/admin/settings',
    },
    {
      userId: adminUser.id,
      title: 'Project Views Milestone',
      message: 'Congratulations! Your E-Commerce Platform project reached 100 views.',
      type: 'SUCCESS' as const,
      isRead: false,
      actionUrl: '/admin/projects',
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log('Created sample notifications');

  // Create some sample team members
  const teamMembers = [
    {
      name: 'Henry Agyemang',
      role: 'Lead Developer & Founder',
      bio: 'Full-stack developer with expertise in React, Node.js, and cloud architecture. Passionate about creating scalable and efficient web applications.',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
      email: 'henry@example.com',
      linkedin: 'https://linkedin.com/in/henryagyemang',
      github: 'https://github.com/henryagyemang',
      isActive: true,
      order: 1,
      joinDate: new Date('2021-01-15'),
    },
    {
      name: 'Sarah Johnson',
      role: 'UI/UX Designer',
      bio: 'Creative designer focused on user-centered design and modern interfaces. Expert in Figma, Adobe Creative Suite, and design systems.',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      email: 'sarah@example.com',
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      isActive: true,
      order: 2,
      joinDate: new Date('2022-03-20'),
    },
    {
      name: 'Mike Chen',
      role: 'DevOps Engineer',
      bio: 'Infrastructure specialist with expertise in cloud platforms and automation. Experienced with AWS, Docker, and CI/CD pipelines.',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      email: 'mike@example.com',
      github: 'https://github.com/mikechen',
      isActive: true,
      order: 3,
      joinDate: new Date('2022-06-10'),
    },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.create({
      data: member,
    });
  }

  console.log('Created sample team members');

  // Create some sample contact submissions
  const contacts = [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      message: 'Hi Henry, I\'m interested in discussing a potential web development project for my startup. We\'re looking to build a modern e-commerce platform with React and Node.js. Could we schedule a call this week?',
      status: 'UNREAD' as const,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah@techcorp.com',
      phone: '+1 (555) 987-6543',
      message: 'Hello! I came across your portfolio and I\'m very impressed with your work. We have a project that might be a great fit for your skills. It involves building a dashboard with real-time analytics.',
      status: 'READ' as const,
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
    {
      name: 'Emily Rodriguez',
      email: 'emily@designstudio.com',
      phone: '+1 (555) 456-7890',
      message: 'Hi there! Our design studio is looking for a developer to bring our client designs to life. We work with several high-profile brands and need someone who can deliver pixel-perfect implementations.',
      status: 'ARCHIVED' as const,
      ipAddress: '203.0.113.45',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    },
  ];

  for (const contact of contacts) {
    await prisma.contactSubmission.create({
      data: contact,
    });
  }

  console.log('Created sample contact submissions');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
