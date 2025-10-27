import docker
from config import config

client = docker.from_env(timeout=config.docker_client.timeout)
client.login(username=config.docker_client.username,password=config.docker_client.token)