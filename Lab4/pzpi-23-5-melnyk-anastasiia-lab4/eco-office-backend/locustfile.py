from locust import HttpUser, task, between
import threading

EMAIL = "loadtest@eco.com"
PASSWORD = "password123"

TOKEN = None
lock = threading.Lock()


class EcoOfficeUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        global TOKEN

        with lock:
            if TOKEN is None:
                self.client.post("/api/auth/register", json={
                    "email": EMAIL,
                    "password": PASSWORD,
                    "fullName": "Load Test User",
                    "role": "CLEANER"
                })

                res = self.client.post("/api/auth/login", json={
                    "email": EMAIL,
                    "password": PASSWORD
                })

                TOKEN = res.json().get("token")
                print("🔑 TOKEN CREATED")

        self.client.headers.update({
            "Authorization": f"Bearer {TOKEN}"
        })

    @task(3)
    def view_tasks(self):
        self.client.get("/api/tasks", name="Get All Tasks")