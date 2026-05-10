import json
from app import app

def test():
    client = app.test_client()
    
    # Test register
    resp = client.post('/register', json={"username": "newuser", "password": "newpass"})
    print("Register newuser:", resp.status_code, resp.get_json())
    
    # Test register existing
    resp = client.post('/register', json={"username": "newuser", "password": "newpass"})
    print("Register existing:", resp.status_code, resp.get_json())

    # Test login success
    resp = client.post('/login', json={"username": "newuser", "password": "newpass"})
    print("Login newuser:", resp.status_code, resp.get_json())

    # Test login failure
    resp = client.post('/login', json={"username": "newuser", "password": "wrong"})
    print("Login failure:", resp.status_code, resp.get_json())

if __name__ == "__main__":
    test()
