export const ENV_VARS = {
    development: {
        "API_URL": "http://localhost:4567/api/v1",
        "LOGIN_URL": "http://localhost:4567/auth/login",
        "GOOGLE_AUTH_URL": "http://localhost:4567/auth/google",
        "OAUTH_CALLBACK_URL": "http://localhost:4567/auth/google"
    },
    production: {
        "API_URL": "https://linenumbers.app/api/v1",
        "LOGIN_URL": "https://linenumbers.app/auth/login",
        "GOOGLE_AUTH_URL": "https://linenumbers.app/auth/google",
        "OAUTH_CALLBACK_URL": "https://linenumbers.app/auth/google"
    },
}