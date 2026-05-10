from urllib.parse import urlparse
import re

def extract_features(url):
    parsed = urlparse(url)
    domain = parsed.netloc

    return [
        len(url),
        url.count('.'),
        url.count('-'),
        url.count('@'),
        int('login' in url.lower()),
        int('secure' in url.lower()),
        int('account' in url.lower()),
        int('verify' in url.lower()),
        int(parsed.scheme == 'https'),
        len(domain),
        int(bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain))),
        url.count('/'),
        url.count('?'),
        url.count('='),
        url.count('_'),
        int(url.count('//') > 1),
        int(':' in domain)
    ]