import requests

API_URL = "https://phishing-detection-project-kld5.onrender.com/predict"

def predict_url(url):
    try:
        response = requests.post(
            API_URL,
            json={"url": url, "user": "test_user"},
            timeout=5
        )

        print("\n======================")
        print("URL:", url)

        if response.status_code == 200:
            data = response.json()
            print("Result:", data.get("result"))

            if "reason" in data:
                print("Reason:", data["reason"])

            if "probability" in data:
                print("Probability:", data["probability"])
        else:
            print("Error:", response.status_code)

    except Exception as e:
        print("\n❌ ERROR:", url)
        print(str(e))
test_urls = [
     
   
    "https://www.express.co.uk",
    "https://www.telewebion.com",
    "https://www.java.com",
    "https://www.grid.id",
    "https://www.debate.com.mx",
    "https://www.wp.com",
    "https://www.att.com",
    "https://www.reuters.com",
    "https://www.kumparan.com",
    "https://www.squarespace.com",
    "https://www.blogspot.com.es",
    "https://www.chinadaily.com.cn",
    "https://www.coursera.org",
    "https://www.nur.kz",
    "https://www.olx.com.br",
    "https://www.onlinesbi.sbi",
    "https://www.hdfcbank.com",
    "https://www.icicibank.com",
    "https://www.paypal.com",
    "https://nptel.ac.in",
    "https://www.india.gov.in",
    "https://www.coursera.org",
    "https://ocw.mit.edu",
    "https://github.com",
    "https://stackoverflow.com",
    "https://www.kaggle.com",
    "https://www.openai.com",

    "http://g00gle.com",
    "http://paypal-login.xyz",
    "http://google.com.fake-login.xyz",
    "http://bit.ly/login",
    "http://192.168.1.1/login",



    
    # Legitimate URLs
    "https://www.google.com",
    "https://www.github.com",
    "https://www.stackoverflow.com",
    "https://www.wikipedia.org",
    "https://www.miccrosoft.com",
    "https://www.amaz0n.in",
    "https://www.linked1n.com",
    "https://www.openai.com",
    "https://www.aple.com",
    "https://www.nasa.gov",

    # Government / Education
    "https://nptel.ac.in",
    "https://www.india.gov.in",
    "https://www.coursera.org",
    "https://ocw.mit.edu",
    "https://github.com",
    "https://stackoverflow.com",
    "https://www.kaggle.com",
    "https://www.openai.com"

    
]

if __name__ == "__main__":
    print("Testing URLs...\n")

    for url in test_urls:
        predict_url(url)

    print("\nDone testing!")