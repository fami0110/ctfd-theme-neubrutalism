export function registerActiveInstances(Alpine, CTFd) {
  Alpine.data("ActiveInstances", () => ({
    instances: [],
    loading: true,
    failed: false,
    loaded: false,
    action: {
      instanceId: null,
      name: null,
      message: "",
      error: false,
    },
    requestInFlight: false,
    refreshQueued: false,

    init() {
      this.load();
      this.refreshTimer = window.setInterval(() => this.load(), 10000);
      this.instanceChangedHandler = () => this.load(true);
      this.visibilityHandler = () => {
        if (document.visibilityState === "visible") {
          this.load(true);
        }
      };
      window.addEventListener(
        "ctfd:isolated-instance-changed",
        this.instanceChangedHandler,
      );
      document.addEventListener("visibilitychange", this.visibilityHandler);
    },

    destroy() {
      window.clearInterval(this.refreshTimer);
      window.removeEventListener(
        "ctfd:isolated-instance-changed",
        this.instanceChangedHandler,
      );
      document.removeEventListener("visibilitychange", this.visibilityHandler);
    },

    async load(force = false) {
      if (this.requestInFlight) {
        if (force) {
          this.refreshQueued = true;
        }
        return;
      }
      if (this.loading && this.loaded && !force) {
        return;
      }
      this.requestInFlight = true;
      this.loading = true;
      this.failed = false;
      try {
        const root = CTFd.config.urlRoot || "";
        const response = await fetch(
          root + "/api/v1/isolated/participant/instances",
          {
            credentials: "same-origin",
            headers: { Accept: "application/json" },
          },
        );
        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error("Active instances could not be loaded.");
        }
        this.instances = Array.isArray(payload.data) ? payload.data : [];
        this.loaded = true;
      } catch (error) {
        this.failed = true;
        if (!this.loaded) {
          this.instances = [];
        }
      } finally {
        this.requestInFlight = false;
        this.loading = false;
        if (this.refreshQueued) {
          this.refreshQueued = false;
          window.setTimeout(() => this.load(true), 0);
        }
      }
    },

    isMutating() {
      return this.action.instanceId !== null && !this.action.error;
    },

    isBusy(instance, name) {
      return (
        this.action.instanceId === instance.instance_id &&
        this.action.name === name &&
        !this.action.error
      );
    },

    feedbackFor(instance) {
      if (this.action.instanceId !== instance.instance_id) {
        return "";
      }
      return this.action.message;
    },

    feedbackClass(instance) {
      return this.action.instanceId === instance.instance_id && this.action.error
        ? "is-error"
        : "";
    },

    async mutate(instance, name) {
      if (this.isMutating()) {
        return;
      }

      const challengeName = instance.challenge_name || "this challenge";
      const confirmation =
        name === "reset"
          ? `Reset ${challengeName} for the entire team? This replaces the service and revokes its current flag.`
          : `Stop ${challengeName} for the entire team? This stops the service and revokes its current flag.`;
      if (!window.confirm(confirmation)) {
        return;
      }

      this.action = {
        instanceId: instance.instance_id,
        name,
        message: name === "reset" ? "Resetting instance…" : "Stopping instance…",
        error: false,
      };

      try {
        const root = CTFd.config.urlRoot || "";
        const response = await fetch(
          `${root}/api/v1/isolated/challenges/${instance.challenge_id}/instance/${name}`,
          {
            method: "POST",
            credentials: "same-origin",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "CSRF-Token": CTFd.config.csrfNonce || "",
            },
            body: "{}",
          },
        );
        const contentType = response.headers.get("content-type") || "";
        const payload = contentType.includes("application/json")
          ? await response.json()
          : null;
        if (response.redirected || !payload || !response.ok || !payload.success) {
          const errors = (payload && payload.errors) || {};
          const messages = Object.keys(errors).reduce(
            (result, key) => result.concat(errors[key] || []),
            [],
          );
          throw new Error(
            messages[0] ||
              (response.redirected
                ? "Sign in again to manage team instances."
                : `Could not ${name} this instance.`),
          );
        }

        await this.load(true);
        this.action = {
          instanceId: null,
          name: null,
          message: "",
          error: false,
        };
      } catch (error) {
        this.action = {
          instanceId: instance.instance_id,
          name,
          message: error.message || `Could not ${name} this instance.`,
          error: true,
        };
      }
    },

    challengeUrl(instance) {
      const name = instance.challenge_name || "Challenge";
      return `${CTFd.config.urlRoot || ""}/challenges#${encodeURIComponent(
        name + "-" + instance.challenge_id,
      )}`;
    },

    expiry(value) {
      if (!value) {
        return "Expiry unavailable";
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return "Expiry unavailable";
      }
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    },
  }));
}
