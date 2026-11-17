{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # SurgAI Forge Model Demo \'97 Product Specification\
\
## Purpose\
\
Show real, precomputed surgical AI outputs synchronized with surgical video.\
\
The demo should help users understand what each model does without requiring them to run the model themselves.\
\
## Case Structure\
\
The demo initially supports two cases.\
\
Each case may include:\
\
- source video\
- Steps output\
- Errors output\
- Tool Tracking output\
- Disease Severity output\
- CVS output\
- Meta-Competencies output\
\
## Shared Video Behavior\
\
A single case video remains loaded while the user switches analysis modes.\
\
Switching analysis mode must not restart the video.\
\
## Analyses\
\
### Steps\
\
User-facing purpose:\
\
Understand where you are in the procedure.\
\
Display:\
\
- current step\
- step description\
- segmented procedure timeline\
\
Segments synchronize with the video.\
\
### Errors\
\
User-facing purpose:\
\
Find important intraoperative events.\
\
Display:\
\
- event markers\
- event names\
- timestamps\
- event navigation\
\
Clicking an event moves the video to that moment.\
\
### Tool Tracking\
\
User-facing purpose:\
\
Understand instrument movement.\
\
Display may include:\
\
- instrument masks/outlines\
- instrument-tip position\
- trajectory\
- velocity\
- acceleration\
- trajectory deviation\
\
Exact implementation depends on the real output format.\
\
### Disease Severity\
\
User-facing purpose:\
\
Understand predicted gallbladder disease severity.\
\
Display:\
\
- Parkland consensus grade\
- probability distribution\
- reference grades\
\
### Critical View of Safety\
\
User-facing purpose:\
\
Identify where CVS was detected and which criteria were met.\
\
Display:\
\
- detected range\
- C1 status\
- C2 status\
- C3 status\
- jump-to-range interaction\
\
### Meta-Competencies\
\
Assessment categories:\
\
- Tissue Handling\
- Psychomotor Skills\
- Progress\
- Dissection Quality\
- Exposure Quality\
\
The renderer must be based on the actual output supplied.\
\
Do not represent this as VLM-generated feedback unless that becomes factually accurate.\
\
## Footer / CTA\
\
After demo:\
\
"Use SurgAI Forge models on your own surgical videos."\
\
Primary action:\
Request Access\
\
Secondary:\
Learn About SOAR}