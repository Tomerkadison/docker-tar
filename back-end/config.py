from confz import BaseConfig,FileSource


class DockerConfig(BaseConfig):
    username: str
    token: str
    timeout: int = 650

class GrafanaConfig(BaseConfig):
    api_key: str
    user_id: str | int
    tempo_endpoint: str = "https://tempo-prod-15-prod-us-west-0.grafana.net/tempo"

class TurnStileConfig(BaseConfig):
    verify_url: str = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    secret_token: str
    skip_verify_token: str

class Config(BaseConfig):
    docker_client : DockerConfig
    turnstile : TurnStileConfig
    grafana : GrafanaConfig
    metrics_route_token : str

    CONFIG_SOURCES = FileSource(file="config.yaml")

config = Config()