import { useEffect, useRef, useState } from "react";
import {
  Check,
  ShieldCheck,
  X,
  Heart,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { initials } from "../lib/data.js";
import { DEMO_LOGIN } from "../lib/storage.js";

export function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-mark">
        <Heart size={22} strokeWidth={2.3} />
      </span>
      <span>
        the date crew<span className="brand-dot">.</span>
      </span>
    </div>
  );
}

export function Avatar({ profile, size = "md" }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={`avatar avatar-${size} ${profile.gender === "Male" ? "avatar-blue" : ""}`}
    >
      {failed ? (
        initials(profile)
      ) : (
        <img
          src={profile.photo}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`status-badge status-${status.toLowerCase().replaceAll(" ", "-")}`}
    >
      <i />
      {status}
    </span>
  );
}

export function Verified({ compact = false }) {
  return (
    <span
      className="verified"
      title="Simulated verification for this fictional demo profile"
    >
      <ShieldCheck size={compact ? 14 : 16} />
      {!compact && "Verified profile"}
    </span>
  );
}

export function EmptyState({ icon: Icon = Heart, title, children, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={28} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}

export function Modal({ title, subtitle, children, onClose, wide = false }) {
  const dialog = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") closeRef.current();
      if (event.key !== "Tab") return;
      const elements = [
        ...dialog.current.querySelectorAll(
          'button, a[href], input, select, textarea, [tabindex="0"]',
        ),
      ].filter((el) => !el.disabled && el.getClientRects().length);
      const first = elements[0];
      const last = elements.at(-1);
      if (!elements.length) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={dialog}
      >
        <div className="modal-heading">
          <div>
            <h2 id="modal-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  function submit(event) {
    event.preventDefault();
    if (
      username.trim() === DEMO_LOGIN.username &&
      password === DEMO_LOGIN.password
    )
      onLogin();
    else setError("Use the sample username and password shown below.");
  }
  return (
    <div className="login-page">
      <section className="login-story">
        <Brand light />
        <div className="login-story-content">
          <span className="story-symbol">
            <Heart size={46} />
          </span>
          <h1>
            Good connections
            <br />
            start with you.
          </h1>
          <p>
            A little intuition. A little insight.
            <br />A whole lot of heart.
          </p>
          <div className="story-people">
            {[
              {
                gender: "Female",
                firstName: "A",
                lastName: "M",
                photo: "https://randomuser.me/api/portraits/women/44.jpg",
              },
              {
                gender: "Male",
                firstName: "R",
                lastName: "K",
                photo: "https://randomuser.me/api/portraits/men/32.jpg",
              },
              {
                gender: "Female",
                firstName: "M",
                lastName: "I",
                photo: "https://randomuser.me/api/portraits/women/68.jpg",
              },
            ].map((person, i) => (
              <Avatar profile={person} key={i} />
            ))}
            <span>
              Thoughtful matches.
              <br />
              <strong>Real human care.</strong>
            </span>
          </div>
        </div>
        <p className="story-footer">
          Made for the people behind the introductions.
        </p>
        <div className="story-orbit orbit-one" />
        <div className="story-orbit orbit-two" />
      </section>
      <section className="login-form-side">
        <div className="login-mobile-brand">
          <Brand />
        </div>
        <div className="login-form-wrap">
          <span className="small-icon">
            <Sparkles size={22} />
          </span>
          <h2>Welcome back.</h2>
          <p>Your next great introduction is waiting.</p>
          <form onSubmit={submit}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your matchmaker username"
              required
            />
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={visible ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                aria-label={visible ? "Hide password" : "Show password"}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary login-submit" type="submit">
              Sign in to your workspace <ArrowRight size={17} />
            </button>
          </form>
          <div className="demo-login">
            <span className="demo-label">
              <Check size={15} /> Explore the assignment demo
            </span>
            <p>
              Username: <code>{DEMO_LOGIN.username}</code>
              <br />
              Password: <code>{DEMO_LOGIN.password}</code>
            </p>
            <button
              className="text-button"
              onClick={() => {
                setUsername(DEMO_LOGIN.username);
                setPassword(DEMO_LOGIN.password);
                setError("");
              }}
            >
              Fill demo credentials <ArrowRight size={14} />
            </button>
          </div>
          <p className="login-disclaimer">
            A demo workspace with fictional profiles. Sign-in is simulated; use
            the sample credentials only.
          </p>
        </div>
        <span className="login-bottom">
          The Date Crew · Matchmaker workspace
        </span>
      </section>
    </div>
  );
}
