{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # SurgAI Forge Website \'97 Claude Code Instructions\
\
## Repository Purpose\
\
This repository contains the actual HTML prototype for the SurgAI Forge public website.\
\
It includes:\
- approved HTML pages\
- website assets\
- styling\
- imagery\
- navigation\
- responsive behavior\
- content prototypes\
\
The immediate development goal is to integrate a real, browser-based Surgical AI Model Output Demo into the existing website.\
\
This is not a separate visual experiment.\
\
The new model demo must feel like a native part of the existing SurgAI Forge website.\
\
---\
\
# First Rule: Inspect Before Editing\
\
Before making changes:\
\
1. Inspect the repository structure.\
2. Identify the existing HTML pages.\
3. Identify shared CSS, JavaScript, assets, navigation, footer, typography, spacing, and responsive patterns.\
4. Determine how pages currently link to one another.\
5. Identify whether styling is shared or duplicated between HTML files.\
\
Do not immediately rewrite or reorganize the website.\
\
Preserve the existing approved design unless a requirement explicitly calls for a change.\
\
---\
\
# Design Authority\
\
The existing SurgAI Forge website HTML and assets in this repository are the PRIMARY design reference.\
\
Reuse the existing:\
\
- navigation\
- typography\
- color system\
- card patterns\
- buttons\
- spacing\
- max-width behavior\
- page backgrounds\
- hover states\
- section hierarchy\
- responsive behavior\
- footer\
\
Do NOT independently redesign the website.\
\
Do NOT introduce:\
\
- generic SaaS design\
- Tailwind-style generic components\
- neon colors\
- glowing AI graphics\
- futuristic medical HUDs\
- excessive gradients\
- excessive animation\
- new fonts unless required by the existing site\
- a framework simply for convenience\
\
The new demo should look like it was always part of the website.\
\
---\
\
# Product Objective\
\
SurgAI Forge should help surgeons and computer scientists discover, use, and contribute to surgical AI resources.\
\
Core audience principle:\
\
SURGEONS USE AND ADAPT.\
\
COMPUTER SCIENTISTS EXTEND AND ADVANCE.\
\
The model demo is primarily intended to help users understand what SurgAI Forge model outputs actually look like on surgical video.\
\
---\
\
# Model Demo\
\
The demo visualizes PRECOMPUTED model outputs.\
\
It does NOT run inference.\
\
It does NOT:\
\
- upload user videos\
- send videos to an API\
- use GPUs\
- run AI models\
- require accounts\
- require a backend\
- perform live clinical analysis\
\
Display a subtle note:\
\
"Precomputed model output. No inference is performed in your browser."\
\
---\
\
# Sensitive Media Rule\
\
A directory named:\
\
`private-demo/`\
\
may contain real de-identified surgical videos and real model outputs.\
\
Claude MUST NOT inspect, open, parse, transcode, summarize, extract frames from, or otherwise examine video files inside `private-demo/`.\
\
Do not use those files during initial development.\
\
Build using synthetic fixtures and placeholder video.\
\
Code may reference relative paths inside `private-demo/`, but Claude should not inspect private surgical media.\
\
Do not commit `private-demo/` to Git.\
\
---\
\
# Website Integration\
\
The model demo should be connected into the existing SurgAI Forge website.\
\
Before adding new navigation or pages, inspect how the current website works.\
\
The demo should be accessible from appropriate existing calls to action such as:\
\
- "See Models in Action"\
- model/resource links\
- surgeon-facing pages\
\
Do not break existing page links.\
\
Do not restructure unrelated sections.\
\
---\
\
# Demo Architecture\
\
The final demo supports at least two surgical cases.\
\
Top-level state:\
\
1. Selected case\
2. Video timestamp\
3. Selected analysis\
\
Analysis modes:\
\
- Steps\
- Errors\
- Tool Tracking\
- Disease Severity\
- Critical View of Safety\
- Meta-Competencies\
\
Switching analysis modes should preserve the current video timestamp.\
\
Changing case may reset the video.\
\
The architecture should allow additional cases later without redesigning the page.\
\
---\
\
# Output Types\
\
Not all model outputs should use identical UI.\
\
## Primary Video Analyses\
\
### Steps\
\
Show:\
\
- current procedural step\
- step name\
- segmented procedural timeline\
- active segment synchronized with video.currentTime\
\
Steps may repeat or return to earlier phases.\
\
Do not assume a strictly linear procedure.\
\
Supported labels include:\
\
- Step 2 \'97 Expose Gallbladder\
- Step 3 \'97 Dissecting the Gallbladder including the hepatocystic triangle\
- Step 4 \'97 Ligation & Division\
- Step 5 \'97 Gallbladder Dissection\
- Step 6 \'97 Packaging and removal of the gallbladder including cleaning and hemostasis\
\
---\
\
### Errors\
\
Errors/events are timestamped temporal ranges.\
\
Examples may include:\
\
- Lack of progress\
- Injury to nontarget tissue\
- Instrument tip out of view\
- Gallbladder / cystic duct perforation\
- Bleeding\
- Dropped retraction\
- Clip-related errors\
- Bile leakage\
- Incorrect dissection plane\
\
Render only events present in the supplied data.\
\
Display:\
\
- timeline markers\
- detected-event list\
- start/end timestamps\
\
Clicking an event should jump the video to the event start.\
\
---\
\
### Tool Tracking\
\
Tool tracking may eventually be supplied either as:\
\
1. structured timestamped tracking data\
\
OR\
\
2. a pre-rendered video containing tracking overlays\
\
The renderer architecture should be capable of supporting either approach.\
\
Possible structured outputs include:\
\
- instrument label\
- coordinates\
- segmentation\
- instrument-tip location\
- trajectory\
- velocity\
- acceleration\
- trajectory deviation / distance from trajectory center\
\
Never interpret higher or lower kinematic values as universally better or worse.\
\
These metrics are context-dependent.\
\
---\
\
# SOAR-Style Analysis Outputs\
\
## Disease Severity\
\
Uses the Parkland Grading Scale.\
\
Output includes:\
\
- consensus predicted grade\
- probability distribution across Grades 1\'965\
\
Grade labels:\
\
1 \'97 Normal\
2 \'97 Minor Inflammation\
3 \'97 Moderate Inflammation\
4 \'97 Severe Inflammation\
5 \'97 Extreme / Necrotic\
\
UI should show:\
\
- predicted grade\
- probability distribution\
- compact grading reference\
\
Never invent real probabilities.\
\
---\
\
## Critical View of Safety\
\
Output includes:\
\
- detected temporal range\
- status of three criteria\
\
Criteria:\
\
1. Isolation of cystic duct & artery\
2. Clearance of hepatocystic triangle\
3. Exposure of cystic plate\
\
UI should show:\
\
- detected timestamp range\
- Achieved / Not Achieved for each criterion\
\
Clicking the detected range should jump the video to that interval.\
\
---\
\
# Meta-Competencies\
\
Assessment dimensions:\
\
- Tissue Handling\
- Psychomotor Skills\
- Progress\
- Dissection Quality\
- Exposure Quality\
\
Do NOT assume this is currently a VLM.\
\
Do NOT generate fake textual AI feedback.\
\
The exact display should be based only on the real output schema when supplied.\
\
Until then, use synthetic structured fixture data clearly labeled as example data.\
\
---\
\
# Data Architecture\
\
Separate:\
\
SOURCE DATA\
\
from\
\
NORMALIZED INTERNAL DATA\
\
from\
\
UI RENDERING.\
\
Do not make UI code dependent on one research CSV format.\
\
Preferred flow:\
\
research output\
\uc0\u8594  converter / adapter\
\uc0\u8594  normalized JSON\
\uc0\u8594  renderer\
\
This allows research-output formats to change without rewriting the website.\
\
See:\
\
`docs/DATA_CONTRACTS.md`\
\
---\
\
# Code Preferences\
\
Use the existing technology stack.\
\
If the current site is plain:\
\
- HTML\
- CSS\
- vanilla JavaScript\
\
continue using those technologies.\
\
Do NOT add React, Vue, Next.js, or another framework unless there is a clear existing architectural reason.\
\
Prefer:\
\
- simple modules\
- reusable functions\
- readable code\
- comments around integration boundaries\
\
Avoid unnecessary abstraction.\
\
---\
\
# Accessibility\
\
Maintain or improve:\
\
- semantic HTML\
- keyboard access\
- visible focus states\
- button labels\
- accessible tabs/controls\
- responsive mobile layouts\
- readable contrast\
\
---\
\
# Content Accuracy\
\
Never invent:\
\
- medical outputs\
- timestamps\
- model probabilities\
- tool trajectories\
- metrics\
- patient information\
- model accuracy values\
- dataset counts\
- URLs\
- paper links\
- clinical claims\
\
Development fixtures must be clearly labeled as synthetic/example data.\
\
---\
\
# Public Language\
\
Preferred terms:\
\
- model output\
- analysis\
- detected event\
- example case\
- assessment\
- precomputed output\
\
Avoid language implying:\
\
- diagnosis\
- treatment recommendation\
- clinical decision support\
- surgeon safety ranking\
- surgeon quality ranking\
\
---\
\
# Existing Website Protection\
\
Do not:\
\
- delete existing pages\
- rename existing assets without updating all references\
- break navigation\
- rewrite unrelated copy\
- replace existing styling wholesale\
- alter approved pages unless needed for demo integration\
\
If a structural refactor appears beneficial, explain it before performing it.\
\
---\
\
# Development Workflow\
\
For substantial changes:\
\
1. Inspect current implementation.\
2. Summarize intended changes.\
3. Make minimal changes.\
4. Test locally.\
5. Verify existing pages still work.\
6. Report exactly which files changed.\
\
---\
\
# Required Demo Behaviors\
\
Before considering the model demo complete:\
\
- case switching works\
- analysis switching works\
- analysis switching preserves current video time\
- Steps synchronize with video\
- Error events jump to timestamps\
- CVS detected window jumps to timestamp\
- Disease Severity renders correctly\
- Tool Tracking architecture supports later real-data integration\
- Meta-Competencies does not falsely imply VLM capability\
- layout works on mobile and desktop\
- navigation back to the main website works\
- no backend or AI inference is required}