import { useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  LoaderCircle,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";
import { ageOf, fullName } from "../lib/data.js";
import { draftIntro } from "../lib/matching.js";
import { Avatar } from "./shared.jsx";

export default function IntroductionComposer({
  customer,
  match,
  onSend,
  onCancel,
  notify,
  apiAvailable,
}) {
  const [body, setBody] = useState(() => draftIntro(customer, match));
  const [busy, setBusy] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const person = match.profile;
  async function polish() {
    setBusy(true);
    try {
      const response = await fetch("/api/intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, profileId: person.id }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "AI drafting is unavailable.");
      if (typeof data.intro !== "string" || !data.intro.trim())
        throw new Error("The draft was empty.");
      setBody(data.intro);
      setAiUsed(true);
      notify("AI draft ready. Please review before sending.");
    } catch (error) {
      notify(
        error.name === "TimeoutError"
          ? "AI drafting timed out. Your existing draft is still here."
          : error.message,
        "error",
      );
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
    } catch {
      notify("Select the introduction text to copy it.", "error");
    }
  }
  return (
    <div className="intro-composer">
      <div className="email-recipient">
        <span className="email-icon">
          <Mail size={19} />
        </span>
        <div>
          <strong>To {fullName(customer)}</strong>
          <span>{customer.email}</span>
        </div>
        <span className="demo-chip">Mock email</span>
      </div>
      <div className="intro-profile">
        <Avatar profile={person} />
        <div>
          <strong>{fullName(person)}</strong>
          <p>
            {ageOf(person.dob)} years · {person.city} · {person.designation}
          </p>
        </div>
        <span className="intro-score">
          {match.score}
          <small>/100</small>
        </span>
      </div>
      <label className="intro-subject">
        Subject<span>A thoughtful introduction: meet {person.firstName}</span>
      </label>
      <div className="intro-editor-heading">
        <label htmlFor="intro-body">Your introduction</label>
        {apiAvailable && (
          <button className="text-button" disabled={busy} onClick={polish}>
            {busy ? (
              <LoaderCircle size={14} className="spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {busy ? "Drafting…" : "Polish with AI"}
          </button>
        )}
      </div>
      <textarea
        id="intro-body"
        className="intro-body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={5000}
        rows={12}
      />
      <p className="intro-helper">
        {aiUsed
          ? "OpenAI-assisted draft. Review the details and tone."
          : "A suggested draft based on verified profile fields and compatibility reasons."}
      </p>
      <div className="mock-notice">
        <AlertCircle size={16} />
        <span>
          This saves a mock email to your outbox. No real email will be sent.
        </span>
      </div>
      <div className="modal-footer">
        <button className="button secondary" onClick={copy}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy draft"}
        </button>
        <div>
          <button className="button subtle" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="button primary"
            disabled={!body.trim() || busy}
            onClick={() => onSend(body)}
          >
            <Send size={15} />
            Send mock email
          </button>
        </div>
      </div>
    </div>
  );
}
