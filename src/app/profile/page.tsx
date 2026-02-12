"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MarketHeader from "@/components/MarketHeader";
import { firebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged, updateProfile, User } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!firebaseAuth) {
      router.push("/auth/login");
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      setUser(currentUser);
      setDisplayName(currentUser.displayName || "");
      setPhotoURL(currentUser.photoURL || "");
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firebaseAuth) return;

    setLoading(true);
    setMessage(null);

    try {
      await updateProfile(user, {
        displayName: displayName || null,
        photoURL: photoURL || null,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <MarketHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="text-color-muted">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-color-border bg-color-surface p-8 shadow-lg">
          <div className="border-b border-color-border pb-6">
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="mt-2 text-sm text-color-muted">
              Manage your account information and preferences
            </p>
          </div>

          {message && (
            <div
              className={`mt-6 rounded-lg border px-4 py-3 ${
                message.type === "success"
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-400/40 bg-rose-500/10 text-rose-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            {/* Profile Photo */}
            <div>
              <label className="text-sm font-semibold text-color-muted">Profile Photo</label>
              <div className="mt-3 flex items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent text-3xl font-bold text-black">
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt="Profile"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.email || "U")
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-lg border border-color-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
                  />
                  <p className="mt-2 text-xs text-color-muted">
                    Enter a URL for your profile photo
                  </p>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="text-sm font-semibold text-color-muted">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="mt-3 w-full rounded-lg border border-color-border bg-background px-4 py-2 focus:border-accent focus:outline-none"
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="text-sm font-semibold text-color-muted">Email</label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="mt-3 w-full rounded-lg border border-color-border bg-color-muted/5 px-4 py-2 text-color-muted cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-color-muted">Email cannot be changed</p>
            </div>

            {/* Account Info */}
            <div>
              <label className="text-sm font-semibold text-color-muted">Account Status</label>
              <div className="mt-3 rounded-lg border border-color-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verified</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.emailVerified
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {user.emailVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-color-border">
                  <span className="text-sm">Account Created</span>
                  <span className="text-sm text-color-muted">
                    {user.metadata.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-color-border">
                  <span className="text-sm">Last Sign In</span>
                  <span className="text-sm text-color-muted">
                    {user.metadata.lastSignInTime
                      ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-accent px-6 py-3 font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-lg border border-color-border px-6 py-3 font-semibold hover:bg-color-muted/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
