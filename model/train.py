import pandas as pd
import numpy as np
import pickle

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.utils import resample
from scipy.sparse import hstack

from utils.features import extract_features

# LOAD DATA
df = pd.read_csv("data/phishing.csv")
df.columns = df.columns.str.strip()

# DETECT COLUMNS
url_col = [c for c in df.columns if c.lower() == "url"][0]
label_col = [c for c in df.columns if c.lower() in ["label", "class", "status"]][0]

# CLEAN LABELS
df[label_col] = pd.to_numeric(df[label_col], errors='coerce')
df = df.dropna(subset=[label_col])

# BALANCE
df_phish = df[df[label_col] == 1]
df_legit = df[df[label_col] == 0]

df_legit = resample(df_legit, replace=True, n_samples=len(df_phish), random_state=42)
df = pd.concat([df_phish, df_legit]).sample(frac=1)

# ADD REAL LEGIT DOMAINS
extra_legit = [
    "https://google.com","https://amazon.com","https://facebook.com",
    "https://github.com","https://stackoverflow.com","https://microsoft.com",
    "https://apple.com","https://youtube.com","https://linkedin.com"
]

df_extra = pd.DataFrame({url_col: extra_legit, label_col: [0]*len(extra_legit)})
df = pd.concat([df, df_extra])

# TF-IDF
vectorizer = TfidfVectorizer(analyzer='char', ngram_range=(3,5), max_features=5000)
X_text = vectorizer.fit_transform(df[url_col])

# FEATURES
X_feat = np.array([extract_features(u) for u in df[url_col]])

# COMBINE
X = hstack([X_text, X_feat])
y = df[label_col]

# TRAIN
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = LogisticRegression(max_iter=1000, class_weight='balanced')
model.fit(X_train, y_train)

print("Accuracy:", model.score(X_test, y_test))

# SAVE
pickle.dump(model, open("model/phishing_model.pkl", "wb"))
pickle.dump(vectorizer, open("model/vectorizer.pkl", "wb"))