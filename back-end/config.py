from confz import BaseConfig,FileSource


class DockerConfig(BaseConfig):
    username: str
    token: str
    timeout: int = 650

class TurnStileConfig(BaseConfig):
    verify_url: str = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    secret_token: str
    skip_verify_token: str
class Config(BaseConfig):
    docker_client : DockerConfig
    turnstile : TurnStileConfig
    metrics_route_token : str

    CONFIG_SOURCES = FileSource(file="config.yaml")

config = Config()