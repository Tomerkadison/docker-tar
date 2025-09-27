import docker
from config import config

client = docker.from_env(timeout=650)
client.login(username=config.docker_client.username,password=config.docker_client.token)