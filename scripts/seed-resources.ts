import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleResources = [
	// Career Tools
	{
		slug: "leetcode",
		name: "LeetCode",
		url: "https://leetcode.com",
		description: "Practice coding interview questions with over 2,800+ problems. Master algorithms and data structures with problems used by top tech companies.",
		content: `LeetCode is the go-to platform for technical interview preparation. Features include:

- **2,800+ Problems**: From easy to hard difficulty
- **Company Tags**: Practice questions from FAANG and other top companies
- **Mock Interviews**: Timed assessments that simulate real interviews
- **Discussion Forums**: Learn from community solutions
- **Progress Tracking**: Monitor your improvement over time

## Why LeetCode?

LeetCode problems are frequently asked in technical interviews at companies like Google, Amazon, Meta, Microsoft, and more. Many Waterloo students use LeetCode to prepare for co-op and full-time interviews.

## Getting Started

1. Start with "Easy" problems to build confidence
2. Focus on understanding patterns (two pointers, sliding window, etc.)
3. Practice consistently - aim for 1-2 problems daily
4. Review solutions in the discussion section`,
		logo: "https://leetcode.com/favicon.ico",
		category: "Career Tools",
		tags: ["interview prep", "algorithms", "coding", "technical interviews"],
		verified: true,
		published: true,
		publishedAt: new Date(),
	},
	{
		slug: "levels-fyi",
		name: "Levels.fyi",
		url: "https://www.levels.fyi",
		description: "Compare salaries, total compensation, and career levels across tech companies. Crowdsourced data from real employees.",
		content: `Levels.fyi provides transparent compensation data for tech roles. Essential for salary negotiations and understanding market rates.

## Features

- **Salary Data**: Total compensation breakdowns (base + bonus + equity)
- **Company Comparisons**: Compare offers side-by-side
- **Career Progression**: Understand promotion timelines
- **Interview Questions**: Practice questions by company

## For Waterloo Students

Use Levels.fyi to:
- Research co-op salaries by company and term
- Compare full-time new grad offers
- Understand equity compensation
- Plan your career progression`,
		logo: "https://www.levels.fyi/favicon.ico",
		category: "Career Tools",
		tags: ["salaries", "compensation", "career planning", "negotiations"],
		verified: true,
		published: true,
		publishedAt: new Date(),
	},
	{
		slug: "blind",
		name: "Blind",
		url: "https://www.teamblind.com",
		description: "Anonymous professional network for verified tech employees. Discuss salaries, companies, interviews, and workplace culture.",
		content: `Blind is an anonymous community where verified professionals discuss workplace topics freely.

## What You'll Find

- **Company Reviews**: Honest insights from current employees
- **Salary Discussions**: Real compensation data and negotiation tips
- **Interview Experiences**: Recent interview questions and processes
- **Workplace Issues**: Anonymous support for career challenges

## Join the Community

- Verify with your company email
- Post and browse anonymously
- Get honest advice from industry professionals`,
		logo: "https://www.teamblind.com/favicon.ico",
		category: "Career Tools",
		tags: ["community", "anonymous", "workplace", "career advice"],
		verified: true,
		published: true,
		publishedAt: new Date(),
	},

	// Learning Platforms
	{
		slug: "neetcode",
		name: "NeetCode",
		url: "https://neetcode.io",
		description: "Curated list of 150 LeetCode problems with video explanations. Created by a Google engineer, perfect for interview prep.",
		content: `NeetCode provides a structured approach to technical interview preparation.

## The NeetCode 150

A carefully selected list of 150 problems that cover all major patterns:
- Arrays & Hashing
- Two Pointers
- Sliding Window
- Stack
- Binary Search
- Linked Lists
- Trees
- Tries
- Backtracking
- Graphs
- Dynamic Programming

## Resources

- **Video Explanations**: Clear visual walkthroughs
- **Roadmap**: Structured learning path
- **Pattern Recognition**: Learn to identify problem types
- **Multiple Languages**: Solutions in Python, Java, C++, JavaScript

Many Waterloo students follow the NeetCode 150 to prepare for co-op interviews.`,
		logo: "https://neetcode.io/favicon.ico",
		category: "Learning Platforms",
		tags: ["interview prep", "algorithms", "video tutorials", "structured learning"],
		verified: true,
		published: true,
		publishedAt: new Date(),
	},
	{
		slug: "notion",
		name: "Notion",
		url: "https://www.notion.so",
		description: "All-in-one workspace for notes, docs, wikis, and project management. Popular among students for organizing coursework and projects.",
		content: `Notion is the ultimate productivity tool for students and professionals.

## For Students

- **Course Notes**: Organize notes by term and course
- **Assignment Tracking**: Never miss a deadline
- **Project Management**: Plan hackathons and side projects
- **Job Search**: Track applications and interview prep
- **Knowledge Base**: Build your second brain

## Popular Templates

- Co-op Application Tracker
- Course Planning & Notes
- Hackathon Project Planner
- Interview Prep Dashboard
- Resume & Portfolio Builder

## Waterloo Community

Join the Waterloo Notion community to find:
- Shared course note templates
- Co-op trackers
- Study group organization
- Career planning templates`,
		logo: "https://www.notion.so/images/favicon.ico",
		category: "Learning Platforms",
		tags: ["productivity", "notes", "organization", "student tools"],
		verified: true,
		published: true,
		publishedAt: new Date(),
	},

	// Community Sites
	{
		slug: "se-webring",
		name: "SE Webring",
		url: "https://se-webring.xyz",
		description: "A webring connecting personal websites of Software Engineering students at the University of Waterloo. Increase discoverability and traffic to your portfolio through this centralized directory.",
		content: `# SE Webring

A webring for Software Engineering students at the University of Waterloo - bringing back the spirit of the 90s web to connect student portfolios and personal sites.

## What's a Webring?

A webring is a collection of websites linked together by a common theme. Historically popular in the 1990s as a search engine optimization technique, the SE Webring revives this concept to provide a **central directory for personal websites and portfolios** of current and former Software Engineering students at the University of Waterloo, making them more discoverable and driving traffic to individual sites.

## How It Works

The SE Webring is a **static, client-side application with no backend** - all functionality runs directly in your browser:

### Core Technology
- **Data Layer**: All sites stored in \`js/sites.js\` as a simple JavaScript array
- **Search**: Fuzzy search powered by Fuse.js (search by name, year, or website)
- **Visualization**: Interactive 3D torus animation built with Three.js
- **Hosting**: Deployed on Netlify with continuous deployment from GitHub
- **GitHub as CMS**: All contributions managed through pull requests

### Features
- 🔍 **Fuzzy Search**: Find students by name, cohort year, or website URL
- 🎨 **3D Torus Animation**: Scroll-controlled visualization using WebGL
- 📦 **Client-Side Only**: No backend means simple hosting and fast performance
- 🔄 **Automated Workflow**: GitHub Actions label PRs automatically
- ⚡ **Instant Updates**: Merged changes deploy automatically to production

## How to Join

### Requirements
- Must be a **current student or alum** of UW Software Engineering undergraduate program
- Have a personal website or portfolio

### Submission Process
1. Fork the \`simcard0000/se-webring\` repository on GitHub
2. Add your entry to the **end** of the \`allSites\` array in \`js/sites.js\`:
   \`\`\`javascript
   {
     name: "Your Full Name",
     year: 2025,  // Your cohort year
     website: "https://yoursite.com"
   }
   \`\`\`
3. Open a pull request with:
   - Your full name
   - Cohort year
   - Full website URL
   - Link to another profile for identity verification (LinkedIn, GitHub, etc.)
4. Wait for review - PRs are approved if all requirements are met and content is appropriate

**Pro Tip**: Add a mention or link to the SE Webring on your submitted site to support the community!

## Technical Details

### Browser Requirements
- ES Modules support
- WebGL support
- CSS \`position: sticky\`
- Import maps

### Stack
- Vanilla JavaScript with ES Modules
- Fuse.js for fuzzy search
- Three.js for 3D graphics
- Hosted on Netlify
- Open source on GitHub

## Credits

Created and maintained by:
- **Simran Thind** (@simcard0000)
- **Janakitti Ratana-Rueangsri** (@janakitti)

## Inspired Similar Projects

The SE Webring has inspired other university communities to create their own webrings:
- [ECE Webring](https://ece.engineering/) - Waterloo ECE students
- [McGill CS Webring](https://mcgillcswebring.org/) - McGill CS students
- [UOttawa EECS Webring](https://farooqqureshi.com/eecs-webring/) - UOttawa EECS students
- [Design Waterloo](https://designwaterloo.notion.site) - UW Design community

## Why Join?

- **Increase Traffic**: Get discovered by fellow students, recruiters, and the community
- **Networking**: Connect with other SE students and alumni
- **Portfolio Visibility**: Showcase your work to the Waterloo community
- **Support Community**: Be part of a growing movement to bring back personal websites
- **SEO Benefits**: Backlinks from the webring improve your site's discoverability`,
		logo: "https://raw.githubusercontent.com/simcard0000/se-webring/main/assets/logo/logo_bg_b.png",
		category: "Community Sites",
		tags: ["webring", "portfolios", "SE students", "personal sites", "Waterloo", "networking"],
		verified: true,
		published: true,
		publishedAt: new Date(),
	},
	{
		slug: "reddit-uwaterloo",
		name: "r/uwaterloo",
		url: "https://reddit.com/r/uwaterloo",
		description: "The unofficial University of Waterloo subreddit. Discuss courses, co-op, campus life, and connect with fellow students.",
		content: `The r/uwaterloo subreddit is the largest online community for Waterloo students.

## What You'll Find

- **Course Reviews**: Real student experiences with courses and professors
- **Co-op Discussion**: Interview tips, offer advice, and company reviews
- **Campus Life**: Events, clubs, and social discussions
- **Memes**: Waterloo-specific humor and inside jokes
- **Support**: Academic advice and mental health resources

## Popular Topics

- "What's your co-op ranking strategy?"
- "Best food options on campus?"
- "Course recommendations for [program]"
- "Sublet housing for [term]"
- "Interview experiences at [company]"

## Community Guidelines

- Be respectful and supportive
- No personal attacks or doxxing
- Follow Reddit's content policy
- Keep discussions Waterloo-related`,
		logo: "https://www.redditstatic.com/desktop2x/img/favicon/favicon-96x96.png",
		category: "Community Sites",
		tags: ["reddit", "community", "discussion", "student life"],
		verified: true,
		published: true,
		publishedAt: new Date(),
	},

	// Development Tools
	{
		slug: "github-student-pack",
		name: "GitHub Student Developer Pack",
		url: "https://education.github.com/pack",
		description: "Free developer tools and services for students. Includes $200 DigitalOcean credit, domains, cloud hosting, and more.",
		content: `The GitHub Student Developer Pack gives students free access to premium developer tools.

## What's Included (100+ offers)

### Cloud & Hosting
- **DigitalOcean**: $200 credit for cloud servers
- **Microsoft Azure**: $100 credit
- **Heroku**: Free dyno hours
- **Namecheap**: Free domain name for 1 year

### Development Tools
- **GitHub Pro**: Advanced GitHub features
- **JetBrains**: Free professional IDEs
- **Bootstrap Studio**: Website builder
- **Canva Pro**: Design tools

### Learning Resources
- **DataCamp**: Data science courses
- **InterviewCake**: Interview prep
- **Frontend Masters**: Web development courses

### Other Services
- **Stripe**: Waived transaction fees
- **MongoDB**: Database credits
- **Travis CI**: Build automation

## How to Get It

1. Visit education.github.com/pack
2. Verify your student status with your @uwaterloo.ca email
3. Get instant access to all benefits
4. Renew annually while you're a student

## Pro Tips

- Apply as soon as you start university
- Use the DigitalOcean credit for hackathon projects
- Try different IDEs from JetBrains to find your favorite
- Host your portfolio site with free credits`,
		logo: "https://github.githubassets.com/favicons/favicon.svg",
		category: "Development Tools",
		tags: ["free", "student benefits", "developer tools", "cloud hosting"],
		verified: true,
		published: true,
		publishedAt: new Date(),
	},
	{
		slug: "vercel",
		name: "Vercel",
		url: "https://vercel.com",
		description: "Deploy web projects with zero configuration. Perfect for Next.js, React, and static sites. Used by students for portfolios and hackathon projects.",
		content: `Vercel is the platform for frontend developers. Deploy instantly with git integration.

## Why Vercel?

- **Zero Config**: Push to deploy automatically
- **Free Tier**: Generous limits for personal projects
- **Custom Domains**: Free SSL certificates
- **Edge Network**: Fast global CDN
- **Preview Deployments**: Every PR gets a unique URL
- **Analytics**: Built-in performance insights

## Perfect For

- Personal portfolios
- Hackathon projects
- Side projects and startups
- Open source projects

## Getting Started

1. Import your git repository
2. Vercel auto-detects your framework
3. Deploy with one click
4. Get a production URL instantly

## Popular Frameworks

- Next.js (created by Vercel)
- React
- Vue
- Svelte
- Static sites

Many Waterloo students host their portfolios and projects on Vercel for free.`,
		logo: "https://vercel.com/favicon.ico",
		category: "Development Tools",
		tags: ["deployment", "hosting", "frontend", "Next.js", "free"],
		verified: true,
		published: true,
		publishedAt: new Date(),
	},

	// University Resources
	{
		slug: "waterlooworks",
		name: "WaterlooWorks",
		url: "https://waterlooworks.uwaterloo.ca",
		description: "Official co-op job board for University of Waterloo students. Search and apply for co-op positions through the main platform.",
		content: `WaterlooWorks is the official platform for Waterloo's co-op program.

## Features

- **Job Postings**: Thousands of co-op opportunities
- **Application Tracking**: Manage your applications
- **Interview Scheduling**: Book interview slots
- **Rankings System**: Rank employers after interviews
- **Documents**: Upload resumes and cover letters

## Important Dates

- Application opening dates
- Ranking deadlines
- Continuous round schedules
- Match day notifications

## Tips for Success

- Apply early to popular positions
- Customize your resume for each application
- Research companies before interviews
- Use ranking strategy wisely
- Network at info sessions

Note: This resource directory (waterloo.works) is a community tool - not affiliated with the official WaterlooWorks platform.`,
		logo: "https://uwaterloo.ca/favicon.ico",
		category: "University Resources",
		tags: ["co-op", "jobs", "official", "Waterloo", "applications"],
		verified: true,
		published: true,
		publishedAt: new Date(),
	},
];

async function main() {
	console.log("🌱 Seeding resources...\n");

	for (const resource of sampleResources) {
		const created = await prisma.resource.upsert({
			where: { slug: resource.slug },
			update: resource,
			create: resource,
		});
		console.log(`✅ ${created.name} (${created.category})`);
	}

	console.log(`\n✨ Seeded ${sampleResources.length} resources successfully!`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
