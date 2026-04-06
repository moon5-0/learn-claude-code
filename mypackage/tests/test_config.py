"""Unit tests for config module."""

import os
import tempfile
import json
import pytest
from pathlib import Path

from mypackage.config import (
    Config,
    AgentConfig,
    create_config,
    create_agent_config,
)


class TestConfig:
    """Tests for Config class."""
    
    def test_init_defaults(self):
        """Test Config initialization with defaults."""
        config = Config()
        assert config.config_dir == Path.cwd()
        assert config.env_prefix == ""
        assert config._config == {}
    
    def test_init_with_params(self):
        """Test Config initialization with parameters."""
        config = Config(config_dir="/tmp", env_prefix="APP_")
        assert config.config_dir == Path("/tmp")
        assert config.env_prefix == "APP_"
    
    def test_get_from_env(self, monkeypatch):
        """Test getting config from environment variable."""
        monkeypatch.setenv("TEST_KEY", "test_value")
        config = Config()
        value = config.get("TEST_KEY")
        assert value == "test_value"
    
    def test_get_from_env_with_prefix(self, monkeypatch):
        """Test getting config from environment variable with prefix."""
        monkeypatch.setenv("APP_TEST_KEY", "test_value")
        config = Config(env_prefix="APP_")
        value = config.get("TEST_KEY")
        assert value == "test_value"
    
    def test_get_from_config_dict(self):
        """Test getting config from internal dictionary."""
        config = Config()
        config.set("key", "value")
        assert config.get("key") == "value"
    
    def test_get_default(self):
        """Test getting config with default value."""
        config = Config()
        value = config.get("missing_key", default="default")
        assert value == "default"
    
    def test_precedence(self, monkeypatch):
        """Test that environment variables take precedence."""
        monkeypatch.setenv("TEST_KEY", "env_value")
        config = Config()
        config.set("TEST_KEY", "config_value")
        # Env should take precedence
        assert config.get("TEST_KEY") == "env_value"
    
    def test_disable_env_lookup(self, monkeypatch):
        """Test disabling environment variable lookup."""
        monkeypatch.setenv("TEST_KEY", "env_value")
        config = Config()
        config.set("TEST_KEY", "config_value")
        # Should use config value when env lookup disabled
        assert config.get("TEST_KEY", use_env=False) == "config_value"
    
    def test_load_json(self):
        """Test loading config from JSON file."""
        config_data = {"key1": "value1", "key2": "value2"}
        
        with tempfile.TemporaryDirectory() as tmpdir:
            config_path = Path(tmpdir) / "config.json"
            with open(config_path, "w") as f:
                json.dump(config_data, f)
            
            config = Config(config_dir=tmpdir)
            loaded = config.load_json()
            
            assert loaded == config_data
            assert config.get("key1") == "value1"
            assert config.get("key2") == "value2"
    
    def test_load_json_file_not_found(self):
        """Test loading config from missing file."""
        config = Config(config_dir="/nonexistent")
        with pytest.raises(FileNotFoundError):
            config.load_json()
    
    def test_get_all(self):
        """Test getting all config values."""
        config = Config()
        config.set("key1", "value1")
        config.set("key2", "value2")
        
        all_config = config.get_all()
        assert all_config == {"key1": "value1", "key2": "value2"}
    
    def test_clear(self):
        """Test clearing config."""
        config = Config()
        config.set("key", "value")
        config.clear()
        
        assert config._config == {}
        assert config._loaded == False


class TestAgentConfig:
    """Tests for AgentConfig class."""
    
    def test_defaults(self):
        """Test AgentConfig default values."""
        config = AgentConfig()
        
        assert config.model == "claude-3-5-sonnet-20241022"
        assert config.max_tokens == 4096
        assert config.temperature == 1.0
        assert "assistant" in config.system_prompt.lower()
    
    def test_api_key_from_env(self, monkeypatch):
        """Test getting API key from environment."""
        monkeypatch.setenv("ANTHROPIC_API_KEY", "test_key")
        config = AgentConfig()
        
        assert config.api_key == "test_key"
    
    def test_validate_with_api_key(self, monkeypatch):
        """Test validation with API key."""
        monkeypatch.setenv("ANTHROPIC_API_KEY", "test_key")
        config = AgentConfig()
        
        assert config.validate() == True
    
    def test_validate_without_api_key(self):
        """Test validation without API key."""
        config = AgentConfig()
        # Ensure no API key is set
        if "ANTHROPIC_API_KEY" in os.environ:
            del os.environ["ANTHROPIC_API_KEY"]
        
        assert config.validate() == False
    
    def test_custom_config_dir(self):
        """Test AgentConfig with custom config directory."""
        with tempfile.TemporaryDirectory() as tmpdir:
            config = AgentConfig(config_dir=tmpdir)
            assert config.config_dir == Path(tmpdir)


class TestFactoryFunctions:
    """Tests for factory functions."""
    
    def test_create_config(self):
        """Test create_config factory."""
        config = create_config(config_dir="/tmp", env_prefix="TEST_")
        assert isinstance(config, Config)
        assert config.env_prefix == "TEST_"
    
    def test_create_agent_config(self):
        """Test create_agent_config factory."""
        config = create_agent_config()
        assert isinstance(config, AgentConfig)
