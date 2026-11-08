import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { LoginErrors, LoginFormValues } from '../types';
import { getMe, login, type User } from '../api/auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_KEY = 'cc_token';

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
  remember: false,
};

function validate(values: LoginFormValues): LoginErrors {
  const errors: LoginErrors = {};
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
}

export default function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Restore session if a valid token is saved in sessionStorage
  useEffect(() => {
    const savedToken = sessionStorage.getItem(TOKEN_KEY);
    if (!savedToken) return;

    let isMounted = true;
    getMe(savedToken)
      .then((user) => {
        if (isMounted) setCurrentUser(user);
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        if (isMounted) setCurrentUser(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, type, value, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(values.email.trim(), values.password);
      sessionStorage.setItem(TOKEN_KEY, result.token);
      const profile = await getMe(result.token);
      setCurrentUser(profile);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Wrong email or password.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setCurrentUser(null);
    setValues(INITIAL_VALUES);
    setErrors({});
    setApiError(null);
  }

  // Logged-in Welcome Screen
  if (currentUser) {
    return (
      <section className="login-card welcome-card" aria-labelledby="welcome-title">
        <h2 id="welcome-title" className="login-card__title welcome-title">
          Welcome, {currentUser.name}
        </h2>
        <p className="login-card__subtitle welcome-email">{currentUser.email}</p>
        <button
          type="button"
          className="btn btn--primary logout-btn"
          onClick={handleLogout}
        >
          Log out
        </button>
      </section>
    );
  }

  // Sign-in Form Screen
  return (
    <section className="login-card" aria-labelledby="login-title">
      <h2 id="login-title" className="login-card__title">
        Sign in
      </h2>
      <p className="login-card__subtitle">Use your school email to continue.</p>

      {apiError && (
        <div className="auth-error-banner" role="alert">
          {apiError}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="email">School email</label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@school.edu.ph"
            value={values.email}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="form-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <div className="password-row">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              disabled={isLoading}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className="btn btn--ghost toggle-password"
              aria-controls="password"
              aria-pressed={showPassword}
              disabled={isLoading}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="form-error" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        <div className="form-options">
          <label className="checkbox">
            <input
              type="checkbox"
              name="remember"
              checked={values.remember}
              onChange={handleChange}
              disabled={isLoading}
            />
            <span>Keep me signed in</span>
          </label>
          <a className="link" href="#forgot">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="login-card__divider">
        <span>or</span>
      </div>

      <div className="alt-actions">
        <button type="button" className="btn btn--secondary" disabled={isLoading}>
          Create account
        </button>
        <button type="button" className="btn btn--secondary" disabled={isLoading}>
          Continue as guest
        </button>
      </div>
    </section>
  );
}
