{\rtf1\ansi\ansicpg1252\cocoartf2870
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # Model Demo \'97 Normalized Data Contracts\
\
These structures represent the UI-facing normalized data model.\
\
Real research outputs may use different formats.\
\
Adapters/converters should transform real outputs into these structures.\
\
Values shown below are examples only.\
\
## Case Manifest\
\
```json\
\{\
  "id": "case-01",\
  "label": "Demo Case 01",\
  "procedure": "Laparoscopic cholecystectomy",\
  "video": "path/to/video.mp4",\
  "outputs": \{\
    "steps": "path/to/steps.json",\
    "errors": "path/to/errors.json",\
    "toolTracking": "path/to/tool-tracking.json",\
    "diseaseSeverity": "path/to/disease-severity.json",\
    "cvs": "path/to/cvs.json",\
    "metaCompetencies": "path/to/meta-competencies.json"\
  \}\
\}\
\
\{\
  "segments": [\
    \{\
      "start": 0,\
      "end": 30,\
      "stepId": 2,\
      "label": "Expose Gallbladder"\
    \}\
  ]\
\}\
\
\{\
  "events": [\
    \{\
      "start": 120.2,\
      "end": 124.8,\
      "label": "Bleeding"\
    \}\
  ]\
\}\
\
\{\
  "grade": 3,\
  "label": "Moderate Inflammation",\
  "probabilities": \{\
    "1": 0.05,\
    "2": 0.15,\
    "3": 0.55,\
    "4": 0.20,\
    "5": 0.05\
  \}\
\}\
\
\{\
  "start": 500,\
  "end": 560,\
  "criteria": [\
    \{\
      "id": "c1",\
      "label": "Isolation of cystic duct & artery",\
      "achieved": true\
    \},\
    \{\
      "id": "c2",\
      "label": "Clearance of hepatocystic triangle",\
      "achieved": true\
    \},\
    \{\
      "id": "c3",\
      "label": "Exposure of cystic plate",\
      "achieved": false\
    \}\
  ]\
\}\
\
\{\
  "samples": [\
    \{\
      "time": 12.1,\
      "tools": [\
        \{\
          "id": "tool-1",\
          "label": "Grasper",\
          "x": 0.42,\
          "y": 0.55,\
          "velocity": null,\
          "acceleration": null,\
          "trajectoryDeviation": null\
        \}\
      ]\
    \}\
  ]\
\}\
\
\
\
---\
\
# 5. `README.md`\
\
I\'92d keep this operational.\
\
```markdown\
# SurgAI Forge Website Prototype\
\
## Project Root\
\
/Users/alanb/Documents/SOAR Model Suite Demo Platform/SurgAI Forge Website Prototype\
\
## Purpose\
\
Public SurgAI Forge website prototype including an interactive visualization of precomputed surgical AI model outputs.\
\
## Run Locally\
\
From the project directory:\
\
```bash\
cd "/Users/alanb/Documents/SOAR Model Suite Demo Platform/SurgAI Forge Website Prototype"\
python3 -m http.server 8000}