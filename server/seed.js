const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db, initDatabase } = require('./db/init');

function seed() {
  console.log('Starting database seed...');

  // Initialize database tables
  initDatabase();

  // Clear existing data
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM messages;
    DELETE FROM saved_jobs;
    DELETE FROM job_applications;
    DELETE FROM connections;
    DELETE FROM post_comments;
    DELETE FROM post_likes;
    DELETE FROM posts;
    DELETE FROM jobs;
    DELETE FROM users;
  `);

  const hashedPassword = bcrypt.hashSync('password123', 10);

  // ==================== USERS ====================
  const users = [
    {
      id: uuidv4(),
      email: 'sarah.chen@email.com',
      password: hashedPassword,
      first_name: 'Sarah',
      last_name: 'Chen',
      headline: 'Senior Software Engineer at TechCorp',
      summary: 'Passionate full-stack developer with 8 years of experience building scalable web applications. Expertise in React, Node.js, and cloud architecture. Love mentoring junior developers and contributing to open source.',
      avatar: null,
      location: 'San Francisco, CA',
      industry: 'Technology',
      experience_years: 8,
      skills: 'JavaScript,TypeScript,React,Node.js,Python,AWS,Docker,PostgreSQL,GraphQL,System Design'
    },
    {
      id: uuidv4(),
      email: 'marcus.johnson@email.com',
      password: hashedPassword,
      first_name: 'Marcus',
      last_name: 'Johnson',
      headline: 'Product Manager at InnovateCo',
      summary: 'Strategic product manager with a track record of launching successful B2B SaaS products. Strong background in user research, data analytics, and cross-functional team leadership. Previously at Google and Stripe.',
      avatar: null,
      location: 'New York, NY',
      industry: 'Technology',
      experience_years: 6,
      skills: 'Product Strategy,Agile,Scrum,Data Analysis,User Research,A/B Testing,SQL,Jira,Figma,Stakeholder Management'
    },
    {
      id: uuidv4(),
      email: 'emily.rodriguez@email.com',
      password: hashedPassword,
      first_name: 'Emily',
      last_name: 'Rodriguez',
      headline: 'UX Designer & Design Systems Lead',
      summary: 'Creative UX designer passionate about creating inclusive and accessible digital experiences. Led design systems at two Fortune 500 companies. Speaker at design conferences and advocate for design thinking.',
      avatar: null,
      location: 'Austin, TX',
      industry: 'Design',
      experience_years: 7,
      skills: 'UX Design,UI Design,Figma,Sketch,Adobe XD,Design Systems,User Research,Prototyping,Accessibility,CSS'
    },
    {
      id: uuidv4(),
      email: 'james.williams@email.com',
      password: hashedPassword,
      first_name: 'James',
      last_name: 'Williams',
      headline: 'Data Scientist at AnalyticsPro',
      summary: 'Data scientist specializing in machine learning and NLP. PhD in Computer Science from MIT. Published researcher with expertise in building ML pipelines for production environments. Passionate about ethical AI.',
      avatar: null,
      location: 'Boston, MA',
      industry: 'Data Science',
      experience_years: 5,
      skills: 'Python,Machine Learning,TensorFlow,PyTorch,NLP,SQL,R,Spark,Data Visualization,Statistics'
    },
    {
      id: uuidv4(),
      email: 'priya.patel@email.com',
      password: hashedPassword,
      first_name: 'Priya',
      last_name: 'Patel',
      headline: 'Marketing Director at GrowthHub',
      summary: 'Results-driven marketing leader with 10+ years of experience in digital marketing, brand strategy, and growth hacking. Built marketing teams from the ground up at three startups. Expertise in content marketing and SEO.',
      avatar: null,
      location: 'Chicago, IL',
      industry: 'Marketing',
      experience_years: 10,
      skills: 'Digital Marketing,SEO,Content Strategy,Google Analytics,Social Media Marketing,Brand Strategy,Email Marketing,HubSpot,Copywriting,Team Leadership'
    },
    {
      id: uuidv4(),
      email: 'alex.kim@email.com',
      password: hashedPassword,
      first_name: 'Alex',
      last_name: 'Kim',
      headline: 'DevOps Engineer & Cloud Architect',
      summary: 'Infrastructure and DevOps specialist with deep expertise in AWS, Kubernetes, and CI/CD pipelines. Certified AWS Solutions Architect. Helping teams ship faster and more reliably through automation and best practices.',
      avatar: null,
      location: 'Seattle, WA',
      industry: 'Technology',
      experience_years: 6,
      skills: 'AWS,Kubernetes,Docker,Terraform,CI/CD,Jenkins,Linux,Python,Bash,Monitoring'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, first_name, last_name, headline, summary, avatar, location, industry, experience_years, skills)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of users) {
    insertUser.run(
      user.id, user.email, user.password, user.first_name, user.last_name,
      user.headline, user.summary, user.avatar, user.location, user.industry,
      user.experience_years, user.skills
    );
  }
  console.log(`Created ${users.length} users`);

  // ==================== JOBS ====================
  const jobs = [
    {
      id: uuidv4(),
      posted_by: users[0].id, // Sarah
      company: 'TechCorp',
      title: 'Full Stack Developer',
      description: 'We are looking for a talented Full Stack Developer to join our growing engineering team. You will work on building and maintaining our core platform using React and Node.js. The ideal candidate has strong JavaScript skills, experience with RESTful APIs, and a passion for writing clean, maintainable code.\n\nResponsibilities:\n- Develop and maintain web applications using React and Node.js\n- Collaborate with design and product teams to implement new features\n- Write unit and integration tests\n- Participate in code reviews and technical discussions\n- Contribute to architecture decisions',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary_min: 120000,
      salary_max: 180000,
      experience_level: 'Mid',
      skills_required: 'JavaScript,React,Node.js,PostgreSQL,Git'
    },
    {
      id: uuidv4(),
      posted_by: users[1].id, // Marcus
      company: 'InnovateCo',
      title: 'Senior Product Manager',
      description: 'InnovateCo is seeking a Senior Product Manager to lead our flagship B2B platform. You will own the product roadmap, work closely with engineering and design, and drive the strategy for our enterprise customers.\n\nRequirements:\n- 5+ years of product management experience\n- Experience with B2B SaaS products\n- Strong analytical skills and data-driven mindset\n- Excellent communication and stakeholder management\n- Experience with Agile methodologies',
      location: 'New York, NY',
      type: 'Full-time',
      salary_min: 150000,
      salary_max: 200000,
      experience_level: 'Senior',
      skills_required: 'Product Strategy,Agile,Data Analysis,B2B SaaS,Stakeholder Management'
    },
    {
      id: uuidv4(),
      posted_by: users[2].id, // Emily
      company: 'DesignStudio',
      title: 'UI/UX Designer',
      description: 'Join our design team and help create beautiful, intuitive interfaces for millions of users. We are looking for a creative designer who is passionate about user experience and has strong visual design skills.\n\nWhat you will do:\n- Create wireframes, prototypes, and high-fidelity designs\n- Conduct user research and usability testing\n- Maintain and evolve our design system\n- Collaborate closely with developers to ensure pixel-perfect implementation\n- Present design decisions to stakeholders',
      location: 'Austin, TX',
      type: 'Full-time',
      salary_min: 90000,
      salary_max: 140000,
      experience_level: 'Mid',
      skills_required: 'Figma,UI Design,UX Research,Prototyping,Design Systems'
    },
    {
      id: uuidv4(),
      posted_by: users[3].id, // James
      company: 'AnalyticsPro',
      title: 'Machine Learning Engineer',
      description: 'AnalyticsPro is hiring a Machine Learning Engineer to build and deploy ML models at scale. You will work on cutting-edge NLP and computer vision projects that impact millions of users.\n\nRequirements:\n- MS or PhD in Computer Science or related field\n- 3+ years of experience with ML in production\n- Proficiency in Python, TensorFlow or PyTorch\n- Experience with ML pipeline tools (MLflow, Kubeflow)\n- Strong understanding of statistics and algorithms',
      location: 'Boston, MA',
      type: 'Full-time',
      salary_min: 140000,
      salary_max: 220000,
      experience_level: 'Senior',
      skills_required: 'Python,TensorFlow,PyTorch,NLP,Machine Learning,MLOps'
    },
    {
      id: uuidv4(),
      posted_by: users[4].id, // Priya
      company: 'GrowthHub',
      title: 'Content Marketing Specialist',
      description: 'GrowthHub is looking for a Content Marketing Specialist to create compelling content that drives organic growth. You will develop and execute our content strategy across multiple channels.\n\nResponsibilities:\n- Write blog posts, whitepapers, and case studies\n- Manage our social media presence\n- Optimize content for SEO\n- Track and report on content performance metrics\n- Collaborate with sales team on content needs',
      location: 'Chicago, IL',
      type: 'Full-time',
      salary_min: 60000,
      salary_max: 90000,
      experience_level: 'Entry',
      skills_required: 'Content Writing,SEO,Social Media,Google Analytics,Copywriting'
    },
    {
      id: uuidv4(),
      posted_by: users[5].id, // Alex
      company: 'CloudScale',
      title: 'DevOps Engineer',
      description: 'CloudScale needs a DevOps Engineer to help us build and maintain our cloud infrastructure. You will work with Kubernetes, Terraform, and AWS to ensure our services are reliable, scalable, and secure.\n\nWhat we are looking for:\n- 3+ years of DevOps/SRE experience\n- Strong knowledge of AWS services\n- Experience with container orchestration (Kubernetes)\n- Infrastructure as Code (Terraform, CloudFormation)\n- CI/CD pipeline design and implementation',
      location: 'Seattle, WA',
      type: 'Full-time',
      salary_min: 130000,
      salary_max: 190000,
      experience_level: 'Mid',
      skills_required: 'AWS,Kubernetes,Terraform,Docker,CI/CD,Linux'
    },
    {
      id: uuidv4(),
      posted_by: users[0].id, // Sarah
      company: 'RemoteFirst Inc',
      title: 'React Native Developer',
      description: 'Build cross-platform mobile applications with React Native for a fully remote team. We are creating the next generation of productivity tools for remote workers.\n\nRequirements:\n- 2+ years of React Native experience\n- Strong JavaScript/TypeScript skills\n- Experience with mobile app deployment (App Store, Play Store)\n- Familiarity with native modules and bridging\n- Experience with state management (Redux, MobX)',
      location: 'Remote',
      type: 'Remote',
      salary_min: 100000,
      salary_max: 160000,
      experience_level: 'Mid',
      skills_required: 'React Native,JavaScript,TypeScript,Redux,Mobile Development'
    },
    {
      id: uuidv4(),
      posted_by: users[1].id, // Marcus
      company: 'StartupXYZ',
      title: 'Part-time Technical Writer',
      description: 'We need a technical writer to help document our APIs and developer tools. This is a part-time role perfect for someone who loves explaining complex technical concepts in clear, simple language.\n\nRequirements:\n- Experience writing technical documentation\n- Familiarity with REST APIs and developer tools\n- Strong written communication skills\n- Ability to work 20 hours per week\n- Experience with documentation tools (Notion, GitBook, etc.)',
      location: 'Remote',
      type: 'Part-time',
      salary_min: 40000,
      salary_max: 60000,
      experience_level: 'Entry',
      skills_required: 'Technical Writing,API Documentation,Markdown,Communication'
    }
  ];

  const insertJob = db.prepare(`
    INSERT INTO jobs (id, posted_by, company, title, description, location, type, salary_min, salary_max, experience_level, skills_required)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const job of jobs) {
    insertJob.run(
      job.id, job.posted_by, job.company, job.title, job.description,
      job.location, job.type, job.salary_min, job.salary_max,
      job.experience_level, job.skills_required
    );
  }
  console.log(`Created ${jobs.length} job postings`);

  // ==================== CONNECTIONS ====================
  const connections = [
    // Accepted connections
    { id: uuidv4(), requester_id: users[0].id, receiver_id: users[1].id, status: 'accepted' }, // Sarah - Marcus
    { id: uuidv4(), requester_id: users[0].id, receiver_id: users[2].id, status: 'accepted' }, // Sarah - Emily
    { id: uuidv4(), requester_id: users[0].id, receiver_id: users[5].id, status: 'accepted' }, // Sarah - Alex
    { id: uuidv4(), requester_id: users[1].id, receiver_id: users[3].id, status: 'accepted' }, // Marcus - James
    { id: uuidv4(), requester_id: users[2].id, receiver_id: users[4].id, status: 'accepted' }, // Emily - Priya
    { id: uuidv4(), requester_id: users[3].id, receiver_id: users[5].id, status: 'accepted' }, // James - Alex
    // Pending connections
    { id: uuidv4(), requester_id: users[3].id, receiver_id: users[0].id, status: 'pending' },  // James -> Sarah (pending)
    { id: uuidv4(), requester_id: users[4].id, receiver_id: users[1].id, status: 'pending' },  // Priya -> Marcus (pending)
  ];

  const insertConnection = db.prepare(`
    INSERT INTO connections (id, requester_id, receiver_id, status)
    VALUES (?, ?, ?, ?)
  `);

  for (const conn of connections) {
    insertConnection.run(conn.id, conn.requester_id, conn.receiver_id, conn.status);
  }
  console.log(`Created ${connections.length} connections`);

  // ==================== POSTS ====================
  const posts = [
    {
      id: uuidv4(),
      user_id: users[0].id, // Sarah
      content: 'Excited to share that our team just launched a major platform update! After 6 months of hard work, we have completely revamped our microservices architecture. Performance improved by 40% and deployment time cut in half. Huge shoutout to the engineering team! #engineering #devops #teamwork',
      image: null,
      likes_count: 0,
      comments_count: 0
    },
    {
      id: uuidv4(),
      user_id: users[1].id, // Marcus
      content: 'Just finished reading "Inspired" by Marty Cagan for the third time. Every read reveals something new about product management. If you are in product, this is a must-read. What are your favorite PM books? Drop them in the comments!',
      image: null,
      likes_count: 0,
      comments_count: 0
    },
    {
      id: uuidv4(),
      user_id: users[2].id, // Emily
      content: 'Had an amazing time speaking at DesignConf 2024 about building inclusive design systems. The key takeaway: accessibility is not an afterthought - it should be baked into every component from day one. Here are my slides for anyone who missed it.',
      image: null,
      likes_count: 0,
      comments_count: 0
    },
    {
      id: uuidv4(),
      user_id: users[3].id, // James
      content: 'Our latest research paper on transformer architectures for low-resource NLP tasks has been accepted at NeurIPS! So grateful for my co-authors and the entire research team. The paper demonstrates a 25% improvement over existing baselines. Link in comments.',
      image: null,
      likes_count: 0,
      comments_count: 0
    },
    {
      id: uuidv4(),
      user_id: users[4].id, // Priya
      content: 'Content marketing tip: Stop trying to rank for everything. Focus on 10-15 high-intent keywords that your ideal customers actually search for. We did this at GrowthHub and saw a 300% increase in qualified leads within 6 months. Quality over quantity, always.',
      image: null,
      likes_count: 0,
      comments_count: 0
    },
    {
      id: uuidv4(),
      user_id: users[5].id, // Alex
      content: 'Just got my AWS Solutions Architect Professional certification! If anyone is preparing for the exam, happy to share my study resources and tips. The key is hands-on practice - theory alone will not cut it.',
      image: null,
      likes_count: 0,
      comments_count: 0
    },
    {
      id: uuidv4(),
      user_id: users[0].id, // Sarah
      content: 'Looking for a mentor in engineering leadership? I am opening up 3 spots for monthly 1:1 mentoring sessions. I have helped 20+ engineers transition into tech leads and engineering managers over the past 3 years. DM me if interested!',
      image: null,
      likes_count: 0,
      comments_count: 0
    },
    {
      id: uuidv4(),
      user_id: users[1].id, // Marcus
      content: 'Hot take: The best product managers are the ones who say "no" the most. Your job is not to build everything stakeholders ask for - it is to identify what will move the needle for customers AND the business. Prioritization is a superpower.',
      image: null,
      likes_count: 0,
      comments_count: 0
    }
  ];

  const insertPost = db.prepare(`
    INSERT INTO posts (id, user_id, content, image, likes_count, comments_count)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const post of posts) {
    insertPost.run(post.id, post.user_id, post.content, post.image, post.likes_count, post.comments_count);
  }
  console.log(`Created ${posts.length} posts`);

  // ==================== POST LIKES ====================
  const likes = [
    // Sarah's first post gets likes
    { id: uuidv4(), post_id: posts[0].id, user_id: users[1].id },
    { id: uuidv4(), post_id: posts[0].id, user_id: users[2].id },
    { id: uuidv4(), post_id: posts[0].id, user_id: users[5].id },
    // Marcus's post gets likes
    { id: uuidv4(), post_id: posts[1].id, user_id: users[0].id },
    { id: uuidv4(), post_id: posts[1].id, user_id: users[3].id },
    // Emily's post gets likes
    { id: uuidv4(), post_id: posts[2].id, user_id: users[0].id },
    { id: uuidv4(), post_id: posts[2].id, user_id: users[4].id },
    { id: uuidv4(), post_id: posts[2].id, user_id: users[1].id },
    { id: uuidv4(), post_id: posts[2].id, user_id: users[5].id },
    // James's paper post gets likes
    { id: uuidv4(), post_id: posts[3].id, user_id: users[0].id },
    { id: uuidv4(), post_id: posts[3].id, user_id: users[5].id },
    // Priya's marketing tip
    { id: uuidv4(), post_id: posts[4].id, user_id: users[1].id },
    { id: uuidv4(), post_id: posts[4].id, user_id: users[2].id },
    // Alex's certification post
    { id: uuidv4(), post_id: posts[5].id, user_id: users[0].id },
    { id: uuidv4(), post_id: posts[5].id, user_id: users[3].id },
    { id: uuidv4(), post_id: posts[5].id, user_id: users[1].id },
    // Sarah's mentoring post
    { id: uuidv4(), post_id: posts[6].id, user_id: users[2].id },
    { id: uuidv4(), post_id: posts[6].id, user_id: users[5].id },
    // Marcus's hot take
    { id: uuidv4(), post_id: posts[7].id, user_id: users[0].id },
    { id: uuidv4(), post_id: posts[7].id, user_id: users[4].id },
    { id: uuidv4(), post_id: posts[7].id, user_id: users[3].id },
  ];

  const insertLike = db.prepare('INSERT INTO post_likes (id, post_id, user_id) VALUES (?, ?, ?)');

  for (const like of likes) {
    insertLike.run(like.id, like.post_id, like.user_id);
  }

  // Update like counts
  for (const post of posts) {
    const count = likes.filter(l => l.post_id === post.id).length;
    db.prepare('UPDATE posts SET likes_count = ? WHERE id = ?').run(count, post.id);
  }
  console.log(`Created ${likes.length} post likes`);

  // ==================== POST COMMENTS ====================
  const comments = [
    { id: uuidv4(), post_id: posts[0].id, user_id: users[1].id, content: 'Amazing work, Sarah! The performance improvements are incredible. Would love to hear more about the architecture decisions you made.' },
    { id: uuidv4(), post_id: posts[0].id, user_id: users[5].id, content: 'The CI/CD pipeline changes we made really paid off here. Great collaboration between the teams!' },
    { id: uuidv4(), post_id: posts[1].id, user_id: users[0].id, content: 'Great recommendation! I also love "The Lean Product Playbook" by Dan Olsen. Very practical frameworks for product development.' },
    { id: uuidv4(), post_id: posts[2].id, user_id: users[0].id, content: 'Could not agree more about accessibility being built in from day one. Would love to chat about how you approach component testing for a11y.' },
    { id: uuidv4(), post_id: posts[2].id, user_id: users[4].id, content: 'This is so important! We recently audited our marketing pages for accessibility and found so many issues. Your talk should be required viewing.' },
    { id: uuidv4(), post_id: posts[3].id, user_id: users[5].id, content: 'Congratulations James! Incredible achievement. The low-resource NLP space needs more work like this.' },
    { id: uuidv4(), post_id: posts[4].id, user_id: users[1].id, content: '300% increase is insane! We have been trying to improve our content strategy. Would love to pick your brain about keyword research methodology.' },
    { id: uuidv4(), post_id: posts[5].id, user_id: users[0].id, content: 'Congrats Alex! That is a tough exam. Totally agree about hands-on practice being key.' },
    { id: uuidv4(), post_id: posts[5].id, user_id: users[3].id, content: 'Would love those study resources! I am planning to take the exam next quarter.' },
    { id: uuidv4(), post_id: posts[7].id, user_id: users[4].id, content: 'This is gold. The best product people I have worked with are the ones who ruthlessly prioritize. It is not about saying no to everything but about saying yes to the RIGHT things.' },
  ];

  const insertComment = db.prepare('INSERT INTO post_comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)');

  for (const comment of comments) {
    insertComment.run(comment.id, comment.post_id, comment.user_id, comment.content);
  }

  // Update comment counts
  for (const post of posts) {
    const count = comments.filter(c => c.post_id === post.id).length;
    db.prepare('UPDATE posts SET comments_count = ? WHERE id = ?').run(count, post.id);
  }
  console.log(`Created ${comments.length} post comments`);

  // ==================== MESSAGES ====================
  const messages = [
    // Sarah <-> Marcus conversation
    { id: uuidv4(), sender_id: users[0].id, receiver_id: users[1].id, content: 'Hey Marcus! Saw your post about PM books. Do you have any recommendations for engineers transitioning into product?', is_read: 1 },
    { id: uuidv4(), sender_id: users[1].id, receiver_id: users[0].id, content: 'Hey Sarah! Absolutely. I would start with "Cracking the PM Interview" and then move to "Inspired". Both give great perspectives for engineers.', is_read: 1 },
    { id: uuidv4(), sender_id: users[0].id, receiver_id: users[1].id, content: 'Thanks! I have a few folks on my team who are interested in the PM path. Will share these with them.', is_read: 1 },
    { id: uuidv4(), sender_id: users[1].id, receiver_id: users[0].id, content: 'Happy to chat with them too if they want a PM perspective. Just have them reach out!', is_read: 0 },

    // Sarah <-> Emily conversation
    { id: uuidv4(), sender_id: users[2].id, receiver_id: users[0].id, content: 'Sarah, I loved your post about the platform update! How did you handle the migration with zero downtime?', is_read: 1 },
    { id: uuidv4(), sender_id: users[0].id, receiver_id: users[2].id, content: 'Thanks Emily! We used a blue-green deployment strategy with feature flags. Happy to do a deep dive if you are interested.', is_read: 1 },
    { id: uuidv4(), sender_id: users[2].id, receiver_id: users[0].id, content: 'That would be amazing! Maybe we could set up a lunch and learn? I think our design team would benefit from understanding the deployment process better.', is_read: 0 },

    // Marcus <-> James conversation
    { id: uuidv4(), sender_id: users[1].id, receiver_id: users[3].id, content: 'James, congratulations on the NeurIPS paper! That is a huge accomplishment.', is_read: 1 },
    { id: uuidv4(), sender_id: users[3].id, receiver_id: users[1].id, content: 'Thank you Marcus! It was a long road but worth it. How are things at InnovateCo?', is_read: 1 },
    { id: uuidv4(), sender_id: users[1].id, receiver_id: users[3].id, content: 'Going great! We are actually looking at incorporating some ML features into our product. Would love to get your input sometime.', is_read: 0 },

    // James <-> Alex conversation
    { id: uuidv4(), sender_id: users[5].id, receiver_id: users[3].id, content: 'Hey James, I saw you are working with large ML models. Have you looked into using Kubernetes for your training pipelines?', is_read: 1 },
    { id: uuidv4(), sender_id: users[3].id, receiver_id: users[5].id, content: 'Yes! We are actually in the process of setting up Kubeflow. Any tips from the infrastructure side?', is_read: 1 },
    { id: uuidv4(), sender_id: users[5].id, receiver_id: users[3].id, content: 'Definitely. I have set up Kubeflow clusters a few times now. Let me share some best practices doc I put together. It covers GPU scheduling and resource management.', is_read: 1 },
  ];

  const insertMessage = db.prepare('INSERT INTO messages (id, sender_id, receiver_id, content, is_read) VALUES (?, ?, ?, ?, ?)');

  for (const msg of messages) {
    insertMessage.run(msg.id, msg.sender_id, msg.receiver_id, msg.content, msg.is_read);
  }
  console.log(`Created ${messages.length} messages`);

  // ==================== JOB APPLICATIONS ====================
  const applications = [
    { id: uuidv4(), job_id: jobs[0].id, user_id: users[5].id, cover_letter: 'I am very excited about this Full Stack Developer role at TechCorp. With 6 years of experience in JavaScript, React, and Node.js, I believe I would be a strong addition to your team. My background in DevOps also gives me a unique perspective on building scalable applications.', status: 'reviewed' },
    { id: uuidv4(), job_id: jobs[3].id, user_id: users[0].id, cover_letter: 'While my primary background is in software engineering, I have been increasingly working with ML models in production. I would love the opportunity to focus full-time on machine learning engineering at AnalyticsPro.', status: 'pending' },
    { id: uuidv4(), job_id: jobs[5].id, user_id: users[0].id, cover_letter: 'I have extensive experience with AWS and have been involved in several infrastructure projects. The DevOps Engineer role at CloudScale aligns perfectly with my interest in cloud architecture and automation.', status: 'shortlisted' },
    { id: uuidv4(), job_id: jobs[2].id, user_id: users[4].id, cover_letter: 'As a marketing professional with a strong eye for design, I am passionate about the intersection of design and marketing. I would love to bring my unique perspective to the UI/UX Designer role at DesignStudio.', status: 'pending' },
    { id: uuidv4(), job_id: jobs[4].id, user_id: users[2].id, cover_letter: 'My experience in design thinking and content creation makes me well-suited for this Content Marketing Specialist role. I understand how to create content that resonates with users and drives engagement.', status: 'pending' },
  ];

  const insertApplication = db.prepare('INSERT INTO job_applications (id, job_id, user_id, cover_letter, status) VALUES (?, ?, ?, ?, ?)');

  for (const app of applications) {
    insertApplication.run(app.id, app.job_id, app.user_id, app.cover_letter, app.status);
  }
  console.log(`Created ${applications.length} job applications`);

  // ==================== SAVED JOBS ====================
  const savedJobs = [
    { id: uuidv4(), user_id: users[0].id, job_id: jobs[3].id }, // Sarah saved ML Engineer
    { id: uuidv4(), user_id: users[0].id, job_id: jobs[6].id }, // Sarah saved React Native
    { id: uuidv4(), user_id: users[3].id, job_id: jobs[0].id }, // James saved Full Stack
    { id: uuidv4(), user_id: users[5].id, job_id: jobs[5].id }, // Alex saved DevOps
    { id: uuidv4(), user_id: users[2].id, job_id: jobs[4].id }, // Emily saved Content Marketing
  ];

  const insertSavedJob = db.prepare('INSERT INTO saved_jobs (id, user_id, job_id) VALUES (?, ?, ?)');

  for (const sj of savedJobs) {
    insertSavedJob.run(sj.id, sj.user_id, sj.job_id);
  }
  console.log(`Created ${savedJobs.length} saved jobs`);

  // ==================== NOTIFICATIONS ====================
  const notifications = [
    // Connection request notifications
    { id: uuidv4(), user_id: users[0].id, type: 'connection_request', reference_id: connections[6].id, message: 'James Williams sent you a connection request', is_read: 0 },
    { id: uuidv4(), user_id: users[1].id, type: 'connection_request', reference_id: connections[7].id, message: 'Priya Patel sent you a connection request', is_read: 0 },
    // Connection accepted notifications
    { id: uuidv4(), user_id: users[0].id, type: 'connection_accepted', reference_id: connections[0].id, message: 'Marcus Johnson accepted your connection request', is_read: 1 },
    // Post like notifications
    { id: uuidv4(), user_id: users[0].id, type: 'post_like', reference_id: posts[0].id, message: 'Marcus Johnson liked your post', is_read: 1 },
    { id: uuidv4(), user_id: users[0].id, type: 'post_like', reference_id: posts[0].id, message: 'Emily Rodriguez liked your post', is_read: 0 },
    // Post comment notifications
    { id: uuidv4(), user_id: users[0].id, type: 'post_comment', reference_id: posts[0].id, message: 'Marcus Johnson commented on your post', is_read: 1 },
    { id: uuidv4(), user_id: users[0].id, type: 'post_comment', reference_id: posts[0].id, message: 'Alex Kim commented on your post', is_read: 0 },
    // Job application notifications
    { id: uuidv4(), user_id: users[0].id, type: 'job_application', reference_id: applications[0].id, message: 'Alex Kim applied to your job: Full Stack Developer', is_read: 1 },
    // Message notifications
    { id: uuidv4(), user_id: users[0].id, type: 'message', reference_id: messages[3].id, message: 'Marcus Johnson sent you a message', is_read: 0 },
    { id: uuidv4(), user_id: users[0].id, type: 'message', reference_id: messages[6].id, message: 'Emily Rodriguez sent you a message', is_read: 0 },
  ];

  const insertNotification = db.prepare('INSERT INTO notifications (id, user_id, type, reference_id, message, is_read) VALUES (?, ?, ?, ?, ?, ?)');

  for (const notif of notifications) {
    insertNotification.run(notif.id, notif.user_id, notif.type, notif.reference_id, notif.message, notif.is_read);
  }
  console.log(`Created ${notifications.length} notifications`);

  console.log('\nSeed completed successfully!');
  console.log('\nSample login credentials:');
  console.log('  Email: sarah.chen@email.com');
  console.log('  Password: password123');
  console.log('\nAll users have the password: password123');
}

// Run the seed
seed();
