# PhishGuard – AI Powered Phishing Detection System

## Overview

PhishGuard is an AI-based phishing URL detection system designed to identify whether a website URL is safe or phishing.

The project combines:

* Machine Learning using Logistic Regression
* URL Feature Extraction
* TF-IDF text vectorization
* Flask backend API
* Interactive frontend dashboard
* Chrome browser extension for real-time URL scanning

The system analyzes URLs using both lexical URL features and text-based patterns to predict phishing attacks.

---

# Features

## AI-Based URL Detection

* Detects phishing and legitimate URLs
* Uses Logistic Regression Machine Learning model
* Fast prediction response

## Feature Extraction

Extracts suspicious URL characteristics such as:

* URL length
* Presence of @ symbol
* Number of dots
* Hyphens in domain
* HTTPS usage
* IP address usage
* Suspicious keywords
* Subdomain count
* Digit count

## TF-IDF Vectorization

* Converts URL text into numerical vectors
* Helps identify phishing word patterns
* Improves model prediction accuracy

## Chrome Extension

* Scans currently opened website
* Detects suspicious content in real-time
* Displays phishing warning popup

## Interactive Frontend

* Modern responsive UI
* URL scanning dashboard
* Safety status visualization
* User-friendly design

---

# Technologies Used

## Frontend

* HTML
* CSS
* JavaScript

## Backend

* Python
* Flask

## Machine Learning

* Scikit-learn
* Logistic Regression
* TF-IDF Vectorizer
* NumPy
* Pandas
* SciPy

---

# Project Structure

```bash
phishing_detect/
│
├── app.py
├── test.py
├── test_auth.py
├── .gitignore
│
├── frontend/
│   ├── index.html
│   ├── app.html
│   ├── styles.css
│   ├── landing.css
│   ├── landing.js
│   ├── scanner.js
│   ├── chart.js
│   └── auth.js
│
├── extension/
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
│
├── model/
│   ├── train.py
│   ├── predict.py
│   ├── phishing_model.pkl
│   └── vectorizer.pkl
│
├── utils/
│   └── features.py
│
└── data/
    ├── phishing.csv
    ├── newdata.csv
    ├── faq_data.json
    ├── rules.json
    └── storage.json
```

---

# Machine Learning Workflow

## Step 1: Dataset Collection

The dataset contains phishing and legitimate URLs.

## Step 2: Feature Extraction

Custom URL-based features are extracted using Python.

## Step 3: TF-IDF Vectorization

URLs are converted into TF-IDF vectors.

## Step 4: Feature Combination

TF-IDF vectors are combined with extracted URL features.

## Step 5: Model Training

The Logistic Regression algorithm is trained using the processed dataset.

## Step 6: Prediction

The trained model predicts whether a URL is:

* Legitimate
* Phishing

---

# Logistic Regression Model

The project uses Logistic Regression because:

* Fast training speed
* Good performance on text classification
* Efficient for phishing URL classification
* Lightweight and easy to deploy
* Works well with TF-IDF features

---

# Installation

## Clone Repository

```bash
git clone https://github.com/basavarajeshwarihiregouda-bot/phishing-detection-project.git
```

## Move Into Project

```bash
cd phishing-detection-project
```

## Create Virtual Environment

```bash
python -m venv .venv
```

## Activate Virtual Environment

### Windows

```bash
.venv\Scripts\activate
```

### Linux/Mac

```bash
source .venv/bin/activate
```

## Install Dependencies

```bash
pip install flask pandas numpy scipy scikit-learn
```

---

# Run Backend Server

```bash
python app.py
```

Server starts at:

```bash
http://127.0.0.1:5000
```

---

# Run Frontend

Move into frontend folder:

```bash
cd frontend
```

Start local server:

```bash
python -m http.server 8001
```

Open:

```bash
http://127.0.0.1:8001
```

---

# Load Chrome Extension

1. Open Chrome browser
2. Go to:

```bash
chrome://extensions
```

3. Enable:

* Developer Mode

4. Click:

* Load Unpacked

5. Select:

```bash
extension/
```

The extension will now scan websites in real-time.

---

# API Example

## Endpoint

```bash
POST /predict
```

## Sample Request

```json
{
  "url": "https://example.com"
}
```

## Sample Response

```json
{
  "prediction": "Safe"
}
```

---

# Future Improvements

* Deep Learning integration
* Real-time blacklist database
* URL screenshot analysis
* QR phishing detection
* Mobile application support
* Cloud deployment
* Threat intelligence integration

---

# Applications

* Cybersecurity awareness
* Browser security extensions
* Enterprise phishing protection
* Educational cybersecurity projects
* Secure browsing systems

---

# Author

Basavarajeshwari Hiregouda

---

# License

This project is developed for educational and research purposes.
