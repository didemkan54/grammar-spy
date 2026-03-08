const PROFANITY_BLACKLIST = [
  "damn",
  "hell",
  "stupid",
  "idiot",
  "dumb",
  "crap",
  "shit",
  "fck",
  "fuck",
  "bitch",
  "asshole",
  "bastard"
];

export function normalizePin(value) {
  const raw = String(value || "").replace(/\D+/g, "");
  if (/^\d{6}$/.test(raw)) return raw;
  return "";
}

export function validateNickname(value) {
  const clean = String(value || "").trim();
  if (clean.length < 2 || clean.length > 15) {
    return { ok: false, reason: "Nickname must be 2 to 15 characters." };
  }
  if (!/^[a-zA-Z0-9 _-]+$/.test(clean)) {
    return { ok: false, reason: "Use letters, numbers, spaces, underscore, or hyphen only." };
  }
  const lowered = clean.toLowerCase();
  if (PROFANITY_BLACKLIST.some((word) => lowered.includes(word))) {
    return { ok: false, reason: "Please choose a classroom-safe nickname." };
  }
  return { ok: true, value: clean };
}

export function createJoinForm(options) {
  const {
    formEl,
    pinInputEl,
    nicknameInputEl,
    statusEl,
    joinButtonEl,
    getAvatarId,
    getAccentColor,
    onValidSubmit
  } = options || {};

  if (!formEl || !pinInputEl || !nicknameInputEl || !statusEl || !joinButtonEl) {
    throw new Error("JoinForm is missing required elements.");
  }

  function setStatus(message, isError) {
    statusEl.textContent = message || "";
    statusEl.classList.toggle("is-error", Boolean(isError));
  }

  function withLoadingState(isLoading) {
    joinButtonEl.disabled = isLoading;
    joinButtonEl.textContent = isLoading ? "Joining..." : "Join Lobby";
  }

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const pin = normalizePin(pinInputEl.value);
    if (!pin) {
      setStatus("Enter a valid 6-digit join code.", true);
      pinInputEl.focus();
      return;
    }

    const nickResult = validateNickname(nicknameInputEl.value);
    if (!nickResult.ok) {
      setStatus(nickResult.reason, true);
      nicknameInputEl.focus();
      return;
    }

    setStatus("", false);
    withLoadingState(true);

    try {
      await onValidSubmit({
        pin,
        nickname: nickResult.value,
        avatarId: typeof getAvatarId === "function" ? getAvatarId() : null,
        accentColor: typeof getAccentColor === "function" ? getAccentColor() : "#1f8f8f"
      });
    } catch (err) {
      setStatus(err && err.message ? err.message : "Could not join lobby.", true);
      withLoadingState(false);
      return;
    }
  });

  return {
    setStatus,
    stopLoading() {
      withLoadingState(false);
    }
  };
}
