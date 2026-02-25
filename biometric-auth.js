(function () {
  var KEY = "gs_biometric_credentials";

  function supportsWebAuthn() {
    return !!(window.PublicKeyCredential && navigator.credentials);
  }

  async function checkAvailable() {
    var available = supportsWebAuthn();
    var label = available ? "Biometric" : "";
    return { available: available, label: label };
  }

  async function saveCredentials(account) {
    if (!account) return false;
    try {
      localStorage.setItem(KEY, JSON.stringify(account));
      return true;
    } catch (e) {
      return false;
    }
  }

  async function hasStoredCredentials() {
    try {
      return !!localStorage.getItem(KEY);
    } catch (e) {
      return false;
    }
  }

  async function signInWithBiometric() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  window.GS_BIOMETRIC = {
    checkAvailable: checkAvailable,
    saveCredentials: saveCredentials,
    hasStoredCredentials: hasStoredCredentials,
    signInWithBiometric: signInWithBiometric
  };
})();
