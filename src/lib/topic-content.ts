// ============================================================
// GRIVA — Topic Content Generator
// Returns rich educational content for a given topic name.
// Curated for ~70 popular topics; falls back to a smart template.
// ============================================================

export interface TopicContent {
    overview: string;
    keyPoints: string[];
    codeExample?: string;
    language?: string;
    bestPractices: string[];
    resources: { title: string; url: string }[];
}

// ── Curated content map ────────────────────────────────────────────────────
const CONTENT: Record<string, TopicContent> = {
    "How does the Internet work?": {
        overview: "The Internet is a global network of computers that communicate using standardized protocols. Data travels in packets through routers, switches, and undersea cables to reach its destination. The architecture is built on TCP/IP — a suite of protocols that defines how data is addressed, transmitted, and received across diverse networks.",
        keyPoints: [
            "The Internet uses a packet-switching model: data is broken into packets that travel independently",
            "IP (Internet Protocol) provides addressing; TCP provides reliable, ordered delivery",
            "Routers direct packets across networks using routing tables updated by BGP",
            "DNS translates human-readable domain names into IP addresses",
            "HTTP/HTTPS operates at the application layer on top of TCP/IP",
        ],
        bestPractices: [
            "Always use HTTPS for any data transmission",
            "Understand the OSI model layers when debugging network issues",
            "Use tools like Wireshark or tcpdump to inspect real network traffic",
        ],
        resources: [
            { title: "How Does the Internet Work? — MDN", url: "https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work" },
            { title: "CS50 — Internet Explained", url: "https://cs50.harvard.edu/web/2020/notes/8/" },
        ],
    },
    "What is HTTP?": {
        overview: "HTTP (HyperText Transfer Protocol) is the foundation of data communication on the Web. It is a request-response protocol: a client sends a request (GET, POST, PUT, DELETE…) and the server returns a response with a status code and body. HTTP/2 added multiplexing and header compression; HTTP/3 runs over QUIC for lower latency.",
        keyPoints: [
            "HTTP is stateless — each request is independent; cookies/sessions add state",
            "Status codes: 2xx (success), 3xx (redirect), 4xx (client error), 5xx (server error)",
            "HTTP headers carry metadata: Content-Type, Authorization, Cache-Control",
            "HTTP/2 multiplexes multiple requests over a single TCP connection",
            "HTTPS = HTTP over TLS — encrypts data in transit",
        ],
        codeExample: `// HTTP request with fetch
const response = await fetch("https://api.example.com/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice" }),
});

if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
const data = await response.json();
console.log(data);`,
        language: "javascript",
        bestPractices: [
            "Always check response.ok before parsing the body",
            "Use meaningful HTTP methods (GET=read, POST=create, PUT=replace, PATCH=update, DELETE=remove)",
            "Return appropriate status codes from your APIs",
        ],
        resources: [
            { title: "HTTP — MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
            { title: "HTTP/2 Explained", url: "https://http2.github.io/faq/" },
        ],
    },
    "DNS and how it works": {
        overview: "DNS (Domain Name System) is the phone book of the Internet. When you type 'google.com', your computer asks a series of DNS servers to resolve the domain name to an IP address. The process involves recursive resolvers, root nameservers, TLD nameservers, and authoritative nameservers — and results are cached using TTL (time-to-live) values.",
        keyPoints: [
            "DNS resolution order: browser cache → OS cache → recursive resolver → root → TLD → authoritative",
            "A records map domain → IPv4; AAAA records → IPv6; CNAME creates an alias",
            "TTL controls how long DNS records are cached",
            "DNSSEC adds cryptographic signatures to prevent DNS spoofing",
            "Common DNS providers: Cloudflare (1.1.1.1), Google (8.8.8.8)",
        ],
        bestPractices: [
            "Use low TTL when migrating to give yourself rollback flexibility",
            "Enable DNSSEC on your domains for security",
            "Monitor DNS propagation after changes with tools like dnschecker.org",
        ],
        resources: [
            { title: "How DNS Works — Cloudflare", url: "https://www.cloudflare.com/learning/dns/what-is-dns/" },
        ],
    },
    "Semantic HTML": {
        overview: "Semantic HTML uses HTML5 elements that convey meaning about the content they contain — like `<article>`, `<nav>`, `<header>`, `<main>` — rather than generic `<div>` and `<span>`. This improves accessibility (screen readers), SEO (search engines understand structure), and code readability.",
        keyPoints: [
            "<header>, <nav>, <main>, <article>, <section>, <aside>, <footer> replace generic divs",
            "<button> is always preferred over <div onclick> for interactive elements",
            "<figure> + <figcaption> wrap images with descriptions",
            "Use heading levels (h1→h6) in logical order — don't skip levels",
            "aria-label and role attributes fill gaps where no semantic element exists",
        ],
        codeExample: `<!-- Non-semantic (bad) -->
<div class="header">
  <div class="nav">...</div>
</div>

<!-- Semantic (good) -->
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>Article Title</h1>
    <p>Content...</p>
  </article>
</main>`,
        language: "html",
        bestPractices: [
            "One <h1> per page — use it for the main page topic",
            "Never use <table> for layout — only for tabular data",
            "Use <button> for actions and <a> for navigation links",
        ],
        resources: [
            { title: "HTML Semantics — MDN", url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html" },
        ],
    },
    "Making Layouts (Flexbox, Grid)": {
        overview: "CSS Flexbox and Grid are the two modern layout systems in CSS. Flexbox is ideal for one-dimensional layouts (rows or columns), while Grid excels at two-dimensional layouts. Together they replace the need for float-based or table-based layouts.",
        keyPoints: [
            "Flexbox: set `display: flex` on parent; control children with flex-direction, justify-content, align-items",
            "Grid: set `display: grid`; define columns with grid-template-columns (fr units)",
            "gap property works on both Flex and Grid containers",
            "Flexbox `flex: 1` makes items grow to fill available space equally",
            "Grid `auto-fill` + `minmax()` creates responsive columns without media queries",
        ],
        codeExample: `/* Flex row with centered items */
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* Responsive Grid — auto columns */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}`,
        language: "css",
        bestPractices: [
            "Use Flexbox for navigation bars, card rows, and button groups",
            "Use Grid for page layouts and complex two-dimensional content",
            "Prefer gap over margins for spacing between flex/grid items",
        ],
        resources: [
            { title: "Flexbox Guide — CSS-Tricks", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" },
            { title: "Grid Guide — CSS-Tricks", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" },
        ],
    },
    "Promises & Async/Await": {
        overview: "Promises represent eventual values from asynchronous operations. `async/await` is syntactic sugar over Promises that makes async code look and behave more like synchronous code. Understanding the event loop, microtask queue, and promise chaining is fundamental to writing correct JavaScript.",
        keyPoints: [
            "A Promise has 3 states: pending, fulfilled (resolved), or rejected",
            "async functions always return a Promise; `await` pauses execution until the Promise settles",
            "Unhandled promise rejections crash Node.js — always use try/catch or .catch()",
            "Promise.all() runs multiple promises in parallel; fails fast if any rejects",
            "Promise.allSettled() waits for all promises and never rejects early",
        ],
        codeExample: `// Promise chaining
fetch("/api/user")
  .then(res => res.json())
  .then(user => console.log(user))
  .catch(err => console.error(err));

// Equivalent with async/await
async function getUser() {
  try {
    const res = await fetch("/api/user");
    if (!res.ok) throw new Error("Not found");
    const user = await res.json();
    return user;
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Parallel execution
const [users, posts] = await Promise.all([
  fetch("/api/users").then(r => r.json()),
  fetch("/api/posts").then(r => r.json()),
]);`,
        language: "javascript",
        bestPractices: [
            "Always handle errors — use try/catch with async/await",
            "Use Promise.all for independent parallel operations",
            "Never use `await` inside a forEach — use for...of instead",
        ],
        resources: [
            { title: "Promises — MDN", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises" },
            { title: "Async/Await — javascript.info", url: "https://javascript.info/async-await" },
        ],
    },
    "Event Loop": {
        overview: "JavaScript is single-threaded but uses an event loop to handle concurrency. The event loop processes a call stack, a microtask queue (Promises), and a macrotask queue (setTimeout, setInterval). Understanding this is critical for writing non-blocking code and debugging async issues.",
        keyPoints: [
            "The call stack runs synchronous code; when empty, the event loop picks the next task",
            "Microtasks (Promise callbacks, queueMicrotask) run before the next macrotask",
            "Macrotasks: setTimeout, setInterval, I/O callbacks, requestAnimationFrame",
            "Blocking the call stack (heavy computation) freezes the UI/server",
            "Web Workers offload heavy computation to a separate thread",
        ],
        codeExample: `console.log("1");          // sync

setTimeout(() => {
  console.log("2");        // macrotask
}, 0);

Promise.resolve().then(() => {
  console.log("3");        // microtask
});

console.log("4");          // sync

// Output: 1, 4, 3, 2
// Microtask (Promise) runs before macrotask (setTimeout)`,
        language: "javascript",
        bestPractices: [
            "Break up heavy synchronous work with setTimeout(fn, 0) or requestIdleCallback",
            "Use queueMicrotask for subtle ordering guarantees",
            "Never block the event loop with synchronous file I/O in Node.js servers",
        ],
        resources: [
            { title: "Event Loop Visualizer", url: "https://www.jsv9000.app/" },
            { title: "What the heck is the event loop? — Jake Archibald", url: "https://www.youtube.com/watch?v=8aGhZQkoFbQ" },
        ],
    },
    "ES6+ Features": {
        overview: "ES2015 (ES6) and later versions brought transformative features to JavaScript: arrow functions, destructuring, template literals, modules, classes, and much more. These features improve readability, expressiveness, and safety.",
        keyPoints: [
            "Arrow functions: concise syntax + lexical `this` binding",
            "Destructuring: extract values from arrays/objects elegantly",
            "Spread/Rest operators: `...` for cloning, merging, and variadic functions",
            "Optional chaining `?.` and nullish coalescing `??` handle null/undefined safely",
            "Modules: `import`/`export` for encapsulated, reusable code",
        ],
        codeExample: `// Arrow functions + destructuring
const { name, age = 25 } = user;
const greet = ({ name }) => \`Hello, \${name}!\`;

// Spread / Rest
const merged = { ...defaults, ...overrides };
const [first, ...rest] = items;

// Optional chaining + nullish coalescing
const city = user?.address?.city ?? "Unknown";

// Dynamic import (lazy loading)
const { Chart } = await import("./chart.js");`,
        language: "javascript",
        bestPractices: [
            "Prefer const > let > var; never use var in new code",
            "Use optional chaining before accessing nested object properties",
            "Avoid mutation — use spread/Object.assign to create new objects",
        ],
        resources: [
            { title: "ES6 Features — es6-features.org", url: "http://es6-features.org/" },
            { title: "javascript.info — Modern JS", url: "https://javascript.info/" },
        ],
    },
    "DOM Manipulation": {
        overview: "The Document Object Model (DOM) is a tree representation of an HTML document. JavaScript can query, create, modify, and delete DOM nodes to build dynamic user interfaces. Modern APIs like `querySelector`, `classList`, and `MutationObserver` make this easier than ever.",
        keyPoints: [
            "querySelector/querySelectorAll use CSS selectors to find elements",
            "createElement + appendChild/insertAdjacentElement add new nodes",
            "classList.add/remove/toggle/contains manage CSS classes efficiently",
            "Event delegation: attach one listener on a parent instead of many on children",
            "MutationObserver watches for DOM changes without polling",
        ],
        codeExample: `// Select and modify
const btn = document.querySelector("#submit-btn");
btn.textContent = "Loading...";
btn.disabled = true;

// Event delegation
document.querySelector("#list").addEventListener("click", (e) => {
  if (e.target.matches(".item")) {
    e.target.classList.toggle("selected");
  }
});

// Create and append
const card = document.createElement("div");
card.className = "card";
card.innerHTML = \`<h2>\${title}</h2><p>\${desc}</p>\`;
document.querySelector("#container").appendChild(card);`,
        language: "javascript",
        bestPractices: [
            "Cache DOM references in variables — repeated querySelector is slow",
            "Use event delegation for lists of dynamically created items",
            "Batch DOM updates with DocumentFragment to minimize reflows",
        ],
        resources: [
            { title: "DOM Manipulation — MDN", url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents" },
        ],
    },
    "useState": {
        overview: "`useState` is React's most fundamental hook. It lets function components hold and update local state. When state changes, React re-renders the component with the new value. State should be used for values that affect the rendered output.",
        keyPoints: [
            "useState returns [value, setter] — destructure as [count, setCount]",
            "Calling the setter triggers a re-render with the new value",
            "State updates are asynchronous — don't read the new value immediately after setting",
            "Use the functional update form `setCount(c => c + 1)` when new state depends on old",
            "State is component-local; lift it up to share between siblings",
        ],
        codeExample: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  // Functional update — safe when depending on previous state
  const increment = () => setCount(c => c + 1);
  const reset = () => setCount(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}`,
        language: "tsx",
        bestPractices: [
            "Keep state minimal — derive computed values rather than storing them",
            "Use arrays/objects in state by replacing, not mutating",
            "Consider useReducer when state logic gets complex",
        ],
        resources: [
            { title: "useState — React Docs", url: "https://react.dev/reference/react/useState" },
        ],
    },
    "useEffect": {
        overview: "`useEffect` lets you synchronize a component with external systems — APIs, subscriptions, timers, or DOM operations. It runs after the render and can optionally clean up after itself. The dependency array controls when it re-runs.",
        keyPoints: [
            "Effect runs after every render by default; pass [] to run only on mount",
            "Return a cleanup function to cancel subscriptions/timers on unmount",
            "List all values used inside the effect in the dependency array",
            "Don't lie about dependencies — React's linter will warn you",
            "Avoid async functions directly in useEffect; define them inside and call them",
        ],
        codeExample: `import { useEffect, useState } from "react";

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      const res = await fetch(\`/api/users/\${userId}\`);
      const data = await res.json();
      if (!cancelled) setUser(data);
    }

    fetchUser();

    // Cleanup: prevent stale state if userId changes before fetch completes
    return () => { cancelled = true; };
  }, [userId]); // Re-run when userId changes

  return <div>{user ? user.name : "Loading..."}</div>;
}`,
        language: "tsx",
        bestPractices: [
            "Always return a cleanup function when subscribing to events or streams",
            "Use a 'cancelled' flag or AbortController for async fetches",
            "Move complex data-fetching logic to a custom hook or React Query",
        ],
        resources: [
            { title: "useEffect — React Docs", url: "https://react.dev/reference/react/useEffect" },
        ],
    },
    "TypeScript": {
        overview: "TypeScript is a statically typed superset of JavaScript. By adding type annotations, TypeScript catches bugs at compile time rather than runtime, improves IDE autocomplete, and makes large codebases more maintainable. It compiles down to plain JavaScript.",
        keyPoints: [
            "Type inference lets TypeScript infer types without explicit annotations",
            "Interface vs type alias: interfaces are extendable; type aliases allow unions",
            "Generics allow reusable, type-safe data structures and functions",
            "Strict mode catches the most bugs — always enable it",
            "Declaration files (.d.ts) add types to JavaScript libraries",
        ],
        codeExample: `// Explicit types
function greet(name: string, age: number): string {
  return \`Hello \${name}, you are \${age} years old\`;
}

// Generic function
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Union type + type narrowing
type Status = "loading" | "success" | "error";

function handleStatus(status: Status) {
  if (status === "error") {
    console.error("Something went wrong");
  }
}`,
        language: "typescript",
        bestPractices: [
            "Enable strict: true in tsconfig.json from day one",
            "Avoid using `any` — use `unknown` and narrow the type",
            "Use utility types (Partial, Required, Pick, Omit) to transform types",
        ],
        resources: [
            { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
            { title: "TypeScript Playground", url: "https://www.typescriptlang.org/play" },
        ],
    },
    "Tailwind CSS": {
        overview: "Tailwind CSS is a utility-first CSS framework. Instead of writing custom CSS, you compose designs from small, single-purpose utility classes directly in your HTML. It ships a tiny production bundle via PurgeCSS and is highly customizable via a config file.",
        keyPoints: [
            "Utility classes map directly to CSS properties: `p-4` = padding: 1rem",
            "Responsive prefixes: sm:, md:, lg:, xl:, 2xl: apply at breakpoints",
            "State variants: hover:, focus:, active:, disabled: for interactive states",
            "Dark mode: add `dark:` prefix; works with media query or class strategy",
            "The `@apply` directive lets you extract repeated utility combos into CSS classes",
        ],
        codeExample: `<!-- Responsive card with hover effect -->
<div class="
  bg-white dark:bg-gray-800
  rounded-xl shadow-md
  p-6 max-w-sm
  hover:shadow-xl
  transition-shadow duration-300
">
  <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
    Card Title
  </h2>
  <p class="text-gray-600 dark:text-gray-300 text-sm">
    Card description goes here.
  </p>
  <button class="
    mt-4 px-4 py-2 rounded-lg
    bg-blue-600 hover:bg-blue-700
    text-white text-sm font-medium
    transition-colors
  ">
    Action
  </button>
</div>`,
        language: "html",
        bestPractices: [
            "Use the Tailwind VSCode extension for class autocomplete and sorting",
            "Extract repeated class combos into components, not @apply",
            "Keep your tailwind.config.js theme tokens consistent",
        ],
        resources: [
            { title: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs" },
            { title: "Tailwind UI Components", url: "https://tailwindui.com/" },
        ],
    },
    "Docker": {
        overview: "Docker packages applications and their dependencies into portable containers that run identically everywhere. A Dockerfile defines the environment; `docker build` creates an image; `docker run` starts a container. Docker Compose orchestrates multi-container applications.",
        keyPoints: [
            "Images are immutable snapshots; containers are running instances of images",
            "Layers are cached — order your Dockerfile instructions from least to most frequently changed",
            "Multi-stage builds keep production images small by discarding build tools",
            "Named volumes persist data beyond container lifecycle",
            "Bridge networks allow containers to communicate by service name",
        ],
        codeExample: `# Multi-stage Node.js Dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN adduser -D appuser && chown -R appuser /app
USER appuser
EXPOSE 3000
CMD ["node", "server.js"]`,
        language: "dockerfile",
        bestPractices: [
            "Always run containers as a non-root user",
            "Use .dockerignore to exclude node_modules and .git",
            "Use multi-stage builds to minimize final image size",
        ],
        resources: [
            { title: "Docker Getting Started", url: "https://docs.docker.com/get-started/" },
            { title: "Docker Best Practices", url: "https://docs.docker.com/develop/dev-best-practices/" },
        ],
    },
    "Kubernetes": {
        overview: "Kubernetes (K8s) is an open-source container orchestration platform. It automates deployment, scaling, and management of containerized applications across clusters of machines. Key concepts: Pods (smallest deployable unit), Deployments (declarative updates), Services (stable network endpoint), and ConfigMaps/Secrets.",
        keyPoints: [
            "Pods group one or more containers; they share network and storage",
            "Deployments manage rollouts and rollbacks declaratively",
            "Services expose pods via stable DNS names (ClusterIP, LoadBalancer)",
            "ConfigMaps store non-sensitive config; Secrets store sensitive data (base64 encoded)",
            "Horizontal Pod Autoscaler scales pods based on CPU/memory metrics",
        ],
        codeExample: `# Deployment + Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: my-app:1.0.0
        ports:
        - containerPort: 3000
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "256Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: web-svc
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 3000`,
        language: "yaml",
        bestPractices: [
            "Always set resource requests and limits on containers",
            "Use Deployments, not bare Pods — they enable self-healing",
            "Store secrets in a dedicated secret manager, not directly in K8s Secrets",
        ],
        resources: [
            { title: "Kubernetes Docs", url: "https://kubernetes.io/docs/home/" },
            { title: "Kubernetes the Hard Way", url: "https://github.com/kelseyhightower/kubernetes-the-hard-way" },
        ],
    },
    "JWT Tokens": {
        overview: "JSON Web Tokens (JWT) are a compact, URL-safe way to represent claims between parties. A JWT consists of three base64url-encoded parts: header (algorithm), payload (claims), and signature. They are commonly used for stateless authentication — the server verifies the signature without a database lookup.",
        keyPoints: [
            "JWT = Header.Payload.Signature — each part is base64url-encoded",
            "The signature is created with a secret (HMAC-SHA256) or private key (RS256)",
            "Payload claims: sub (subject/user ID), exp (expiration), iat (issued at)",
            "JWTs are not encrypted by default — don't store sensitive data in the payload",
            "Short expiration + refresh token rotation is the safest pattern",
        ],
        codeExample: `import jwt from "jsonwebtoken";

// Sign a token (server-side)
const token = jwt.sign(
  { sub: user.id, email: user.email },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" }
);

// Verify a token (server-side middleware)
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET!);
  req.user = payload;
  next();
} catch (err) {
  return res.status(401).json({ error: "Invalid token" });
}`,
        language: "typescript",
        bestPractices: [
            "Use short-lived access tokens (15 min) with longer refresh tokens",
            "Store JWTs in httpOnly cookies, not localStorage (XSS-safe)",
            "Always validate the algorithm in the header — reject 'none' algorithm",
        ],
        resources: [
            { title: "JWT.io Debugger", url: "https://jwt.io/" },
            { title: "JWT Authentication Best Practices", url: "https://auth0.com/blog/jwt-security-best-practices/" },
        ],
    },
    "OAuth 2.0": {
        overview: "OAuth 2.0 is an authorization framework that lets users grant third-party applications limited access to their accounts without sharing credentials. Common flows include Authorization Code (web apps), Client Credentials (machine-to-machine), and Device Code (TVs/CLI tools).",
        keyPoints: [
            "Authorization Code Flow: user logs in at provider, app receives a code, exchanges for access token",
            "PKCE (Proof Key for Code Exchange) protects public clients from code interception",
            "Access tokens are short-lived; refresh tokens exchange for new access tokens",
            "Scopes limit what the access token can do (read:profile, write:posts)",
            "OpenID Connect (OIDC) extends OAuth 2.0 with an ID token for authentication",
        ],
        bestPractices: [
            "Always use PKCE for browser and mobile apps",
            "Store tokens securely — access token in memory, refresh token in httpOnly cookie",
            "Validate the state parameter to prevent CSRF attacks",
        ],
        resources: [
            { title: "OAuth 2.0 Simplified", url: "https://www.oauth.com/" },
            { title: "OAuth 2.0 Flows — Auth0", url: "https://auth0.com/docs/get-started/authentication-and-authorization-flow" },
        ],
    },
    "OWASP Top 10": {
        overview: "The OWASP Top 10 is the authoritative list of the most critical web application security risks. Published by the Open Web Application Security Project, it provides developers with guidance on the most common and impactful vulnerabilities to defend against.",
        keyPoints: [
            "A01: Broken Access Control — users access resources they shouldn't",
            "A02: Cryptographic Failures — weak encryption, hardcoded secrets",
            "A03: Injection (SQL, NoSQL, Command, LDAP) — untrusted data as commands",
            "A04: Insecure Design — missing threat modeling at design phase",
            "A07: Identification & Authentication Failures — weak passwords, no MFA",
        ],
        bestPractices: [
            "Validate and sanitize all user input — on both client and server",
            "Use parameterized queries (prepared statements) to prevent SQL injection",
            "Implement proper access control — deny by default, allow explicitly",
        ],
        resources: [
            { title: "OWASP Top 10 2021", url: "https://owasp.org/Top10/" },
            { title: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/" },
        ],
    },
    "Neural Networks": {
        overview: "Artificial neural networks are computational models inspired by the brain. They consist of layers of interconnected nodes (neurons) with learnable weights. Forward propagation computes predictions; backpropagation with gradient descent updates weights to minimize a loss function.",
        keyPoints: [
            "Layers: input layer → hidden layers → output layer",
            "Activation functions (ReLU, Sigmoid, Softmax) introduce non-linearity",
            "Loss functions measure error: MSE for regression, Cross-Entropy for classification",
            "Backpropagation computes gradients via the chain rule",
            "Batch normalization stabilizes training; Dropout prevents overfitting",
        ],
        codeExample: `import torch
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 10),  # 10 classes
        )

    def forward(self, x):
        return self.layers(x)

model = SimpleNet()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()`,
        language: "python",
        bestPractices: [
            "Start with a small model and scale up — avoid overly complex architectures early",
            "Always normalize your inputs (zero mean, unit variance)",
            "Use learning rate scheduling for better convergence",
        ],
        resources: [
            { title: "Neural Networks — 3Blue1Brown", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi" },
            { title: "fast.ai Deep Learning Course", url: "https://course.fast.ai/" },
        ],
    },
    "Transformers": {
        overview: "The Transformer architecture, introduced in 'Attention is All You Need' (2017), revolutionized NLP and AI. It replaces recurrence with self-attention, allowing full parallelization during training. GPT, BERT, T5, and virtually all modern LLMs are built on Transformers.",
        keyPoints: [
            "Self-attention computes attention scores between all token pairs simultaneously",
            "Multi-head attention runs multiple attention computations in parallel",
            "Positional encodings add sequence order information (absent in pure attention)",
            "Encoder-only (BERT): good for classification/understanding tasks",
            "Decoder-only (GPT): good for text generation tasks",
        ],
        bestPractices: [
            "Use pre-trained models from Hugging Face rather than training from scratch",
            "Flash Attention reduces memory from O(n²) to O(n) for long sequences",
            "Monitor attention patterns to debug model behavior",
        ],
        resources: [
            { title: "The Illustrated Transformer — Jay Alammar", url: "https://jalammar.github.io/illustrated-transformer/" },
            { title: "Attention is All You Need (Paper)", url: "https://arxiv.org/abs/1706.03762" },
        ],
    },
    "Git basics": {
        overview: "Git is a distributed version control system that tracks changes to files over time. It allows multiple developers to collaborate, maintain history, and experiment safely via branches. Key concepts: commits (snapshots), branches (parallel lines of work), merge/rebase (combining history).",
        keyPoints: [
            "git init creates a repository; git clone copies a remote one",
            "Staging area (index) lets you craft precise commits",
            "Commits are immutable snapshots with a hash, author, and message",
            "Branches are just pointers to commits — cheap to create and delete",
            "git merge preserves history; git rebase replays commits for a clean history",
        ],
        codeExample: `# Daily workflow
git status                    # see what changed
git add src/feature.ts        # stage specific files
git commit -m "feat: add user search"

# Branch workflow
git checkout -b feature/search  # create + switch
git push -u origin feature/search

# Undo last commit (keep changes staged)
git reset --soft HEAD~1

# View history
git log --oneline --graph --decorate`,
        language: "bash",
        bestPractices: [
            "Write meaningful commit messages: prefix with feat:, fix:, chore:, docs:",
            "Commit small, focused changes — easier to review and revert",
            "Never force-push to main/master",
        ],
        resources: [
            { title: "Pro Git Book (free)", url: "https://git-scm.com/book/en/v2" },
            { title: "Learn Git Branching (interactive)", url: "https://learngitbranching.js.org/" },
        ],
    },
    "CAP Theorem": {
        overview: "The CAP Theorem states that a distributed system can provide only 2 of 3 guarantees simultaneously: Consistency (all nodes see the same data), Availability (every request gets a response), and Partition Tolerance (system works despite network failures). Since partitions are unavoidable in real networks, you must choose between CP or AP.",
        keyPoints: [
            "CP systems (e.g., ZooKeeper, HBase): return errors during partitions but stay consistent",
            "AP systems (e.g., Cassandra, CouchDB): always respond but may return stale data",
            "CA (no partition tolerance) is impossible in real distributed networks",
            "PACELC extends CAP: also considers Latency vs Consistency tradeoffs during normal operation",
            "Most modern databases offer tunable consistency (Cassandra's consistency levels)",
        ],
        bestPractices: [
            "Design your data model around the consistency requirements of each use case",
            "Use CP for financial transactions; AP for social feeds and analytics",
            "Document your consistency decisions in architecture decision records",
        ],
        resources: [
            { title: "CAP Theorem Explained — Cloudflare", url: "https://www.cloudflare.com/learning/distributed-systems/cap-theorem/" },
        ],
    },
    "Goroutines": {
        overview: "Goroutines are Go's lightweight concurrency primitive — similar to threads but far cheaper (a few KB of stack vs MB for OS threads). The Go runtime multiplexes goroutines onto OS threads. Goroutines communicate via channels, following the mantra: 'Don't communicate by sharing memory; share memory by communicating.'",
        keyPoints: [
            "Start a goroutine with `go func(){}()` — it runs concurrently",
            "Goroutines are multiplexed onto OS threads by the Go scheduler (M:N threading)",
            "Channels are typed conduits for communication between goroutines",
            "sync.WaitGroup tracks completion of a group of goroutines",
            "The `context` package propagates cancellation signals through goroutine trees",
        ],
        codeExample: `package main

import (
    "fmt"
    "sync"
)

func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done()
    fmt.Printf("Worker %d done\\n", id)
}

func main() {
    var wg sync.WaitGroup

    for i := 1; i <= 5; i++ {
        wg.Add(1)
        go worker(i, &wg)
    }

    wg.Wait() // Block until all workers finish
    fmt.Println("All workers done")
}`,
        language: "go",
        bestPractices: [
            "Always use sync.WaitGroup or channels to wait for goroutines to finish",
            "Pass context.Context for cancellation and deadline propagation",
            "Use the race detector (go test -race) to find data races",
        ],
        resources: [
            { title: "Go Concurrency Patterns — Rob Pike", url: "https://go.dev/talks/2012/concurrency.slide" },
            { title: "Tour of Go — Concurrency", url: "https://go.dev/tour/concurrency/1" },
        ],
    },
};

// ── Smart fallback template ────────────────────────────────────────────────
function buildFallback(topic: string): TopicContent {
    const isCodeRelated = /\b(code|program|function|class|api|query|script|algorithm|syntax|pattern|debug)\b/i.test(topic);

    return {
        overview: `${topic} is a key concept in software development. Mastering it will strengthen your ability to build reliable, efficient, and maintainable software. This topic covers the core principles, common patterns, and practical techniques that professionals use in real-world projects.`,
        keyPoints: [
            `Understand the fundamental concepts and purpose of ${topic}`,
            `Learn the most common use cases and when to apply ${topic}`,
            `Explore best practices adopted by the industry`,
            `Identify common pitfalls and how to avoid them`,
            `Practice with real examples to build confidence`,
        ],
        codeExample: isCodeRelated
            ? `// Example: Working with ${topic}
// Try implementing a basic example here.
// Start simple, then add complexity as you understand the fundamentals.

// Step 1: Import or set up the dependency
// Step 2: Define your data / configuration
// Step 3: Implement the core logic
// Step 4: Test with different inputs`
            : undefined,
        language: isCodeRelated ? "javascript" : undefined,
        bestPractices: [
            `Read the official documentation for ${topic} — it is the most accurate source`,
            `Start with a minimal working example before scaling up`,
            `Review how established open-source projects implement ${topic}`,
            `Write tests as you learn to verify your understanding`,
        ],
        resources: [
            { title: `Search "${topic}" on MDN Web Docs`, url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topic)}` },
            { title: `"${topic}" on freeCodeCamp`, url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(topic)}` },
            { title: `"${topic}" articles on dev.to`, url: `https://dev.to/search?q=${encodeURIComponent(topic)}` },
        ],
    };
}

// ── Public API ─────────────────────────────────────────────────────────────
export function getTopicContent(topicName: string): TopicContent {
    // Exact match
    if (CONTENT[topicName]) return CONTENT[topicName];

    // Partial match (e.g. "useState" matches "useState & useEffect intro")
    for (const key of Object.keys(CONTENT)) {
        if (
            topicName.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(topicName.toLowerCase())
        ) {
            return CONTENT[key];
        }
    }

    // Fallback
    return buildFallback(topicName);
}
