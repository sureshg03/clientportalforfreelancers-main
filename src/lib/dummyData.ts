import { supabase } from './supabase';

// Dummy data for Tamil freelancers
const dummyFreelancers = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    role: 'freelancer' as const,
    full_name: 'Arun Kumar',
    bio: 'Experienced web developer specializing in React and Node.js. Passionate about creating beautiful and functional user interfaces.',
    company_name: null,
    hourly_rate: 45,
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express.js'],
    availability_status: 'online' as const,
    linkedin_url: 'https://linkedin.com/in/arun-kumar-dev',
    github_url: 'https://github.com/arunkumar',
    portfolio_url: 'https://arunkumar.dev',
    total_rating: 4.8,
    total_reviews: 24,
    total_earnings: 12500,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    role: 'freelancer' as const,
    full_name: 'Priya Senthil',
    bio: 'Full-stack developer with expertise in Python, Django, and React. Love building scalable web applications.',
    company_name: null,
    hourly_rate: 50,
    skills: ['Python', 'Django', 'React', 'PostgreSQL', 'AWS'],
    availability_status: 'online' as const,
    linkedin_url: 'https://linkedin.com/in/priya-senthil',
    github_url: 'https://github.com/priyasenthil',
    portfolio_url: 'https://priyasenthil.dev',
    total_rating: 4.9,
    total_reviews: 31,
    total_earnings: 15800,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    role: 'freelancer' as const,
    full_name: 'Karthik Rajan',
    bio: 'Mobile app developer specializing in React Native and Flutter. Creating cross-platform mobile experiences.',
    company_name: null,
    hourly_rate: 55,
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
    availability_status: 'busy' as const,
    linkedin_url: 'https://linkedin.com/in/karthik-rajan',
    github_url: 'https://github.com/karthikrajan',
    portfolio_url: 'https://karthikrajan.dev',
    total_rating: 4.7,
    total_reviews: 18,
    total_earnings: 9200,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    role: 'freelancer' as const,
    full_name: 'Deepika Venkatesh',
    bio: 'UI/UX designer with a passion for creating intuitive and beautiful user experiences. Expert in Figma and Adobe Creative Suite.',
    company_name: null,
    hourly_rate: 40,
    skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
    availability_status: 'online' as const,
    linkedin_url: 'https://linkedin.com/in/deepika-venkatesh',
    github_url: 'https://github.com/deepikavenkatesh',
    portfolio_url: 'https://deepikavenkatesh.design',
    total_rating: 4.6,
    total_reviews: 22,
    total_earnings: 7800,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    role: 'freelancer' as const,
    full_name: 'Suresh Babu',
    bio: 'DevOps engineer with expertise in cloud infrastructure, CI/CD pipelines, and containerization technologies.',
    company_name: null,
    hourly_rate: 60,
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    availability_status: 'online' as const,
    linkedin_url: 'https://linkedin.com/in/suresh-babu-devops',
    github_url: 'https://github.com/sureshababu',
    portfolio_url: 'https://sureshababu.dev',
    total_rating: 4.8,
    total_reviews: 16,
    total_earnings: 11200,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    role: 'freelancer' as const,
    full_name: 'Lakshmi Narayanan',
    bio: 'Data scientist and machine learning engineer. Specializing in Python, TensorFlow, and data analysis.',
    company_name: null,
    hourly_rate: 65,
    skills: ['Python', 'TensorFlow', 'Machine Learning', 'Pandas', 'Scikit-learn'],
    availability_status: 'offline' as const,
    linkedin_url: 'https://linkedin.com/in/lakshmi-narayanan',
    github_url: 'https://github.com/lakshminarayanan',
    portfolio_url: 'https://lakshminarayanan.dev',
    total_rating: 4.9,
    total_reviews: 12,
    total_earnings: 9500,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    role: 'freelancer' as const,
    full_name: 'Ravi Chandran',
    bio: 'WordPress developer and digital marketer. Creating beautiful websites and helping businesses grow online.',
    company_name: null,
    hourly_rate: 35,
    skills: ['WordPress', 'PHP', 'SEO', 'Digital Marketing', 'Google Ads'],
    availability_status: 'online' as const,
    linkedin_url: 'https://linkedin.com/in/ravi-chandran',
    github_url: 'https://github.com/ravichandran',
    portfolio_url: 'https://ravichandran.dev',
    total_rating: 4.5,
    total_reviews: 28,
    total_earnings: 6200,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    role: 'freelancer' as const,
    full_name: 'Anitha Balasubramanian',
    bio: 'Content writer and copywriter specializing in technical writing, blog posts, and marketing content.',
    company_name: null,
    hourly_rate: 30,
    skills: ['Content Writing', 'Technical Writing', 'SEO Writing', 'Copywriting', 'Blog Writing'],
    availability_status: 'online' as const,
    linkedin_url: 'https://linkedin.com/in/anitha-balasubramanian',
    github_url: 'https://github.com/anithabalasubramanian',
    portfolio_url: 'https://anithabalasubramanian.dev',
    total_rating: 4.7,
    total_reviews: 19,
    total_earnings: 4100,
  },
];

// Dummy clients
const dummyClients = [
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    role: 'client' as const,
    full_name: 'Rajesh Kumar',
    bio: 'Founder of TechStart Solutions. Looking for talented developers to build innovative web applications.',
    company_name: 'TechStart Solutions',
    hourly_rate: null,
    skills: null,
    availability_status: 'online' as const,
    linkedin_url: 'https://linkedin.com/in/rajesh-kumar-business',
    github_url: null,
    portfolio_url: 'https://techstartsolutions.com',
    total_rating: null,
    total_reviews: null,
    total_earnings: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    role: 'client' as const,
    full_name: 'Meera Srinivasan',
    bio: 'Marketing director at Creative Agency. Seeking creative designers and content creators for various projects.',
    company_name: 'Creative Agency',
    hourly_rate: null,
    skills: null,
    availability_status: 'online' as const,
    linkedin_url: 'https://linkedin.com/in/meera-srinivasan',
    github_url: null,
    portfolio_url: 'https://creativeagency.com',
    total_rating: null,
    total_reviews: null,
    total_earnings: null,
  },
];

// Dummy projects
const dummyProjects = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    client_id: '550e8400-e29b-41d4-a716-446655440009',
    title: 'E-commerce Website Development',
    description: 'Build a modern e-commerce website with React, Node.js, and Stripe integration. Need shopping cart, user authentication, and admin dashboard.',
    budget: 5000,
    status: 'open' as const,
    deadline: '2025-12-15T00:00:00Z',
    category: 'web-development',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    client_id: '550e8400-e29b-41d4-a716-446655440009',
    title: 'Mobile App for Restaurant Ordering',
    description: 'Create a React Native app for restaurant food ordering with real-time tracking, payment integration, and user reviews.',
    budget: 8000,
    status: 'in_progress' as const,
    deadline: '2025-11-30T00:00:00Z',
    category: 'mobile-development',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    client_id: '550e8400-e29b-41d4-a716-446655440010',
    title: 'Brand Identity Design',
    description: 'Design complete brand identity including logo, color palette, typography, and brand guidelines for a new startup.',
    budget: 2500,
    status: 'completed' as const,
    deadline: '2025-10-20T00:00:00Z',
    category: 'design',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440004',
    client_id: '550e8400-e29b-41d4-a716-446655440010',
    title: 'Content Marketing Strategy',
    description: 'Develop a comprehensive content marketing strategy including blog posts, social media content, and SEO optimization.',
    budget: 3000,
    status: 'open' as const,
    deadline: '2025-12-01T00:00:00Z',
    category: 'marketing',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440005',
    client_id: '550e8400-e29b-41d4-a716-446655440009',
    title: 'Data Analytics Dashboard',
    description: 'Build a dashboard for data visualization using Python, React, and D3.js. Include charts, graphs, and real-time data updates.',
    budget: 6000,
    status: 'draft' as const,
    deadline: '2026-01-15T00:00:00Z',
    category: 'web-development',
  },
];

// Dummy reviews
const dummyReviews = [
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    project_id: '660e8400-e29b-41d4-a716-446655440003',
    reviewer_id: '550e8400-e29b-41d4-a716-446655440010',
    reviewee_id: '550e8400-e29b-41d4-a716-446655440004',
    rating: 5,
    comment: 'Deepika did an amazing job with our brand identity. The logo and design guidelines exceeded our expectations. Highly recommended!',
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    project_id: '660e8400-e29b-41d4-a716-446655440003',
    reviewer_id: '550e8400-e29b-41d4-a716-446655440010',
    reviewee_id: '550e8400-e29b-41d4-a716-446655440004',
    rating: 5,
    comment: 'Professional, creative, and delivered on time. The brand identity looks fantastic and our clients love it.',
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440003',
    project_id: '660e8400-e29b-41d4-a716-446655440002',
    reviewer_id: '550e8400-e29b-41d4-a716-446655440009',
    reviewee_id: '550e8400-e29b-41d4-a716-446655440003',
    rating: 4,
    comment: 'Karthik is very skilled in React Native development. The app works great and the code quality is excellent.',
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440004',
    project_id: '660e8400-e29b-41d4-a716-446655440002',
    reviewer_id: '550e8400-e29b-41d4-a716-446655440009',
    reviewee_id: '550e8400-e29b-41d4-a716-446655440003',
    rating: 5,
    comment: 'Great communication throughout the project. Delivered exactly what we asked for and more.',
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440005',
    project_id: '660e8400-e29b-41d4-a716-446655440001',
    reviewer_id: '550e8400-e29b-41d4-a716-446655440009',
    reviewee_id: '550e8400-e29b-41d4-a716-446655440001',
    rating: 5,
    comment: 'Arun delivered a high-quality e-commerce website. The site is fast, responsive, and looks professional.',
  },
];

// Dummy messages for testing
const dummyMessages = [
  {
    id: '880e8400-e29b-41d4-a716-446655440001',
    sender_id: '550e8400-e29b-41d4-a716-446655440009', // Rajesh Kumar (client)
    receiver_id: '550e8400-e29b-41d4-a716-446655440001', // Arun Kumar (freelancer)
    content: 'Hi Arun, I reviewed your portfolio and I am impressed! Are you available for the e-commerce project?',
    is_read: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440002',
    sender_id: '550e8400-e29b-41d4-a716-446655440001', // Arun Kumar
    receiver_id: '550e8400-e29b-41d4-a716-446655440009', // Rajesh Kumar
    content: 'Hello Rajesh! Thank you for reaching out. Yes, I am very interested. Can we discuss the project requirements?',
    is_read: true,
    created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440003',
    sender_id: '550e8400-e29b-41d4-a716-446655440010', // Meera Srinivasan (client)
    receiver_id: '550e8400-e29b-41d4-a716-446655440004', // Deepika Venkatesh (designer)
    content: 'Deepika, your design work is amazing! We need a complete brand identity. Are you available next week?',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440004',
    sender_id: '550e8400-e29b-41d4-a716-446655440009', // Rajesh Kumar
    receiver_id: '550e8400-e29b-41d4-a716-446655440003', // Karthik Rajan
    content: 'Hey Karthik, I need a mobile app developer for our restaurant ordering system. Interested?',
    is_read: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440005',
    sender_id: '550e8400-e29b-41d4-a716-446655440003', // Karthik Rajan
    receiver_id: '550e8400-e29b-41d4-a716-446655440009', // Rajesh Kumar
    content: 'Absolutely! I have experience with similar projects. Let me know when we can have a call.',
    is_read: true,
    created_at: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
  },
];

// Dummy notifications
const dummyNotifications = [
  {
    id: '990e8400-e29b-41d4-a716-446655440001',
    user_id: '550e8400-e29b-41d4-a716-446655440001', // Arun Kumar
    title: 'New Message from Rajesh Kumar',
    message: 'You have a new message about the e-commerce project',
    type: 'info',
    link: '/messages',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440002',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Project Milestone Completed',
    message: 'Congratulations! You completed milestone 1 of the e-commerce project',
    type: 'success',
    link: '/projects',
    is_read: false,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440003',
    user_id: '550e8400-e29b-41d4-a716-446655440004', // Deepika
    title: 'New Message from Meera Srinivasan',
    message: 'Meera is interested in hiring you for a brand identity project',
    type: 'info',
    link: '/messages',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440004',
    user_id: '550e8400-e29b-41d4-a716-446655440009', // Rajesh (client)
    title: 'New Proposal Received',
    message: 'Arun Kumar submitted a proposal for your e-commerce project',
    type: 'success',
    link: '/projects',
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '990e8400-e29b-41d4-a716-446655440005',
    user_id: '550e8400-e29b-41d4-a716-446655440003', // Karthik
    title: 'Payment Received',
    message: 'You received $2,500 for the mobile app project',
    type: 'success',
    link: '/invoices',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

// Function to populate dummy data
export async function populateDummyData() {
  try {
    console.log('Starting to populate dummy data...');

    // Insert freelancers
    console.log('Inserting freelancers...');
    for (const freelancer of dummyFreelancers) {
      const { error } = await supabase.from('profiles').upsert(freelancer);
      if (error) {
        console.error('Error inserting freelancer:', freelancer.full_name, error);
      } else {
        console.log('✓ Inserted freelancer:', freelancer.full_name);
      }
    }

    // Insert clients
    console.log('Inserting clients...');
    for (const client of dummyClients) {
      const { error } = await supabase.from('profiles').upsert(client);
      if (error) {
        console.error('Error inserting client:', client.full_name, error);
      } else {
        console.log('✓ Inserted client:', client.full_name);
      }
    }

    // Insert projects
    console.log('Inserting projects...');
    for (const project of dummyProjects) {
      const { error } = await supabase.from('projects').upsert(project);
      if (error) {
        console.error('Error inserting project:', project.title, error);
      } else {
        console.log('✓ Inserted project:', project.title);
      }
    }

    // Insert reviews
    console.log('Inserting reviews...');
    for (const review of dummyReviews) {
      const { error } = await supabase.from('reviews').upsert(review);
      if (error) {
        console.error('Error inserting review:', review.id, error);
      } else {
        console.log('✓ Inserted review for project:', review.project_id);
      }
    }

    // Add project members for in_progress project
    console.log('Adding project members...');
    const projectMembers = [
      {
        project_id: '660e8400-e29b-41d4-a716-446655440002',
        freelancer_id: '550e8400-e29b-41d4-a716-446655440003',
        role: 'developer',
      },
    ];

    for (const member of projectMembers) {
      const { error } = await supabase.from('project_members').upsert(member);
      if (error) {
        console.error('Error inserting project member:', error);
      } else {
        console.log('✓ Added project member');
      }
    }

    // Insert messages
    console.log('Inserting messages...');
    for (const message of dummyMessages) {
      const { error } = await supabase.from('messages').upsert(message);
      if (error) {
        console.error('Error inserting message:', message.id, error);
      } else {
        console.log('✓ Inserted message');
      }
    }

    // Insert notifications
    console.log('Inserting notifications...');
    for (const notification of dummyNotifications) {
      const { error } = await supabase.from('notifications').upsert(notification);
      if (error) {
        console.error('Error inserting notification:', notification.id, error);
      } else {
        console.log('✓ Inserted notification');
      }
    }

    console.log('✅ Dummy data population completed!');
  } catch (error) {
    console.error('❌ Error populating dummy data:', error);
  }
}

// Function to clear all dummy data
export async function clearDummyData() {
  try {
    console.log('Clearing dummy data...');

    // Clear in reverse order to avoid foreign key constraints
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('project_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ Dummy data cleared!');
  } catch (error) {
    console.error('❌ Error clearing dummy data:', error);
  }
}