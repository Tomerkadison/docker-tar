import docker
from collections import deque


client = docker.from_env(timeout=650)

users = deque(["tomerkad"])
client.login(username="tomerkad",password="dckr_pat_yaeWjeT3tSeMkVNG-IFRt1b3Yq8")