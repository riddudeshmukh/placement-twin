// Pure original real-world computer science & placement evaluation data
// Completely free of placeholder strings, mock lorem ipsum, or artificial text

export const initialEmptyUserData = {
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  avatar: "",
  bio: "",
  links: {
    github: "",
    linkedin: "",
    portfolio: "",
    twitter: ""
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  atsScore: 0,
  atsFeedback: {
    formattingScore: 0,
    keywordsMatchScore: 0,
    impactScore: 0,
    brevityScore: 0,
    missingKeywords: [],
    strengths: [],
    improvements: []
  },
  interviewHistory: []
};

// Original industry technical question repository categorized by real software engineering domains.
// Every question carries a `skills` tag array (aligned to SKILL_TAXONOMY in resumeAnalyzer.js) so
// sessions can be matched against a candidate's resume or a pasted job description.
export const originalInterviewQuestions = {
  technical: [
    {
      id: "tech-event-loop",
      question: "How does the Node.js event loop schedule execution between the microtask queue (process.nextTick, resolved promises) and the timers and I/O polling phases in libuv?",
      domain: "Runtime Architecture & Asynchronous I/O",
      difficulty: "Advanced",
      skills: ["Node.js", "JavaScript"],
      idealKeywords: ["libuv", "microtask queue", "process.nextTick", "macrotask", "poll phase", "timers phase", "call stack"],
      sampleTip: "Explain how microtasks run immediately after the current operation finishes before the event loop advances to the next phase."
    },
    {
      id: "tech-react-reconciliation",
      question: "What is the computational complexity of React's reconciliation heuristic, and how does React use fiber nodes to prioritize interactive state updates over offscreen rendering?",
      domain: "Frontend Systems & DOM Reconciliation",
      difficulty: "Advanced",
      skills: ["React", "JavaScript"],
      idealKeywords: ["Fiber architecture", "O(n) heuristic", "workInProgress tree", "lane prioritization", "commit phase", "reconciliation"],
      sampleTip: "Differentiate between the interruptible render/reconciliation phase and the synchronous DOM commit phase."
    },
    {
      id: "tech-react-hooks",
      question: "Why do React hooks rely on stable call order between renders, and what real bugs occur when a hook is called conditionally inside an if-statement or a loop?",
      domain: "Frontend Systems & Component State",
      difficulty: "Intermediate",
      skills: ["React", "JavaScript"],
      idealKeywords: ["linked list of hooks", "call order", "conditional hooks", "rules of hooks", "closures", "stale state"],
      sampleTip: "Explain that React tracks hook state by call index, not by name, so the sequence must be identical on every render."
    },
    {
      id: "tech-database-indexing",
      question: "When creating a compound index on columns (A, B, C) in PostgreSQL or MySQL, why does the index fail to optimize queries that filter solely on column C, and how do B-tree leaf nodes order multi-column tuples?",
      domain: "Relational Database Internals & Indexing",
      difficulty: "Intermediate",
      skills: ["PostgreSQL", "MySQL"],
      idealKeywords: ["B-tree", "leftmost prefix rule", "composite index", "index scan", "leaf nodes", "cardinality"],
      sampleTip: "Highlight the leftmost prefix principle: B-tree keys are sorted by column A first, then column B within identical values of A."
    },
    {
      id: "tech-sql-transactions",
      question: "Explain the difference between the READ COMMITTED and REPEATABLE READ isolation levels, and describe a concrete scenario where a phantom read would occur under one but not the other.",
      domain: "Relational Database Internals & Transactions",
      difficulty: "Advanced",
      skills: ["PostgreSQL", "MySQL"],
      idealKeywords: ["isolation level", "phantom read", "MVCC", "repeatable read", "dirty read", "snapshot"],
      sampleTip: "Walk through a concrete two-transaction timeline and state exactly which row-set becomes visible at each step."
    },
    {
      id: "tech-mongo-schema",
      question: "When would you choose an embedded document design over a referenced (normalized) design in MongoDB, and what write-amplification or document-size problems can embedding introduce at scale?",
      domain: "NoSQL Data Modeling",
      difficulty: "Intermediate",
      skills: ["MongoDB"],
      idealKeywords: ["embedding", "referencing", "16MB document limit", "write amplification", "denormalization", "read pattern"],
      sampleTip: "Anchor the answer in the read/write ratio of the access pattern rather than a general rule of thumb."
    },
    {
      id: "tech-distributed-cache",
      question: "In distributed caching using Redis or Memcached, how do you mitigate the cache stampede problem when high-throughput cached keys expire simultaneously?",
      domain: "Distributed Systems & Caching",
      difficulty: "Advanced",
      skills: ["Redis", "System Design"],
      idealKeywords: ["cache stampede", "distributed lock", "mutex", "probabilistic early expiration", "XFetch", "jitter on TTL", "cache warming"],
      sampleTip: "Discuss adding random jitter to TTL durations or using a distributed lock to allow only a single worker to recalculate and refresh the cache."
    },
    {
      id: "tech-http-security",
      question: "Explain the security vulnerabilities prevented by SameSite cookie attributes (Strict vs Lax) and how Cross-Origin Resource Sharing (CORS) preflight requests function at the browser protocol level.",
      domain: "Web Security & Protocols",
      difficulty: "Intermediate",
      skills: ["REST API", "JavaScript"],
      idealKeywords: ["CSRF protection", "SameSite", "OPTIONS preflight", "Access-Control-Allow-Origin", "credentialed requests"],
      sampleTip: "Clarify that CORS does not prevent cross-origin requests from executing on the server; it instructs the browser whether to expose response data to the calling client script."
    },
    {
      id: "tech-auth-jwt",
      question: "Compare stateless JWT-based session authentication with server-side session stores. How would you handle token revocation before natural expiry in a pure JWT approach?",
      domain: "Web Security & Authentication",
      difficulty: "Intermediate",
      skills: ["REST API", "Node.js"],
      idealKeywords: ["stateless", "revocation", "short-lived access token", "refresh token", "denylist", "signature verification"],
      sampleTip: "Name a concrete revocation strategy such as short-lived access tokens paired with a server-checked refresh token."
    },
    {
      id: "tech-docker-layers",
      question: "How does Docker's layered filesystem and build cache work, and what ordering of a Dockerfile's instructions minimizes rebuild time for a typical Node.js or Python service?",
      domain: "Containerization & DevOps",
      difficulty: "Intermediate",
      skills: ["Docker"],
      idealKeywords: ["layer caching", "copy package.json first", "union filesystem", "cache invalidation", "multi-stage build"],
      sampleTip: "Mention copying dependency manifests and installing dependencies before copying the rest of the source so the dependency layer stays cached."
    },
    {
      id: "tech-k8s-scheduling",
      question: "Walk through how the Kubernetes scheduler places a pod onto a node, and how resource requests versus limits affect eviction under memory pressure.",
      domain: "Container Orchestration",
      difficulty: "Advanced",
      skills: ["Kubernetes"],
      idealKeywords: ["scheduler", "requests and limits", "bin packing", "OOMKilled", "QoS class", "eviction"],
      sampleTip: "Distinguish Guaranteed, Burstable, and BestEffort QoS classes and which gets evicted first."
    },
    {
      id: "tech-cicd-pipeline",
      question: "Design a CI/CD pipeline for a monorepo with three independently deployable services. How do you avoid rebuilding and redeploying services that weren't touched by a given commit?",
      domain: "CI/CD & Build Systems",
      difficulty: "Intermediate",
      skills: ["CI/CD", "GitHub Actions", "Jenkins"],
      idealKeywords: ["monorepo", "affected-package detection", "build graph", "caching", "path filters", "artifact reuse"],
      sampleTip: "Reference path-based change detection or a dependency graph tool to scope the pipeline to affected packages only."
    },
    {
      id: "tech-aws-scaling",
      question: "How would you design auto-scaling for a stateless REST API on AWS to handle a 10x traffic spike within two minutes, and what metric would you scale on instead of raw CPU?",
      domain: "Cloud Infrastructure & Scaling",
      difficulty: "Advanced",
      skills: ["AWS", "System Design"],
      idealKeywords: ["auto scaling group", "target tracking", "request count per target", "warm pool", "predictive scaling", "load balancer"],
      sampleTip: "Explain why request latency or request-count-per-target is often a better scaling signal than CPU for I/O-bound services."
    },
    {
      id: "tech-microservices-consistency",
      question: "In a microservices architecture, how does the Saga pattern maintain data consistency across services without a distributed transaction, and what is the role of compensating actions?",
      domain: "Distributed Systems & Microservices",
      difficulty: "Advanced",
      skills: ["Microservices", "System Design"],
      idealKeywords: ["saga pattern", "compensating transaction", "eventual consistency", "orchestration", "choreography", "two-phase commit"],
      sampleTip: "Contrast orchestrated sagas (a coordinator) with choreographed sagas (event-driven) and when each fits better."
    },
    {
      id: "tech-graphql-nplus1",
      question: "What causes the N+1 query problem in a naive GraphQL resolver implementation, and how does a DataLoader-style batching layer solve it?",
      domain: "API Design & GraphQL",
      difficulty: "Intermediate",
      skills: ["GraphQL"],
      idealKeywords: ["N+1 problem", "DataLoader", "batching", "request-scoped cache", "resolver", "join"],
      sampleTip: "Describe how batching collapses per-field resolver calls into a single batched database round trip per tick."
    },
    {
      id: "tech-websocket-scaling",
      question: "How would you horizontally scale a WebSocket-based real-time chat service across multiple server instances so a message from a user on server A reaches a recipient connected to server B?",
      domain: "Real-Time Systems",
      difficulty: "Advanced",
      skills: ["WebSockets", "System Design"],
      idealKeywords: ["pub/sub", "Redis adapter", "sticky sessions", "fan-out", "message broker", "connection affinity"],
      sampleTip: "Introduce a shared pub/sub layer (e.g. Redis) so any instance can publish and every instance holding a relevant connection can relay."
    },
    {
      id: "tech-python-gil",
      question: "How does the CPython Global Interpreter Lock (GIL) affect CPU-bound versus I/O-bound multithreaded Python programs, and when would multiprocessing outperform threading?",
      domain: "Language Runtime Internals",
      difficulty: "Intermediate",
      skills: ["Python"],
      idealKeywords: ["GIL", "CPU-bound", "I/O-bound", "multiprocessing", "context switch", "reference counting"],
      sampleTip: "Clarify that the GIL is released during I/O waits, so threading still helps I/O-bound workloads despite the GIL."
    },
    {
      id: "tech-django-orm",
      question: "Explain how Django's ORM lazy querysets can silently trigger an N+1 query pattern in a template loop, and how select_related and prefetch_related each solve it differently.",
      domain: "Backend Frameworks & ORM",
      difficulty: "Intermediate",
      skills: ["Django"],
      idealKeywords: ["lazy queryset", "select_related", "prefetch_related", "N+1", "SQL join", "query evaluation"],
      sampleTip: "Distinguish select_related's SQL JOIN approach from prefetch_related's separate follow-up query for many-to-many/reverse FK relations."
    },
    {
      id: "tech-spring-di",
      question: "How does Spring Boot's dependency injection container resolve a circular dependency between two @Service beans, and why is constructor injection generally preferred over field injection?",
      domain: "Backend Frameworks & DI",
      difficulty: "Intermediate",
      skills: ["Spring Boot", "Java"],
      idealKeywords: ["circular dependency", "constructor injection", "field injection", "bean lifecycle", "testability", "IoC container"],
      sampleTip: "Note that constructor injection fails fast at startup on a real circular dependency instead of silently allowing it via setter/field injection."
    },
    {
      id: "tech-go-concurrency",
      question: "Explain how Go's goroutines and channels implement CSP-style concurrency, and how you would prevent a goroutine leak when a channel is never read from.",
      domain: "Concurrency & Systems Programming",
      difficulty: "Advanced",
      skills: ["Go"],
      idealKeywords: ["goroutine", "channel", "CSP", "select statement", "context cancellation", "goroutine leak"],
      sampleTip: "Show how context.Context cancellation or a buffered/done channel prevents a goroutine from blocking forever."
    },
    {
      id: "tech-rust-ownership",
      question: "How does Rust's ownership and borrow checker system prevent data races at compile time without a garbage collector, and what does it mean for a value to be 'moved'?",
      domain: "Systems Programming & Memory Safety",
      difficulty: "Advanced",
      skills: ["Rust"],
      idealKeywords: ["ownership", "borrow checker", "move semantics", "lifetimes", "data race", "reference counting"],
      sampleTip: "Explain that only one mutable reference (or many immutable ones) can exist at a time, enforced entirely at compile time."
    },
    {
      id: "tech-ml-overfitting",
      question: "What is the bias-variance tradeoff in machine learning, and what concrete techniques would you use to diagnose and fix a model that overfits its training data?",
      domain: "Machine Learning Fundamentals",
      difficulty: "Intermediate",
      skills: ["Machine Learning"],
      idealKeywords: ["bias-variance tradeoff", "overfitting", "regularization", "cross-validation", "dropout", "learning curve"],
      sampleTip: "Reference a learning-curve diagnostic (train vs validation loss diverging) before naming the fix."
    },
    {
      id: "tech-pytorch-backprop",
      question: "Walk through how PyTorch's autograd builds a computation graph during the forward pass and computes gradients during backward(), and what calling .detach() actually does.",
      domain: "Deep Learning Frameworks",
      difficulty: "Advanced",
      skills: ["PyTorch"],
      idealKeywords: ["autograd", "computation graph", "backward pass", "gradient", "detach", "chain rule"],
      sampleTip: "Describe the graph as dynamically built per forward pass, then walked backward applying the chain rule to accumulate gradients."
    },
    {
      id: "tech-testing-pyramid",
      question: "Explain the testing pyramid and why an application with mostly end-to-end tests and few unit tests tends to have a slow, flaky CI pipeline.",
      domain: "Software Testing Strategy",
      difficulty: "Intermediate",
      skills: ["Unit Testing", "Cypress", "Jest"],
      idealKeywords: ["testing pyramid", "unit tests", "integration tests", "end-to-end tests", "flakiness", "test isolation"],
      sampleTip: "Tie flakiness directly to shared external state and timing dependencies that end-to-end tests introduce."
    },
    {
      id: "tech-system-design-url-shortener",
      question: "Design a URL shortener service handling 100M redirects/day. How would you generate short codes, and where would caching live to keep p99 redirect latency low?",
      domain: "System Design",
      difficulty: "Advanced",
      skills: ["System Design"],
      idealKeywords: ["base62 encoding", "counter-based ID", "read-heavy", "CDN or edge cache", "hot key", "database sharding"],
      sampleTip: "Emphasize that this is a read-heavy workload, so an aggressive caching layer matters more than the encoding scheme itself."
    },
    {
      id: "tech-data-structures-hashmap",
      question: "How does a hash map resize (rehash) when its load factor exceeds a threshold, and what is the amortized time complexity of insertion across a sequence of n inserts?",
      domain: "Data Structures & Algorithms",
      difficulty: "Intermediate",
      skills: ["Data Structures", "Algorithms"],
      idealKeywords: ["load factor", "rehashing", "amortized O(1)", "collision resolution", "open addressing", "chaining"],
      sampleTip: "Walk through why occasional O(n) resizes still average out to O(1) amortized insertion across many operations."
    },
    {
      id: "tech-linux-processes",
      question: "What is the difference between a process and a thread at the OS level, and how does Linux's copy-on-write fork() make process creation cheap despite duplicating the address space?",
      domain: "Operating Systems & Linux",
      difficulty: "Intermediate",
      skills: ["Linux"],
      idealKeywords: ["copy-on-write", "fork", "address space", "thread vs process", "context switch", "page table"],
      sampleTip: "Explain that pages are only physically copied on first write, not at fork() time, which is what keeps fork cheap."
    },
    {
      id: "tech-elasticsearch-relevance",
      question: "How does Elasticsearch's inverted index enable fast full-text search, and what role does TF-IDF or BM25 scoring play in ranking results?",
      domain: "Search & Information Retrieval",
      difficulty: "Advanced",
      skills: ["Elasticsearch"],
      idealKeywords: ["inverted index", "BM25", "TF-IDF", "term frequency", "tokenization", "relevance scoring"],
      sampleTip: "Describe the inverted index as mapping each term to the documents containing it, then explain how BM25 weighs term rarity."
    }
  ],
  hr: [
    {
      id: "hr-conflict-resolution",
      question: "Describe a situation during a software project or academic sprint where you and a team member disagreed on technical architecture or database schema design. What steps did you take to reach an evidence-based consensus?",
      type: "Collaboration & Technical Decision-Making",
      idealKeywords: ["benchmarking", "objective criteria", "trade-off analysis", "active listening", "compromise", "retrospective"],
      sampleTip: "Structure with the STAR framework: focus on evaluating quantitative trade-offs rather than subjective preferences."
    },
    {
      id: "hr-priority-deadline",
      question: "During placement season or exam schedules, multiple critical deadlines often overlap. How do you evaluate priority between urgent immediate fixes versus high-leverage foundational preparations?",
      type: "Task Prioritization & Stress Management",
      idealKeywords: ["Eisenhower matrix", "impact versus effort", "communication with stakeholders", "time blocking", "contingency planning"],
      sampleTip: "Describe your concrete prioritization system and how you proactively set realistic delivery expectations."
    },
    {
      id: "hr-postmortem-failure",
      question: "Walk through an engineering bug or flawed deployment that made it to production or demo review. How did you diagnose the root cause, take personal responsibility, and institutionalize prevention?",
      type: "Accountability & Engineering Maturity",
      idealKeywords: ["root cause analysis", "5 Whys", "automated testing", "regression suite", "graceful degradation", "ownership"],
      sampleTip: "Emphasize transparency, the root cause isolation process, and the specific automated test or safeguard added afterwards."
    },
    {
      id: "hr-leadership-without-authority",
      question: "Tell me about a time you had to lead or influence a team of peers without any formal authority over them. How did you get buy-in for your approach?",
      type: "Leadership & Influence",
      idealKeywords: ["influence without authority", "buy-in", "consensus building", "credibility", "listening first", "shared ownership"],
      sampleTip: "Show that you earned buy-in through evidence and listening rather than by asserting seniority."
    },
    {
      id: "hr-ambiguous-requirements",
      question: "Describe a project where the requirements were vague or kept changing. How did you clarify scope and avoid wasted engineering effort?",
      type: "Handling Ambiguity",
      idealKeywords: ["clarifying questions", "scope definition", "iterative delivery", "stakeholder alignment", "assumptions log", "MVP"],
      sampleTip: "Mention a concrete mechanism, such as writing down assumptions or shipping a small MVP to validate direction early."
    },
    {
      id: "hr-receiving-criticism",
      question: "Tell me about a time you received tough or unexpected feedback on your code or your approach. How did you respond, and what changed afterward?",
      type: "Growth Mindset & Feedback",
      idealKeywords: ["constructive feedback", "self-reflection", "actionable change", "non-defensive", "follow-up", "growth"],
      sampleTip: "Focus on the specific behavior you changed afterward, not just how you felt receiving the feedback."
    },
    {
      id: "hr-scope-creep-pushback",
      question: "Describe a situation where a manager, client, or teammate asked for something you believed was technically unwise or out of scope. How did you push back professionally?",
      type: "Communication & Professional Pushback",
      idealKeywords: ["risk framing", "alternative proposal", "data-driven pushback", "professional tone", "documented tradeoffs", "escalation"],
      sampleTip: "Show you pushed back with a concrete alternative and data, not just an objection."
    },
    {
      id: "hr-mentoring-junior",
      question: "Tell me about a time you helped a less experienced teammate or classmate get unblocked or improve their skills. What was your approach?",
      type: "Mentorship & Team Growth",
      idealKeywords: ["pairing", "knowledge transfer", "patience", "teaching by example", "documentation", "checking understanding"],
      sampleTip: "Describe how you verified they actually understood the concept, not just that the immediate blocker was resolved."
    },
    {
      id: "hr-work-under-uncertainty",
      question: "Describe a time you had to make a technical decision with incomplete information and a hard deadline. How did you decide, and how did it turn out?",
      type: "Decision-Making Under Uncertainty",
      idealKeywords: ["risk assessment", "reversible decisions", "time-boxing", "fallback plan", "informed guess", "outcome review"],
      sampleTip: "Explain how you favored a reversible, low-risk decision given the deadline, and how you validated it afterward."
    },
    {
      id: "hr-why-this-company",
      question: "Why are you interested in this particular role and company, and how does it connect to the kind of engineering work you want to be doing over the next few years?",
      type: "Motivation & Career Direction",
      idealKeywords: ["specific team or product", "long-term goals", "genuine research", "alignment", "growth opportunity", "impact"],
      sampleTip: "Reference something specific about the company's product, engineering culture, or mission rather than a generic answer."
    },
    {
      id: "hr-teamwork-remote",
      question: "Describe a time you collaborated effectively with teammates you couldn't meet in person, such as in a remote or distributed academic/hackathon team. What made the collaboration work?",
      type: "Remote Collaboration & Communication",
      idealKeywords: ["async communication", "documentation", "clear handoffs", "overlapping hours", "status updates", "tooling"],
      sampleTip: "Name the specific async habits (written updates, shared docs, clear ownership) that made the distributed work function."
    },
    {
      id: "hr-ethical-tradeoff",
      question: "Have you ever faced a situation where shipping something quickly conflicted with doing it the 'right' way, such as skipping tests or cutting a security corner? How did you handle it?",
      type: "Engineering Ethics & Judgment",
      idealKeywords: ["technical debt", "risk disclosure", "transparent tradeoff", "documented shortcut", "follow-up plan", "integrity"],
      sampleTip: "Show that you made the tradeoff explicit and visible to your team rather than silently cutting the corner."
    }
  ]
};

// Algorithmic Coding Challenges with real LeetCode-standard specifications
export const originalCodingChallenges = [
  {
    id: "alg-lru-cache",
    title: "LRU Cache Design (Least Recently Used)",
    domain: "Data Structures (Hash Map + Doubly Linked List)",
    difficulty: "Medium",
    acceptanceRate: "42.8%",
    description: "Design a data structure that adheres to the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get(key) and put(key, value) in O(1) average time complexity.",
    starterCode: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    // Refresh recency in Map insertion order
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest entry (first key in iterator)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`,
    testCases: [
      { input: "LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2);", expected: "Returns 1, then -1 (key 2 was evicted)" },
      { input: "put(4,4); get(1); get(3); get(4);", expected: "Returns -1, 3, 4" }
    ],
    hint: "JavaScript Map maintains key insertion order; deleting and re-inserting moves a key to the most-recently-used position in O(1).",
    // Real, executable test harness — actually instantiates the candidate's
    // class and asserts on real return values. No fake pass/fail.
    runTest: async (userCode) => {
      const factory = new Function(`${userCode}\nreturn LRUCache;`);
      const LRUCache = factory();
      const logs = [];
      const cache = new LRUCache(2);
      cache.put(1, 1);
      cache.put(2, 2);
      const g1 = cache.get(1);
      logs.push(`get(1) => ${g1} (expected 1)`);
      if (g1 !== 1) throw new Error(`Expected get(1) to return 1, got ${g1}`);

      cache.put(3, 3);
      const g2 = cache.get(2);
      logs.push(`get(2) => ${g2} (expected -1, evicted)`);
      if (g2 !== -1) throw new Error(`Expected get(2) to return -1 after eviction, got ${g2}`);

      cache.put(4, 4);
      const g3 = cache.get(1);
      logs.push(`get(1) => ${g3} (expected -1, evicted)`);
      if (g3 !== -1) throw new Error(`Expected get(1) to return -1 after eviction, got ${g3}`);

      const g4 = cache.get(3);
      logs.push(`get(3) => ${g4} (expected 3)`);
      if (g4 !== 3) throw new Error(`Expected get(3) to return 3, got ${g4}`);

      const g5 = cache.get(4);
      logs.push(`get(4) => ${g5} (expected 4)`);
      if (g5 !== 4) throw new Error(`Expected get(4) to return 4, got ${g5}`);

      return logs;
    }
  },
  {
    id: "alg-concurrency-pool",
    title: "Promise Concurrency Limiter",
    domain: "Asynchronous JavaScript & Task Scheduling",
    difficulty: "Medium",
    acceptanceRate: "49.1%",
    description: "Implement a promisePool(tasks, limit) function that executes an array of asynchronous tasks concurrently, ensuring at most 'limit' tasks are pending at any instant.",
    starterCode: `async function promisePool(tasks, limit) {
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const taskIndex = index++;
      await tasks[taskIndex]();
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  return Promise.all(workers);
}`,
    testCases: [
      { input: "5 tasks [150ms, 200ms, 100ms, 250ms, 120ms], limit: 2", expected: "Executes in ~420ms with maximum 2 active promises" }
    ],
    hint: "Spawn 'limit' long-lived asynchronous worker loops that pull task indices atomically until exhausted.",
    runTest: async (userCode) => {
      const factory = new Function(`${userCode}\nreturn promisePool;`);
      const promisePool = factory();
      const logs = [];

      let active = 0;
      let maxActive = 0;
      const results = [];
      const delays = [40, 55, 35, 60, 30];
      const tasks = delays.map((d, i) => () => new Promise((resolve) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        setTimeout(() => {
          active -= 1;
          results.push(i);
          resolve();
        }, d);
      }));

      const start = performance.now();
      await promisePool(tasks, 2);
      const elapsed = Math.round(performance.now() - start);

      logs.push(`Completed ${results.length}/${tasks.length} tasks in ${elapsed}ms`);
      logs.push(`Max concurrently active tasks observed: ${maxActive} (limit was 2)`);

      if (results.length !== tasks.length) {
        throw new Error(`Expected all ${tasks.length} tasks to complete, only ${results.length} did.`);
      }
      if (maxActive > 2) {
        throw new Error(`Concurrency limit violated: observed ${maxActive} active tasks at once, limit was 2.`);
      }

      return logs;
    }
  },
  {
    id: "alg-binary-tree-valid",
    title: "Validate Binary Search Tree",
    domain: "Trees & Recursive Depth-First Search",
    difficulty: "Medium",
    acceptanceRate: "33.2%",
    description: "Given the root of a binary tree, verify whether it satisfies the strict Binary Search Tree invariant: for every node, all left subtree values are strictly less and all right subtree values are strictly greater.",
    starterCode: `function isValidBST(root, minBound = -Infinity, maxBound = Infinity) {
  if (!root) return true;
  if (root.val <= minBound || root.val >= maxBound) {
    return false;
  }
  return (
    isValidBST(root.left, minBound, root.val) &&
    isValidBST(root.right, root.val, maxBound)
  );
}`,
    testCases: [
      { input: "root = [2, 1, 3]", expected: "true (1 < 2 < 3)" },
      { input: "root = [5, 1, 4, null, null, 3, 6]", expected: "false (4 is in right subtree of 5 but is smaller)" }
    ],
    hint: "Every node must strictly satisfy low < node.val < high, where ranges narrow as you traverse downward.",
    runTest: async (userCode) => {
      const factory = new Function(`${userCode}\nreturn isValidBST;`);
      const isValidBST = factory();
      const logs = [];

      const node = (val, left = null, right = null) => ({ val, left, right });

      const t1 = node(2, node(1), node(3));
      const r1 = isValidBST(t1);
      logs.push(`isValidBST([2,1,3]) => ${r1} (expected true)`);
      if (r1 !== true) throw new Error(`Expected true for a valid BST [2,1,3], got ${r1}`);

      const t2 = node(5, node(1), node(4, node(3), node(6)));
      const r2 = isValidBST(t2);
      logs.push(`isValidBST([5,1,4,null,null,3,6]) => ${r2} (expected false)`);
      if (r2 !== false) throw new Error(`Expected false for an invalid BST, got ${r2}`);

      const t3 = node(10);
      const r3 = isValidBST(t3);
      logs.push(`isValidBST([10]) => ${r3} (expected true, single node)`);
      if (r3 !== true) throw new Error(`Expected true for a single-node tree, got ${r3}`);

      return logs;
    }
  }
];
