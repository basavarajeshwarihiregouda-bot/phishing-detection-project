import pickle
import numpy as np
from scipy.sparse import hstack
from urllib.parse import urlparse
from difflib import SequenceMatcher
import re

from utils.features import extract_features

# LOAD MODEL
import os
base_dir = os.path.abspath(os.path.dirname(__file__))
model_path = os.path.join(base_dir, "phishing_model.pkl")
vectorizer_path = os.path.join(base_dir, "vectorizer.pkl")
model = pickle.load(open(model_path, "rb"))
vectorizer = pickle.load(open(vectorizer_path, "rb"))

# =========================
# TRUSTED DOMAINS
# =========================
trusted_domains = [
    "google.com", "amazon.com", "facebook.com",
    "github.com", "microsoft.com", "apple.com",
    "stackoverflow.com", "youtube.com", "linkedin.com",
    "openai.com", "kaggle.com", "coursera.org",
    "mit.edu", "nptel.ac.in",

    # 🔥 ADD THESE
    "onlinesbi.sbi",
    "hdfcbank.com",
    "icicibank.com",
    "paypal.com",
    # Additional legitimate domains added per user request
    "express.co.uk",
    "telewebion.com",
    "java.com",
    "grid.id",
    "debate.com.mx",
    "wp.com",
    "att.com",
    "reuters.com",
    "kumparan.com",
    "squarespace.com",
    "blogspot.com.es",
    "chinadaily.com.cn",
    "nur.kz",
    "olx.com.br",
    "india.gov.in",
    "wikipedia.org",
]

trusted_tlds = [".gov", ".edu",".org"]

# =========================
# BANK DOMAINS
# =========================
bank_domains = [
    "onlinesbi.sbi",
    "hdfcbank.com",
    "icicibank.com",
    "paypal.com"
]

# =========================
# SHORTENERS
# =========================
shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl"]

# =========================
# RULE FUNCTIONS
# =========================
def is_trusted(url):
    domain = urlparse(url).netloc.replace("www.", "")

    for trusted in trusted_domains:
        if domain == trusted or domain.endswith("." + trusted):
            return True

    for tld in trusted_tlds:
        if domain.endswith(tld):
            return True

    return False


def is_bank(url):
    domain = urlparse(url).netloc.replace("www.", "")
    return any(domain == b or domain.endswith("." + b) for b in bank_domains)


def is_clean(url):
    return not any(x in url for x in ["@", ",,", "@@", "///", "--"])


def is_shortener(url):
    domain = urlparse(url).netloc.replace("www.", "")
    return any(domain == s or domain.endswith("." + s) for s in shorteners)


def is_typo(url):
    domain = urlparse(url).netloc.replace("www.", "")

    for legit in trusted_domains + bank_domains:
        similarity = SequenceMatcher(None, domain, legit).ratio()
        if similarity > 0.9 and domain != legit:
            return True

    return False


# =========================
# API FUNCTION
# =========================
def predict_url_api(url):
    parsed = urlparse(url)
    domain = parsed.netloc.replace("www.", "")
    
    # ANALYSIS BREAKDOWN
    analysis = {
        "domain": domain,
        "length": len(url),
        "https": parsed.scheme == "https",
        "suspicious_keywords": [k for k in ["login", "secure", "verify", "account", "update", "banking"] if k in url.lower()],
        "is_ip": bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain))
    }

    # 🔥 TRUSTED FIRST (TOP PRIORITY)
    if is_trusted(url):
        return {"result": "legitimate", "reason": "trusted domain", "analysis": analysis}

    # 🔹 THEN RULES
    if is_shortener(url):
        return {"result": "phishing", "reason": "shortened url", "analysis": analysis}

    if is_typo(url):
        return {"result": "phishing", "reason": "typo detected", "analysis": analysis}

    # 🔹 ML fallback
    text_vec = vectorizer.transform([url])
    feat_vec = np.array(extract_features(url)).reshape(1, -1)
    final = hstack([text_vec, feat_vec])

    prob = model.predict_proba(final)[0][1]
    result = "phishing" if prob > 0.75 else "legitimate"
    
    return {
        "result": result, 
        "probability": float(prob),
        "analysis": analysis
    }