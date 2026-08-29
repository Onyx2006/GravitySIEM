from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration, loaded from environment variables.

    Every value has a sane local default so `docker compose up --build`
    works out of the box without an .env file.
    """

    database_url: str = (
        "postgresql+psycopg://gravity:gravity_dev_password@localhost:5432/gravity_siem"
    )
    cors_origins: str = "http://localhost:5173"
    seed_on_start: bool = True

    # Correlation / detection tunables
    incident_correlation_window_seconds: int = 300

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()