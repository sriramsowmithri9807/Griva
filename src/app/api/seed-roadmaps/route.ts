import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// All roadmaps from roadmap.sh
const ROADMAPS = [
    {
        title: "Frontend Developer",
        description: "Step by step guide to becoming a modern frontend developer in 2026.",
        category: "Web Development",
        sections: [
            { title: "Internet Basics", topics: ["How does the Internet work?", "What is HTTP?", "DNS and how it works", "What is a Domain Name?", "Browsers and how they work", "What is Hosting?"] },
            { title: "HTML", topics: ["Learn the basics", "Semantic HTML", "Forms and Validations", "Accessibility", "SEO Basics"] },
            { title: "CSS", topics: ["Learn the basics", "Making Layouts (Flexbox, Grid)", "Responsive Design", "CSS Architecture (BEM)", "CSS Preprocessors (Sass)", "Tailwind CSS", "CSS Animations"] },
            { title: "JavaScript", topics: ["Syntax and Basics", "DOM Manipulation", "Fetch API / Ajax", "ES6+ Features", "Closures & Scope", "Promises & Async/Await", "Event Loop", "Modules"] },
            { title: "Version Control", topics: ["Git basics", "GitHub", "Branching strategies"] },
            { title: "Package Managers", topics: ["npm", "yarn", "pnpm"] },
            { title: "Frameworks", topics: ["React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js"] },
            { title: "TypeScript", topics: ["Types and Interfaces", "Generics", "Type Guards", "Utility Types", "Decorators"] },
            { title: "Testing", topics: ["Unit Testing (Jest, Vitest)", "Integration Testing", "E2E Testing (Cypress, Playwright)"] },
            { title: "Performance", topics: ["Core Web Vitals", "Lazy Loading", "Code Splitting", "Image Optimization", "Caching Strategies"] },
        ],
    },
    {
        title: "Backend Developer",
        description: "Step by step guide to becoming a modern backend developer in 2026.",
        category: "Web Development",
        sections: [
            { title: "Internet & OS", topics: ["How does the Internet work?", "OS and General Knowledge", "Process Management", "Threads and Concurrency", "Memory Management", "Terminal Usage"] },
            { title: "Programming Language", topics: ["JavaScript / Node.js", "Python", "Go", "Rust", "Java", "C#"] },
            { title: "Databases", topics: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "ORM (Prisma, Drizzle)"] },
            { title: "APIs", topics: ["REST", "GraphQL", "gRPC", "WebSockets", "Authentication (JWT, OAuth)", "API Security"] },
            { title: "Caching", topics: ["CDN", "Server-side caching", "Redis caching", "Client-side caching"] },
            { title: "Testing", topics: ["Unit Testing", "Integration Testing", "Functional Testing"] },
            { title: "CI/CD", topics: ["GitHub Actions", "Jenkins", "Docker", "Kubernetes"] },
            { title: "Architecture", topics: ["Monolithic vs Microservices", "Serverless", "SOA", "Message Brokers (RabbitMQ, Kafka)"] },
            { title: "Scaling", topics: ["Horizontal vs Vertical Scaling", "Load Balancing", "Database Sharding", "Rate Limiting"] },
        ],
    },
    {
        title: "DevOps Engineer",
        description: "Step by step guide to becoming a DevOps engineer with hands-on tools.",
        category: "Infrastructure",
        sections: [
            { title: "OS Concepts", topics: ["Process Management", "Networking basics", "Sockets", "POSIX", "File Systems", "Startup Management (systemd)"] },
            { title: "Networking", topics: ["DNS", "HTTP/HTTPS", "FTP/SFTP", "SSL/TLS", "SSH", "Load Balancers", "Reverse Proxy"] },
            { title: "Servers", topics: ["Linux (Ubuntu, CentOS)", "Nginx", "Apache", "Caddy"] },
            { title: "Containers", topics: ["Docker", "Docker Compose", "Podman", "LXC"] },
            { title: "Orchestration", topics: ["Kubernetes", "Docker Swarm", "Nomad", "Helm Charts"] },
            { title: "CI/CD", topics: ["GitHub Actions", "GitLab CI", "Jenkins", "CircleCI", "ArgoCD"] },
            { title: "Infrastructure as Code", topics: ["Terraform", "Ansible", "Pulumi", "CloudFormation"] },
            { title: "Monitoring", topics: ["Prometheus", "Grafana", "Datadog", "ELK Stack", "Jaeger"] },
            { title: "Cloud Providers", topics: ["AWS", "Google Cloud", "Azure", "DigitalOcean"] },
        ],
    },
    {
        title: "Full Stack Developer",
        description: "Complete guide to becoming a full stack web developer.",
        category: "Web Development",
        sections: [
            { title: "Frontend Fundamentals", topics: ["HTML & Semantic Markup", "CSS & Responsive Design", "JavaScript ES6+", "TypeScript"] },
            { title: "Frontend Frameworks", topics: ["React.js", "Next.js", "Vue.js", "Svelte"] },
            { title: "Backend Fundamentals", topics: ["Node.js & Express", "Python & Django/FastAPI", "REST API Design", "GraphQL"] },
            { title: "Databases", topics: ["PostgreSQL", "MongoDB", "Redis", "Supabase", "Prisma ORM"] },
            { title: "Authentication", topics: ["JWT Tokens", "OAuth 2.0", "Session Management", "Role-Based Access"] },
            { title: "DevOps Basics", topics: ["Docker", "CI/CD Pipelines", "Cloud Deployment (Vercel, AWS)", "Environment Variables", "Monitoring & Logging"] },
            { title: "Testing", topics: ["Unit Tests", "Integration Tests", "E2E Tests", "API Testing"] },
        ],
    },
    {
        title: "AI & Data Science",
        description: "Guide to becoming an AI engineer and data scientist.",
        category: "AI & ML",
        sections: [
            { title: "Mathematics", topics: ["Linear Algebra", "Calculus", "Probability & Statistics", "Optimization"] },
            { title: "Python for Data Science", topics: ["NumPy", "Pandas", "Matplotlib / Seaborn", "Jupyter Notebooks", "Scikit-learn"] },
            { title: "Machine Learning", topics: ["Supervised Learning", "Unsupervised Learning", "Feature Engineering", "Model Evaluation", "Cross Validation", "Ensemble Methods"] },
            { title: "Deep Learning", topics: ["Neural Networks", "CNNs", "RNNs / LSTMs", "Transformers", "GANs", "PyTorch", "TensorFlow"] },
            { title: "NLP", topics: ["Text Preprocessing", "Word Embeddings", "Attention Mechanism", "BERT / GPT", "Hugging Face Transformers", "LLM Fine-tuning"] },
            { title: "Computer Vision", topics: ["Image Classification", "Object Detection (YOLO)", "Image Segmentation", "Stable Diffusion", "OpenCV"] },
            { title: "MLOps", topics: ["Model Deployment", "MLflow", "DVC", "Model Monitoring", "A/B Testing"] },
        ],
    },
    {
        title: "Cybersecurity",
        description: "Guide to becoming a cybersecurity expert.",
        category: "Security",
        sections: [
            { title: "Networking", topics: ["TCP/IP Model", "OSI Model", "Firewalls", "VPNs", "Subnetting", "Wireshark"] },
            { title: "Operating Systems", topics: ["Linux Administration", "Windows Security", "File Permissions", "Process Monitoring"] },
            { title: "Web Security", topics: ["OWASP Top 10", "SQL Injection", "XSS", "CSRF", "Security Headers", "Content Security Policy"] },
            { title: "Cryptography", topics: ["Symmetric Encryption (AES)", "Asymmetric Encryption (RSA)", "Hashing (SHA, bcrypt)", "Digital Signatures", "TLS/SSL"] },
            { title: "Penetration Testing", topics: ["Nmap", "Burp Suite", "Metasploit", "Kali Linux", "Social Engineering"] },
            { title: "Incident Response", topics: ["Threat Detection", "SIEM", "Forensics", "Malware Analysis", "Vulnerability Management"] },
        ],
    },
    {
        title: "React Developer",
        description: "Everything you need to become a proficient React developer.",
        category: "Web Development",
        sections: [
            { title: "React Fundamentals", topics: ["JSX", "Components", "Props", "State", "Event Handling", "Conditional Rendering", "Lists and Keys"] },
            { title: "Hooks", topics: ["useState", "useEffect", "useContext", "useReducer", "useRef", "useMemo", "useCallback", "Custom Hooks"] },
            { title: "State Management", topics: ["Context API", "Redux Toolkit", "Zustand", "Jotai", "Recoil"] },
            { title: "Routing", topics: ["React Router", "Next.js App Router", "Dynamic Routes", "Protected Routes"] },
            { title: "Styling", topics: ["CSS Modules", "Styled Components", "Tailwind CSS", "Framer Motion"] },
            { title: "API Integration", topics: ["Fetch / Axios", "React Query (TanStack Query)", "SWR", "GraphQL with Apollo"] },
            { title: "Testing", topics: ["React Testing Library", "Jest", "Cypress", "Playwright"] },
            { title: "Performance", topics: ["React.memo", "Code Splitting", "Lazy Loading", "Suspense", "React Server Components"] },
        ],
    },
    {
        title: "Python Developer",
        description: "Complete guide to becoming a Python developer.",
        category: "Programming",
        sections: [
            { title: "Basics", topics: ["Syntax and Variables", "Data Types", "Control Flow", "Functions", "Modules", "List Comprehensions", "Error Handling"] },
            { title: "OOP", topics: ["Classes and Objects", "Inheritance", "Polymorphism", "Encapsulation", "Decorators", "Magic Methods"] },
            { title: "Advanced Python", topics: ["Generators", "Iterators", "Context Managers", "Multithreading", "Multiprocessing", "Asyncio"] },
            { title: "Web Frameworks", topics: ["Django", "Flask", "FastAPI", "Uvicorn", "Django REST Framework"] },
            { title: "Data & ML", topics: ["NumPy", "Pandas", "Matplotlib", "Scikit-learn", "TensorFlow", "PyTorch"] },
            { title: "DevOps & Tools", topics: ["Virtual Environments (venv)", "Poetry", "Docker", "Testing (pytest)", "Type Hints", "Linting (Ruff, Black)"] },
        ],
    },
    {
        title: "Android Developer",
        description: "Guide to becoming a modern Android developer with Kotlin.",
        category: "Mobile",
        sections: [
            { title: "Kotlin Basics", topics: ["Syntax & Variables", "Control Flow", "Functions", "OOP in Kotlin", "Null Safety", "Coroutines"] },
            { title: "Android Fundamentals", topics: ["Activities & Fragments", "Layouts & Views", "Intents", "Permissions", "Lifecycle"] },
            { title: "Jetpack Compose", topics: ["Composable Functions", "State Management", "Navigation", "Theming", "Animations", "LazyColumn & LazyRow"] },
            { title: "Architecture", topics: ["MVVM Pattern", "Repository Pattern", "Room Database", "Dependency Injection (Hilt)", "WorkManager"] },
            { title: "Networking", topics: ["Retrofit", "OkHttp", "Kotlin Serialization", "WebSockets"] },
            { title: "Testing & Release", topics: ["Unit Testing", "UI Testing (Espresso)", "App Signing", "Play Store Publishing"] },
        ],
    },
    {
        title: "iOS Developer",
        description: "Complete guide to iOS development with Swift and SwiftUI.",
        category: "Mobile",
        sections: [
            { title: "Swift Basics", topics: ["Variables & Constants", "Optionals", "Closures", "Protocols", "Generics", "Error Handling", "Concurrency (async/await)"] },
            { title: "SwiftUI", topics: ["Views & Modifiers", "State & Binding", "NavigationStack", "Lists & Grids", "Animations", "Custom Components"] },
            { title: "UIKit", topics: ["UIViewController", "UITableView", "Auto Layout", "Storyboards vs Programmatic"] },
            { title: "Data & Storage", topics: ["Core Data", "SwiftData", "UserDefaults", "Keychain", "CloudKit"] },
            { title: "Networking", topics: ["URLSession", "Codable", "REST APIs", "WebSockets"] },
            { title: "App Store", topics: ["App Signing", "TestFlight", "App Store Connect", "In-App Purchases", "Push Notifications"] },
        ],
    },
    {
        title: "Blockchain Developer",
        description: "Guide to becoming a blockchain and Web3 developer.",
        category: "Web3",
        sections: [
            { title: "Blockchain Basics", topics: ["What is Blockchain?", "Decentralization", "Consensus Mechanisms", "Cryptographic Hashing", "Wallets & Keys"] },
            { title: "Ethereum", topics: ["EVM", "Gas & Transactions", "Smart Contracts", "Solidity Language", "Hardhat", "Foundry"] },
            { title: "Smart Contracts", topics: ["Solidity Syntax", "ERC-20 Tokens", "ERC-721 NFTs", "OpenZeppelin", "Upgradeable Contracts", "Security Auditing"] },
            { title: "DApps", topics: ["Web3.js / Ethers.js", "Wagmi + Viem", "MetaMask Integration", "IPFS", "The Graph"] },
            { title: "DeFi", topics: ["AMMs", "Lending Protocols", "Yield Farming", "Stablecoins", "Flash Loans"] },
            { title: "Layer 2 & Scaling", topics: ["Rollups (Optimistic, ZK)", "Polygon", "Arbitrum", "Base", "State Channels"] },
        ],
    },
    {
        title: "System Design",
        description: "Learn how to design scalable, distributed systems.",
        category: "Architecture",
        sections: [
            { title: "Fundamentals", topics: ["Client-Server Model", "IP, DNS, HTTP", "Scaling (Vertical vs Horizontal)", "CAP Theorem", "Latency vs Throughput"] },
            { title: "Databases", topics: ["SQL vs NoSQL", "ACID Properties", "Database Indexing", "Sharding", "Replication", "Partitioning"] },
            { title: "Caching", topics: ["Cache Strategies", "Redis", "Memcached", "CDN", "Cache Invalidation"] },
            { title: "Messaging", topics: ["Message Queues", "Kafka", "RabbitMQ", "Pub/Sub Pattern", "Event-Driven Architecture"] },
            { title: "Design Patterns", topics: ["URL Shortener", "Rate Limiter", "Chat System", "Search Engine", "Social Media Feed", "Video Streaming"] },
            { title: "Infrastructure", topics: ["Load Balancers", "Reverse Proxy", "API Gateway", "Microservices", "Service Mesh", "Observability"] },
        ],
    },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== (process.env.CRON_SECRET || "griva-ingest-2026")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    let totalRoadmaps = 0;
    let totalSections = 0;
    let totalTopics = 0;

    for (const roadmap of ROADMAPS) {
        // Check if exists
        const { data: existing } = await supabase
            .from("roadmaps")
            .select("id")
            .eq("title", roadmap.title)
            .maybeSingle();

        let rmId: string;

        if (existing) {
            rmId = existing.id;
        } else {
            const { data: rm, error: rmErr } = await supabase
                .from("roadmaps")
                .insert({ title: roadmap.title, description: roadmap.description, category: roadmap.category })
                .select("id")
                .single();

            if (rmErr || !rm) {
                console.error(`Roadmap "${roadmap.title}" error:`, rmErr?.message);
                continue;
            }
            rmId = rm.id;
        }

        totalRoadmaps++;

        for (let si = 0; si < roadmap.sections.length; si++) {
            const section = roadmap.sections[si];

            const { data: existingSec } = await supabase
                .from("roadmap_sections")
                .select("id")
                .eq("roadmap_id", rmId)
                .eq("title", section.title)
                .maybeSingle();

            let secId: string;

            if (existingSec) {
                secId = existingSec.id;
            } else {
                const { data: sec, error: secErr } = await supabase
                    .from("roadmap_sections")
                    .insert({ roadmap_id: rmId, title: section.title, order_index: si })
                    .select("id")
                    .single();

                if (secErr || !sec) {
                    console.error(`Section "${section.title}" error:`, secErr?.message);
                    continue;
                }
                secId = sec.id;
            }

            totalSections++;

            // Check existing topics for this section
            const { data: existingTopics } = await supabase
                .from("roadmap_topics")
                .select("title")
                .eq("section_id", secId);

            const existingTitles = new Set((existingTopics || []).map((t: { title: string }) => t.title));

            const newTopics = section.topics
                .filter((title) => !existingTitles.has(title))
                .map((title, ti) => ({
                    section_id: secId,
                    title,
                    resource_link: "https://roadmap.sh",
                    order_index: ti,
                }));

            if (newTopics.length > 0) {
                const { error: topErr } = await supabase
                    .from("roadmap_topics")
                    .insert(newTopics);

                if (topErr) {
                    console.error(`Topics error:`, topErr.message);
                } else {
                    totalTopics += newTopics.length;
                }
            } else {
                totalTopics += section.topics.length;
            }
        }
    }

    return NextResponse.json({
        success: true,
        seeded: { roadmaps: totalRoadmaps, sections: totalSections, topics: totalTopics },
    });
}
