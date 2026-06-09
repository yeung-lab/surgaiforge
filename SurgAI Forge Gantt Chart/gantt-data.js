// SurgAI Forge — Gantt task model (auto-generated from surgai_forge_gantt_chart_v1.xlsx, fully editable)
// Edit tasks freely: dates are ISO (YYYY-MM-DD), deps are arrays of task IDs.
window.GANTT_META = {
  projectStart: "2026-06-08",
  targetLaunch: "2026-08-15",
  today: "2026-06-08",
  rangeStart: "2026-06-08",
  rangeEnd:   "2026-08-15",
  markers: [
    { date: "2026-07-20", label: "Alan Vacation / Handoff Point", kind: "handoff" },
    { date: "2026-08-15", label: "Public Launch", kind: "launch" }
  ]
};

window.GANTT_SECTIONS = [
  {
    "id": "governance",
    "title": "Governance",
    "hueIndex": 0
  },
  {
    "id": "messaging",
    "title": "Messaging & Branding",
    "hueIndex": 1
  },
  {
    "id": "website",
    "title": "Website",
    "hueIndex": 2
  },
  {
    "id": "repos",
    "title": "GitHub & Hugging Face",
    "hueIndex": 3
  },
  {
    "id": "models",
    "title": "Models",
    "hueIndex": 4
  },
  {
    "id": "annotations",
    "title": "Annotations",
    "hueIndex": 5
  },
  {
    "id": "documentation",
    "title": "Documentation",
    "hueIndex": 6
  },
  {
    "id": "video",
    "title": "Video Repository",
    "hueIndex": 7
  },
  {
    "id": "leaderboard",
    "title": "Benchmark & Leaderboard",
    "hueIndex": 8
  },
  {
    "id": "webapp",
    "title": "Web App",
    "hueIndex": 9
  },
  {
    "id": "inference",
    "title": "No-Code Inference/Training Platform",
    "hueIndex": 10
  },
  {
    "id": "publications",
    "title": "Publications",
    "hueIndex": 11
  },
  {
    "id": "launch",
    "title": "Launch & QA",
    "hueIndex": 12
  }
];

window.GANTT_TASKS = [
  {
    "id": "G1",
    "workstream": "Governance",
    "section": "governance",
    "name": "UTSW model release follow-up",
    "owner": "Alan / Chloe",
    "hrs": 2,
    "start": "2026-06-08",
    "end": "2026-07-11",
    "durDays": 34,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "G2",
    "workstream": "Governance",
    "section": "governance",
    "name": "Code license decision",
    "owner": "Alan / Serena",
    "hrs": 2,
    "start": "2026-06-08",
    "end": "2026-06-12",
    "durDays": 5,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "G3",
    "workstream": "Governance",
    "section": "governance",
    "name": "Dataset license decision",
    "owner": "Alan / Serena",
    "hrs": 2,
    "start": "2026-06-08",
    "end": "2026-06-12",
    "durDays": 5,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "G4",
    "workstream": "Governance",
    "section": "governance",
    "name": "Define board structure",
    "owner": "Serena / Jeff",
    "hrs": 3,
    "start": "2026-06-10",
    "end": "2026-06-28",
    "durDays": 19,
    "deps": [],
    "depRaw": "",
    "critical": false,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "G5",
    "workstream": "Governance",
    "section": "governance",
    "name": "Identify board candidates",
    "owner": "Serena / Jeff / Chloe",
    "hrs": 2,
    "start": "2026-06-10",
    "end": "2026-07-05",
    "durDays": 26,
    "deps": [
      "G4"
    ],
    "depRaw": "G4",
    "critical": false,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "G6",
    "workstream": "Governance",
    "section": "governance",
    "name": "Secure board commitments",
    "owner": "Serena / Jeff",
    "hrs": 5,
    "start": "2026-06-24",
    "end": "2026-08-01",
    "durDays": 39,
    "deps": [
      "G5"
    ],
    "depRaw": "G5",
    "critical": false,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "G7",
    "workstream": "Governance",
    "section": "governance",
    "name": "Draft board charter",
    "owner": "Alan",
    "hrs": 3,
    "start": "2026-06-24",
    "end": "2026-07-05",
    "durDays": 12,
    "deps": [
      "G4"
    ],
    "depRaw": "G4",
    "critical": false,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "M1",
    "workstream": "Messaging",
    "section": "messaging",
    "name": "Surgical messaging draft",
    "owner": "Chloe / Dean",
    "hrs": 3,
    "start": "2026-06-08",
    "end": "2026-06-20",
    "durDays": 13,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "M2",
    "workstream": "Messaging",
    "section": "messaging",
    "name": "CS / AI messaging draft",
    "owner": "Elaine",
    "hrs": 3,
    "start": "2026-06-08",
    "end": "2026-06-20",
    "durDays": 13,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "M3",
    "workstream": "Messaging",
    "section": "messaging",
    "name": "Ecosystem / vision messaging",
    "owner": "Alan",
    "hrs": 4,
    "start": "2026-06-08",
    "end": "2026-06-20",
    "durDays": 13,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "M4",
    "workstream": "Messaging",
    "section": "messaging",
    "name": "Synthesize unified positioning",
    "owner": "Alan",
    "hrs": 4,
    "start": "2026-06-17",
    "end": "2026-06-27",
    "durDays": 11,
    "deps": [
      "M1",
      "M2",
      "M3"
    ],
    "depRaw": "M1, M2, M3",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "M5",
    "workstream": "Messaging",
    "section": "messaging",
    "name": "Serena / Jeff review of positioning",
    "owner": "Serena / Jeff / Alan",
    "hrs": 3,
    "start": "2026-06-24",
    "end": "2026-06-30",
    "durDays": 7,
    "deps": [
      "M4"
    ],
    "depRaw": "M4",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "B1",
    "workstream": "Branding",
    "section": "messaging",
    "name": "Style guide refinement",
    "owner": "Alan",
    "hrs": 3,
    "start": "2026-06-17",
    "end": "2026-07-03",
    "durDays": 17,
    "deps": [
      "M4"
    ],
    "depRaw": "M4",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "W1",
    "workstream": "Website",
    "section": "website",
    "name": "Define sitemap/pages",
    "owner": "Alan",
    "hrs": 3,
    "start": "2026-06-17",
    "end": "2026-06-24",
    "durDays": 8,
    "deps": [
      "M4"
    ],
    "depRaw": "M4",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "W2",
    "workstream": "Website",
    "section": "website",
    "name": "Website copy integration",
    "owner": "Alan",
    "hrs": 5,
    "start": "2026-06-24",
    "end": "2026-07-08",
    "durDays": 15,
    "deps": [
      "M5",
      "B1",
      "W1"
    ],
    "depRaw": "M5, B1, W1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "W3",
    "workstream": "Website",
    "section": "website",
    "name": "Build HTML site",
    "owner": "Alan",
    "hrs": 5,
    "start": "2026-07-01",
    "end": "2026-07-11",
    "durDays": 11,
    "deps": [
      "W2",
      "B1"
    ],
    "depRaw": "W2, B1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "W4",
    "workstream": "Website",
    "section": "website",
    "name": "Website QA",
    "owner": "Alan / Taryn",
    "hrs": 2,
    "start": "2026-07-08",
    "end": "2026-07-15",
    "durDays": 8,
    "deps": [
      "W3"
    ],
    "depRaw": "W3",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "W5",
    "workstream": "Website",
    "section": "website",
    "name": "Deploy website",
    "owner": "Alan",
    "hrs": 1,
    "start": "2026-07-15",
    "end": "2026-07-18",
    "durDays": 4,
    "deps": [
      "W4"
    ],
    "depRaw": "W4",
    "critical": true,
    "milestone": true,
    "notes": ""
  },
  {
    "id": "C1",
    "workstream": "Comms",
    "section": "messaging",
    "name": "One-pager refresh",
    "owner": "Alan",
    "hrs": 3,
    "start": "2026-07-01",
    "end": "2026-07-08",
    "durDays": 8,
    "deps": [
      "M5",
      "B1"
    ],
    "depRaw": "M5, B1",
    "critical": false,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "C2",
    "workstream": "Comms",
    "section": "messaging",
    "name": "Pitch deck style refresh",
    "owner": "Alan",
    "hrs": 4,
    "start": "2026-07-01",
    "end": "2026-07-11",
    "durDays": 11,
    "deps": [
      "M5",
      "B1"
    ],
    "depRaw": "M5, B1",
    "critical": false,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "S1",
    "workstream": "Social",
    "section": "messaging",
    "name": "Create LinkedIn page",
    "owner": "Taryn / Aviona",
    "hrs": 2,
    "start": "2026-06-17",
    "end": "2026-06-24",
    "durDays": 8,
    "deps": [
      "M4"
    ],
    "depRaw": "M4",
    "critical": false,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "S2",
    "workstream": "Social",
    "section": "messaging",
    "name": "Populate LinkedIn page",
    "owner": "Taryn / Aviona",
    "hrs": 3,
    "start": "2026-06-24",
    "end": "2026-07-05",
    "durDays": 12,
    "deps": [
      "S1",
      "B1"
    ],
    "depRaw": "S1, B1",
    "critical": false,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "GH1",
    "workstream": "GitHub",
    "section": "repos",
    "name": "Create GitHub org",
    "owner": "Elaine",
    "hrs": 1,
    "start": "2026-06-10",
    "end": "2026-06-12",
    "durDays": 3,
    "deps": [
      "G2"
    ],
    "depRaw": "G2",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "GH2",
    "workstream": "GitHub",
    "section": "repos",
    "name": "Define repo architecture",
    "owner": "Elaine",
    "hrs": 1,
    "start": "2026-06-13",
    "end": "2026-06-16",
    "durDays": 4,
    "deps": [
      "GH1"
    ],
    "depRaw": "GH1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "GH3",
    "workstream": "GitHub",
    "section": "repos",
    "name": "Set permissions / protections",
    "owner": "Elaine",
    "hrs": 1,
    "start": "2026-06-17",
    "end": "2026-06-20",
    "durDays": 4,
    "deps": [
      "GH2"
    ],
    "depRaw": "GH2",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "GH4",
    "workstream": "GitHub",
    "section": "repos",
    "name": "Create README / template structure",
    "owner": "Elaine",
    "hrs": 1.5,
    "start": "2026-06-17",
    "end": "2026-06-22",
    "durDays": 6,
    "deps": [
      "GH2"
    ],
    "depRaw": "GH2",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "HF1",
    "workstream": "Hugging Face",
    "section": "repos",
    "name": "Create HF organization",
    "owner": "Taryn",
    "hrs": 2,
    "start": "2026-06-10",
    "end": "2026-06-14",
    "durDays": 5,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "HF2",
    "workstream": "Hugging Face",
    "section": "repos",
    "name": "Configure HF org structure",
    "owner": "Taryn",
    "hrs": 3,
    "start": "2026-06-14",
    "end": "2026-06-21",
    "durDays": 8,
    "deps": [
      "HF1"
    ],
    "depRaw": "HF1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "HF3",
    "workstream": "Hugging Face",
    "section": "repos",
    "name": "Upload shell pages / placeholders",
    "owner": "Taryn",
    "hrs": 4,
    "start": "2026-06-21",
    "end": "2026-07-05",
    "durDays": 15,
    "deps": [
      "HF2",
      "M4"
    ],
    "depRaw": "HF2, M4",
    "critical": false,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD1",
    "workstream": "Models",
    "section": "models",
    "name": "STEPS checkpoint identified",
    "owner": "Elaine",
    "hrs": 1,
    "start": "2026-06-17",
    "end": "2026-06-21",
    "durDays": 5,
    "deps": [
      "GH2",
      "G1"
    ],
    "depRaw": "GH2, G1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD2",
    "workstream": "Models",
    "section": "models",
    "name": "STEPS code cleanup/package",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-06-21",
    "end": "2026-07-03",
    "durDays": 13,
    "deps": [
      "MD1"
    ],
    "depRaw": "MD1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD3",
    "workstream": "Models",
    "section": "models",
    "name": "STEPS validation run",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-07-01",
    "end": "2026-07-08",
    "durDays": 8,
    "deps": [
      "MD2"
    ],
    "depRaw": "MD2",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD4",
    "workstream": "Models",
    "section": "models",
    "name": "ERRORS checkpoint identified",
    "owner": "Elaine",
    "hrs": 1,
    "start": "2026-06-17",
    "end": "2026-06-21",
    "durDays": 5,
    "deps": [
      "GH2",
      "G1"
    ],
    "depRaw": "GH2, G1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD5",
    "workstream": "Models",
    "section": "models",
    "name": "ERRORS code cleanup/package",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-06-21",
    "end": "2026-07-03",
    "durDays": 13,
    "deps": [
      "MD4"
    ],
    "depRaw": "MD4",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD6",
    "workstream": "Models",
    "section": "models",
    "name": "ERRORS validation run",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-07-01",
    "end": "2026-07-08",
    "durDays": 8,
    "deps": [
      "MD5"
    ],
    "depRaw": "MD5",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD7",
    "workstream": "Models",
    "section": "models",
    "name": "Parkland checkpoint identified",
    "owner": "Elaine",
    "hrs": 1,
    "start": "2026-06-17",
    "end": "2026-06-21",
    "durDays": 5,
    "deps": [
      "GH2",
      "G1"
    ],
    "depRaw": "GH2, G1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD8",
    "workstream": "Models",
    "section": "models",
    "name": "Parkland code cleanup/package",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-06-21",
    "end": "2026-07-03",
    "durDays": 13,
    "deps": [
      "MD7"
    ],
    "depRaw": "MD7",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD9",
    "workstream": "Models",
    "section": "models",
    "name": "Parkland validation run",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-07-01",
    "end": "2026-07-08",
    "durDays": 8,
    "deps": [
      "MD8"
    ],
    "depRaw": "MD8",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD10",
    "workstream": "Models",
    "section": "models",
    "name": "CVS checkpoint identified",
    "owner": "Elaine",
    "hrs": 1,
    "start": "2026-06-24",
    "end": "2026-06-28",
    "durDays": 5,
    "deps": [
      "GH2",
      "G1"
    ],
    "depRaw": "GH2, G1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD11",
    "workstream": "Models",
    "section": "models",
    "name": "CVS code cleanup/package",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-06-28",
    "end": "2026-07-08",
    "durDays": 11,
    "deps": [
      "MD10"
    ],
    "depRaw": "MD10",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD12",
    "workstream": "Models",
    "section": "models",
    "name": "CVS validation run",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-07-08",
    "end": "2026-07-15",
    "durDays": 8,
    "deps": [
      "MD11"
    ],
    "depRaw": "MD11",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD13",
    "workstream": "Models",
    "section": "models",
    "name": "MC2 checkpoint identified",
    "owner": "Elaine",
    "hrs": 1,
    "start": "2026-06-24",
    "end": "2026-06-28",
    "durDays": 5,
    "deps": [
      "GH2",
      "G1"
    ],
    "depRaw": "GH2, G1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD14",
    "workstream": "Models",
    "section": "models",
    "name": "MC2 code cleanup/package",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-06-28",
    "end": "2026-07-08",
    "durDays": 11,
    "deps": [
      "MD13"
    ],
    "depRaw": "MD13",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "MD15",
    "workstream": "Models",
    "section": "models",
    "name": "MC2 validation run",
    "owner": "Elaine",
    "hrs": 1,
    "start": "2026-07-08",
    "end": "2026-07-15",
    "durDays": 8,
    "deps": [
      "MD14"
    ],
    "depRaw": "MD14",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "A1",
    "workstream": "Annotations",
    "section": "annotations",
    "name": "Inventory annotation files",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-06-17",
    "end": "2026-06-24",
    "durDays": 8,
    "deps": [
      "GH2"
    ],
    "depRaw": "GH2",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "A2",
    "workstream": "Annotations",
    "section": "annotations",
    "name": "Validate annotation formats",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-06-25",
    "end": "2026-07-05",
    "durDays": 11,
    "deps": [
      "A1"
    ],
    "depRaw": "A1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "A3",
    "workstream": "Annotations",
    "section": "annotations",
    "name": "Cleanup/package annotations",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-07-05",
    "end": "2026-07-15",
    "durDays": 11,
    "deps": [
      "A2"
    ],
    "depRaw": "A2",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "A4",
    "workstream": "Annotations",
    "section": "annotations",
    "name": "Upload annotations",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-07-15",
    "end": "2026-07-20",
    "durDays": 6,
    "deps": [
      "A3",
      "GH3",
      "HF2"
    ],
    "depRaw": "A3, GH3, HF2",
    "critical": true,
    "milestone": true,
    "notes": ""
  },
  {
    "id": "D1",
    "workstream": "Docs",
    "section": "documentation",
    "name": "Draft GitHub README",
    "owner": "Elaine",
    "hrs": 1,
    "start": "2026-07-01",
    "end": "2026-07-11",
    "durDays": 11,
    "deps": [
      "GH4",
      "M5"
    ],
    "depRaw": "GH4, M5",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "D2",
    "workstream": "Docs",
    "section": "documentation",
    "name": "Draft model cards",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-07-08",
    "end": "2026-07-25",
    "durDays": 18,
    "deps": [
      "MD3",
      "MD6",
      "MD9",
      "MD12",
      "MD15"
    ],
    "depRaw": "MD3, MD6, MD9, MD12, MD15",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "D3",
    "workstream": "Docs",
    "section": "documentation",
    "name": "Draft dataset cards",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-07-15",
    "end": "2026-07-25",
    "durDays": 11,
    "deps": [
      "A3"
    ],
    "depRaw": "A3",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "D4",
    "workstream": "Docs",
    "section": "documentation",
    "name": "Access instructions",
    "owner": "Alan / Aviona",
    "hrs": 4,
    "start": "2026-07-08",
    "end": "2026-07-18",
    "durDays": 11,
    "deps": [
      "V5"
    ],
    "depRaw": "V5",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "D5",
    "workstream": "Docs",
    "section": "documentation",
    "name": "Final documentation QA",
    "owner": "Taryn / Alan",
    "hrs": 5,
    "start": "2026-07-25",
    "end": "2026-08-05",
    "durDays": 12,
    "deps": [
      "D1",
      "D2",
      "D3",
      "D4"
    ],
    "depRaw": "D1, D2, D3, D4",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "V1",
    "workstream": "Videos",
    "section": "video",
    "name": "Inventory videos",
    "owner": "Alan / Aviona",
    "hrs": 2,
    "start": "2026-06-17",
    "end": "2026-06-28",
    "durDays": 12,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "V2",
    "workstream": "Videos",
    "section": "video",
    "name": "Decide hosting platform",
    "owner": "Alan / Aviona",
    "hrs": 2,
    "start": "2026-06-13",
    "end": "2026-06-27",
    "durDays": 15,
    "deps": [
      "G3"
    ],
    "depRaw": "G3",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "V3",
    "workstream": "Videos",
    "section": "video",
    "name": "Define folder structure",
    "owner": "Alan / Aviona",
    "hrs": 1,
    "start": "2026-06-28",
    "end": "2026-07-05",
    "durDays": 8,
    "deps": [
      "V1",
      "V2"
    ],
    "depRaw": "V1, V2",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "V4",
    "workstream": "Videos",
    "section": "video",
    "name": "Upload videos",
    "owner": "Alan / Aviona",
    "hrs": 4,
    "start": "2026-07-05",
    "end": "2026-07-18",
    "durDays": 14,
    "deps": [
      "V3"
    ],
    "depRaw": "V3",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "V5",
    "workstream": "Videos",
    "section": "video",
    "name": "Define access workflow",
    "owner": "Alan / Aviona",
    "hrs": 2,
    "start": "2026-06-28",
    "end": "2026-07-08",
    "durDays": 11,
    "deps": [
      "V2"
    ],
    "depRaw": "V2",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "V6",
    "workstream": "Videos",
    "section": "video",
    "name": "Pressure test video access",
    "owner": "Alan / Aviona",
    "hrs": 4,
    "start": "2026-07-18",
    "end": "2026-07-31",
    "durDays": 14,
    "deps": [
      "V4",
      "V5"
    ],
    "depRaw": "V4, V5",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "L1",
    "workstream": "Leaderboard",
    "section": "leaderboard",
    "name": "Define benchmark datasets",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-07-01",
    "end": "2026-07-11",
    "durDays": 11,
    "deps": [
      "MD3",
      "MD6",
      "MD9",
      "MD12",
      "MD15"
    ],
    "depRaw": "MD3, MD6, MD9, MD12, MD15",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "L2",
    "workstream": "Leaderboard",
    "section": "leaderboard",
    "name": "Define evaluation metrics",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-07-01",
    "end": "2026-07-11",
    "durDays": 11,
    "deps": [
      "L1"
    ],
    "depRaw": "L1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "L3",
    "workstream": "Leaderboard",
    "section": "leaderboard",
    "name": "Generate baseline results",
    "owner": "Elaine",
    "hrs": 1,
    "start": "2026-07-11",
    "end": "2026-07-25",
    "durDays": 15,
    "deps": [
      "L2",
      "MD3",
      "MD6",
      "MD9",
      "MD12",
      "MD15"
    ],
    "depRaw": "L2, MD3, MD6, MD9, MD12, MD15",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "L4",
    "workstream": "Leaderboard",
    "section": "leaderboard",
    "name": "Build HF leaderboard",
    "owner": "Elaine",
    "hrs": 2,
    "start": "2026-07-18",
    "end": "2026-08-01",
    "durDays": 15,
    "deps": [
      "L3",
      "HF2"
    ],
    "depRaw": "L3, HF2",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "L5",
    "workstream": "Leaderboard",
    "section": "leaderboard",
    "name": "Test submission workflow",
    "owner": "Elaine / Taryn",
    "hrs": 2,
    "start": "2026-08-01",
    "end": "2026-08-08",
    "durDays": 8,
    "deps": [
      "L4"
    ],
    "depRaw": "L4",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "APP1",
    "workstream": "Web App",
    "section": "webapp",
    "name": "UI/UX review of current app",
    "owner": "Yunchai / Alan",
    "hrs": 8,
    "start": "2026-06-10",
    "end": "2026-06-21",
    "durDays": 12,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "APP2",
    "workstream": "Web App",
    "section": "webapp",
    "name": "UI/UX redesign",
    "owner": "Yunchai",
    "hrs": 12,
    "start": "2026-06-17",
    "end": "2026-07-08",
    "durDays": 22,
    "deps": [
      "APP1",
      "M4"
    ],
    "depRaw": "APP1, M4",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "APP3",
    "workstream": "Web App",
    "section": "webapp",
    "name": "Modular architecture design",
    "owner": "Yeonjae",
    "hrs": 20,
    "start": "2026-06-17",
    "end": "2026-07-05",
    "durDays": 19,
    "deps": [
      "APP1"
    ],
    "depRaw": "APP1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "APP4",
    "workstream": "Web App",
    "section": "webapp",
    "name": "Refactor architecture",
    "owner": "Yeonjae",
    "hrs": 15,
    "start": "2026-07-01",
    "end": "2026-07-25",
    "durDays": 25,
    "deps": [
      "APP3"
    ],
    "depRaw": "APP3",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "APP5",
    "workstream": "Web App",
    "section": "webapp",
    "name": "Model integration layer",
    "owner": "Yeonjae",
    "hrs": 15,
    "start": "2026-07-11",
    "end": "2026-08-01",
    "durDays": 22,
    "deps": [
      "APP4",
      "MD3",
      "MD6",
      "MD9",
      "MD12",
      "MD15"
    ],
    "depRaw": "APP4, MD3, MD6, MD9, MD12, MD15",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "APP6",
    "workstream": "Web App",
    "section": "webapp",
    "name": "Web app internal testing",
    "owner": "Yunchai / Brian",
    "hrs": 4,
    "start": "2026-08-01",
    "end": "2026-08-08",
    "durDays": 8,
    "deps": [
      "APP5"
    ],
    "depRaw": "APP5",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "APP7",
    "workstream": "Web App",
    "section": "webapp",
    "name": "Web app documentation",
    "owner": "Yunchai",
    "hrs": 3,
    "start": "2026-08-01",
    "end": "2026-08-08",
    "durDays": 8,
    "deps": [
      "APP5"
    ],
    "depRaw": "APP5",
    "critical": false,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "INF1",
    "workstream": "Inference",
    "section": "inference",
    "name": "Upload workflow",
    "owner": "Alan / Yunchai",
    "hrs": 5,
    "start": "2026-06-08",
    "end": "2026-06-25",
    "durDays": 18,
    "deps": [
      "APP2"
    ],
    "depRaw": "APP2",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "INF2",
    "workstream": "Inference",
    "section": "inference",
    "name": "Inference workflow",
    "owner": "Alan / Yeonjae",
    "hrs": 6,
    "start": "2026-06-15",
    "end": "2026-07-02",
    "durDays": 18,
    "deps": [
      "APP4"
    ],
    "depRaw": "APP4",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "INF3",
    "workstream": "Inference",
    "section": "inference",
    "name": "Results visualization",
    "owner": "Yeonjae",
    "hrs": 3,
    "start": "2026-06-25",
    "end": "2026-07-09",
    "durDays": 15,
    "deps": [
      "INF2"
    ],
    "depRaw": "INF2",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "INF4",
    "workstream": "Inference",
    "section": "inference",
    "name": "Inference testing",
    "owner": "Brian",
    "hrs": 4,
    "start": "2026-07-09",
    "end": "2026-07-16",
    "durDays": 8,
    "deps": [
      "INF1",
      "INF2",
      "INF3"
    ],
    "depRaw": "INF1, INF2, INF3",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "INF5",
    "workstream": "Inference",
    "section": "inference",
    "name": "Inference documentation",
    "owner": "Alan / Yunchai",
    "hrs": 3,
    "start": "2026-07-09",
    "end": "2026-07-16",
    "durDays": 8,
    "deps": [
      "INF1",
      "INF2",
      "INF3"
    ],
    "depRaw": "INF1, INF2, INF3",
    "critical": false,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "P1",
    "workstream": "Pubs",
    "section": "publications",
    "name": "MC2 Delphi manuscript completion",
    "owner": "Aviona / Jeff",
    "hrs": 8,
    "start": "2026-06-17",
    "end": "2026-07-05",
    "durDays": 19,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "P2",
    "workstream": "Pubs",
    "section": "publications",
    "name": "MC2 Delphi author review",
    "owner": "Aviona / Jeff",
    "hrs": 5,
    "start": "2026-07-05",
    "end": "2026-07-25",
    "durDays": 21,
    "deps": [
      "P1"
    ],
    "depRaw": "P1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "P3",
    "workstream": "Pubs",
    "section": "publications",
    "name": "MC2 Delphi arXiv/submission",
    "owner": "Aviona / Jeff",
    "hrs": 3,
    "start": "2026-07-25",
    "end": "2026-08-08",
    "durDays": 15,
    "deps": [
      "P2"
    ],
    "depRaw": "P2",
    "critical": true,
    "milestone": true,
    "notes": ""
  },
  {
    "id": "P4",
    "workstream": "Pubs",
    "section": "publications",
    "name": "MC2 manuscript completion",
    "owner": "Josiah / Alfred",
    "hrs": 12,
    "start": "2026-06-17",
    "end": "2026-07-08",
    "durDays": 22,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "P5",
    "workstream": "Pubs",
    "section": "publications",
    "name": "MC2 author review",
    "owner": "Josiah / Alfred",
    "hrs": 6,
    "start": "2026-07-08",
    "end": "2026-07-31",
    "durDays": 24,
    "deps": [
      "P4"
    ],
    "depRaw": "P4",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "P6",
    "workstream": "Pubs",
    "section": "publications",
    "name": "MC2 arXiv/submission",
    "owner": "Josiah / Alfred",
    "hrs": 3,
    "start": "2026-08-01",
    "end": "2026-08-15",
    "durDays": 15,
    "deps": [
      "P5"
    ],
    "depRaw": "P5",
    "critical": true,
    "milestone": true,
    "notes": ""
  },
  {
    "id": "P7",
    "workstream": "Pubs",
    "section": "publications",
    "name": "Tool tracking manuscript completion",
    "owner": "Alfred / Jeff",
    "hrs": 12,
    "start": "2026-06-17",
    "end": "2026-07-08",
    "durDays": 22,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "P8",
    "workstream": "Pubs",
    "section": "publications",
    "name": "Tool tracking author review",
    "owner": "Alfred / Jeff",
    "hrs": 6,
    "start": "2026-07-08",
    "end": "2026-07-31",
    "durDays": 24,
    "deps": [
      "P7"
    ],
    "depRaw": "P7",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "P9",
    "workstream": "Pubs",
    "section": "publications",
    "name": "Tool tracking arXiv/submission",
    "owner": "Alfred / Jeff",
    "hrs": 3,
    "start": "2026-08-01",
    "end": "2026-08-15",
    "durDays": 15,
    "deps": [
      "P8"
    ],
    "depRaw": "P8",
    "critical": true,
    "milestone": true,
    "notes": ""
  },
  {
    "id": "P10",
    "workstream": "Pubs",
    "section": "publications",
    "name": "Needs finding manuscript completion",
    "owner": "Chloe",
    "hrs": 10,
    "start": "2026-06-17",
    "end": "2026-07-08",
    "durDays": 22,
    "deps": [],
    "depRaw": "",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "P11",
    "workstream": "Pubs",
    "section": "publications",
    "name": "Needs finding author review",
    "owner": "Chloe",
    "hrs": 5,
    "start": "2026-07-08",
    "end": "2026-07-31",
    "durDays": 24,
    "deps": [
      "P10"
    ],
    "depRaw": "P10",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "P12",
    "workstream": "Pubs",
    "section": "publications",
    "name": "Needs finding arXiv/submission",
    "owner": "Chloe",
    "hrs": 3,
    "start": "2026-08-01",
    "end": "2026-08-15",
    "durDays": 15,
    "deps": [
      "P11"
    ],
    "depRaw": "P11",
    "critical": true,
    "milestone": true,
    "notes": ""
  },
  {
    "id": "QA1",
    "workstream": "Release QA",
    "section": "launch",
    "name": "End-to-end user journey test",
    "owner": "Alan / Taryn / Aviona",
    "hrs": 4,
    "start": "2026-08-05",
    "end": "2026-08-10",
    "durDays": 6,
    "deps": [
      "W5",
      "D5",
      "V6",
      "L5",
      "APP6",
      "INF4"
    ],
    "depRaw": "W5, D5, V6, L5, APP6, INF4",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "QA2",
    "workstream": "Release QA",
    "section": "launch",
    "name": "Fix final blockers",
    "owner": "Alan / Elaine / Yeonjae",
    "hrs": 4,
    "start": "2026-08-08",
    "end": "2026-08-13",
    "durDays": 6,
    "deps": [
      "QA1"
    ],
    "depRaw": "QA1",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "LA1",
    "workstream": "Launch",
    "section": "launch",
    "name": "Launch readiness review",
    "owner": "Alan / Serena / Jeff",
    "hrs": 3,
    "start": "2026-08-13",
    "end": "2026-08-14",
    "durDays": 2,
    "deps": [
      "QA2",
      "P3",
      "P6",
      "P9",
      "P12"
    ],
    "depRaw": "QA2, P3, P6, P9, P12",
    "critical": true,
    "milestone": false,
    "notes": ""
  },
  {
    "id": "LA2",
    "workstream": "Launch",
    "section": "launch",
    "name": "Public launch",
    "owner": "Alan / Team",
    "hrs": 2,
    "start": "2026-08-15",
    "end": "2026-08-15",
    "durDays": 1,
    "deps": [
      "LA1"
    ],
    "depRaw": "LA1",
    "critical": true,
    "milestone": true,
    "notes": ""
  }
];

window.GANTT_RISKS = [
  {
    "type": "Fast-track accepted",
    "task": "ALL",
    "severity": "low",
    "msg": "43 dependency overlaps are intentional fast-tracks in the Aug 15 plan. High (>7d): 0, Medium (≤7d): 43. Strict sequencing would push launch to ~Oct 1. Review if key dependencies slip."
  },
  {
    "type": "Source data note",
    "task": "LA2",
    "severity": "low",
    "msg": "LA2 \"Public launch\" stored its schedule as an Excel date serial (46249); parsed as a single-day milestone on 2026-08-15."
  }
];
