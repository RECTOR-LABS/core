---
title: MediChain AI
slug: medichain-ai
summary: Five specialized AI agents collaborating through knowledge graphs for transparent, evidence-based medical diagnostics. Built for the ASI Agents Track.
category: AI Agents
status: Draft
github_url: https://github.com/RECTOR-LABS/asi-agents-track
repo_name: RECTOR-LABS/asi-agents-track
created_at: '2025-12-24'
featured: false
technologies:
- Python
- Fetch.ai uAgents
- SingularityNET MeTTa
- Agentverse
- "ASI:One"
github_stars: 0
github_forks: 0
---

# ASI Agents Track: When Five AI Agents Diagnose Better Than One

Twelve million Americans get misdiagnosed every year. Forty billion dollars in healthcare costs. Preventable suffering, preventable deaths. The medical system is overwhelmed, and AI could help — if we build it right.

The ASI Agents Track hackathon asked a provocative question: what if autonomous AI agents could work together on complex problems? I chose healthcare diagnostics. Not because I think AI should replace doctors, but because misdiagnosis is often a symptom of information overload and time pressure. Things AI could address.

The result: MediChain AI — five specialized agents collaborating through knowledge graphs to deliver transparent, evidence-based diagnostic assessments.

**Why Multi-Agent?**

Single-model AI has a problem. Ask ChatGPT to diagnose your symptoms and you get confident-sounding answers with no transparency. Why does it think you have condition X? What evidence supports that conclusion? What alternatives did it consider?

Multi-agent systems fix this. Each agent specializes. Each produces traceable reasoning. The combination is greater than any individual part.

MediChain deploys five agents:

- **Coordinator Agent** — Routes incoming requests to appropriate specialists
- **Patient Intake Agent** — Extracts symptoms through natural language conversation
- **Knowledge Graph Agent** — Performs diagnostic reasoning using MeTTa symbolic logic
- **Symptom Analysis Agent** — Assesses urgency, detects red flags, identifies emergencies
- **Treatment Recommendation Agent** — Validates safety, checks contraindications, suggests evidence-based care

Each agent has a narrow focus. Each does its job well. Together they simulate a multi-disciplinary medical team.

**The Knowledge Graph Difference**

Most AI diagnostics are black boxes. Neural networks that correlate symptoms to conditions without explaining why.

MediChain uses [SingularityNET's MeTTa](https://singularitynet.io) — a symbolic reasoning system that makes logic chains explicit. When the system concludes "possible pneumonia," you can trace the reasoning:

- Patient reports: cough, fever, chest pain
- Knowledge base: these symptoms correlate with respiratory infections
- Differential: pneumonia, bronchitis, COVID-19 have highest match
- Risk factors: patient age and smoking history increase pneumonia probability
- Recommendation: chest X-ray to confirm, urgent care advised

Transparent reasoning builds trust. Doctors can review the logic. Patients understand the assessment. Nobody has to take the AI's word blindly.

**Safety First**

Healthcare AI without safety validation is dangerous. MediChain includes a 14-scenario input validation system:

- Emergency detection (chest pain + shortness of breath = call 911)
- Mental health crisis identification (suicidal ideation triggers crisis resources)
- Inappropriate request filtering (prescription requests, illegal guidance)
- Red flag symptoms (sudden severe headache, unilateral weakness)

The system knows its limits. Not every question should be answered by an AI. Some need immediate human intervention. MediChain recognizes these and responds appropriately.

**The Technical Stack**

Built on [Fetch.ai's uAgents framework](https://fetch.ai) — Python-based autonomous agent development. Each agent runs independently, communicates through standardized protocols, gets deployed to the Agentverse cloud platform.

Knowledge base v2.0 contains:
- 25 medical conditions with diagnostic criteria
- 450+ medical facts for reasoning
- 88+ contraindication rules
- Lab test recommendations per condition
- Imaging requirements and urgency classifications

All grounded in CDC and WHO guidelines. Not hallucinated medical advice — evidence-based protocols encoded as symbolic logic.

Deployment runs on VPS with Agentverse mailbox connectivity. Users interact through the ASI:One chat interface. Type symptoms, receive assessment, follow-up questions as needed.

**The Testing Challenge**

Medical AI requires serious validation. Lives could depend on it (even as a hackathon demo, the standard matters).

169 tests covering:
- Core diagnostic accuracy (does condition X produce correct assessment?)
- Edge cases (unusual symptom combinations)
- Safety scenarios (all 14 validation cases)
- Contraindication checking (45+ drug interaction rules)
- Emergency detection (zero false negatives allowed)

84% core coverage. Zero critical bugs. All emergency scenarios validated. Not production-ready — this is a hackathon prototype — but rigorously tested within that scope.

**What Multi-Agent Systems Teach**

Building MediChain changed how I think about AI architecture.

**Specialization beats generalization.** Five focused agents outperform one general-purpose agent. Domain expertise matters, even for AI.

**Transparency requires structure.** You cant explain a neural network's reasoning, but you can explain symbolic logic chains. Architecture constrains what's possible.

**Safety is a feature, not an afterthought.** Building safety validation from day one shapes the entire system design. Retrofitting safety doesnt work.

**Agents are the future.** The ASI vision — Artificial Superintelligence through agent collaboration — makes more sense after building this. Complex problems decompose into agent-solvable subproblems.

**The Ethical Boundary**

MediChain is not medical advice. The README states it clearly: "hackathon demonstration project—not approved for actual medical use."

This matters. Healthcare AI has real consequences. People trust technology. Irresponsible deployment kills people.

What MediChain demonstrates is possibility. If hackathon code with 25 conditions can produce transparent, evidence-based assessments, imagine what properly funded, clinically validated systems could do.

The gap between demo and deployment is massive — FDA approval, clinical trials, liability frameworks, physician integration. But the technical foundation works. Multi-agent diagnostic reasoning is viable.

**The Bigger Picture**

ASI — Artificial Superintelligence — sounds like science fiction. But the path isnt a single godlike AI. Its ecosystems of specialized agents, each contributing unique capabilities, coordinating toward goals no individual could achieve.

MediChain is one tiny example. Healthcare diagnostics. Five agents. One knowledge graph. But the pattern scales.

Financial analysis agents collaborating with risk assessment agents. Legal research agents working with case strategy agents. Scientific hypothesis agents coordinating with experimental design agents.

The hackathon project points toward that future. Not superintelligence as a single entity, but superintelligence as emergent collaboration.

---

**Tech Stack:** Python, Fetch.ai uAgents, SingularityNET MeTTa, Agentverse, ASI:One

**Status:** Deployed for ASI Agents Track Hackathon

**Links:** [GitHub](https://github.com/RECTOR-LABS/asi-agents-track)

**Coverage:** 5 agents • 25 conditions • 169 tests • 84% coverage