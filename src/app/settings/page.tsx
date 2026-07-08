"use client";

import { useEffect, useState, useCallback } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import PermissionGuard from "@/components/PermissionGuard";

export default function SettingsPage() {

  const { canEdit } = usePermissions("Settings");

  const [applicationName, setApplicationName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("English");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableExportReports, setEnableExportReports] = useState(true);
  const [jwtEnabled, setJwtEnabled] = useState(true);
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [tokenExpiryMinutes, setTokenExpiryMinutes] = useState(60);

  const getToken = () => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="));
    return cookie ? cookie.split("=")[1] : "";
  };

  const fetchSettings = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch("http://127.0.0.1:8000/api/settings/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();

      if (data) {
        setApplicationName(data.application_name || "");
        setCompanyName(data.company_name || "");
        setDefaultLanguage(data.default_language || "English");
        setSessionTimeout(data.session_timeout || 30);
        setAllowRegistration(data.allow_registration);
        setEnableNotifications(data.enable_notifications);
        setEnableExportReports(data.enable_export_reports);
        setJwtEnabled(data.jwt_enabled);
        setPasswordMinLength(data.password_min_length);
        setTokenExpiryMinutes(data.token_expiry_minutes);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    // ✅ removed the hardcoded role check — PermissionGuard handles access now
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async () => {
    if (applicationName.trim().length < 3) {
      alert("Application Name required");
      return;
    }

    try {
      const token = getToken();
      const payload = {
        application_name: applicationName,
        company_name: companyName,
        default_language: defaultLanguage,
        session_timeout: sessionTimeout,
        allow_registration: allowRegistration,
        enable_notifications: enableNotifications,
        enable_export_reports: enableExportReports,
        jwt_enabled: jwtEnabled,
        password_min_length: passwordMinLength,
        token_expiry_minutes: tokenExpiryMinutes,
      };

      let response = await fetch("http://127.0.0.1:8000/api/settings/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        response = await fetch("http://127.0.0.1:8000/api/settings/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        alert("Settings Updated Successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <PermissionGuard module="Settings">
      <div className="p-10">
        <h1 className="mb-8 text-4xl font-bold">Settings</h1>

        <div className="rounded-xl border p-8 shadow">
          <h2 className="mb-6 text-2xl font-bold">Application Settings</h2>

          <input
            placeholder="Application Name"
            value={applicationName}
            onChange={(e) => setApplicationName(e.target.value)}
            disabled={!canEdit}
            className="mb-4 w-full rounded border p-3 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />

          <input
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={!canEdit}
            className="mb-4 w-full rounded border p-3 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />

          <input
            placeholder="Default Language"
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            disabled={!canEdit}
            className="mb-4 w-full rounded border p-3 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />

          <input
            type="number"
            placeholder="Session Timeout"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(Number(e.target.value))}
            disabled={!canEdit}
            className="mb-6 w-full rounded border p-3 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />

          <h2 className="mb-4 text-2xl font-bold">System Options</h2>

          <label className="mb-3 block">
            <input
              type="checkbox"
              checked={allowRegistration}
              onChange={(e) => setAllowRegistration(e.target.checked)}
              disabled={!canEdit}
            />
            <span className="ml-2">Allow Registration</span>
          </label>

          <label className="mb-3 block">
            <input
              type="checkbox"
              checked={enableNotifications}
              onChange={(e) => setEnableNotifications(e.target.checked)}
              disabled={!canEdit}
            />
            <span className="ml-2">Enable Notifications</span>
          </label>

          <label className="mb-6 block">
            <input
              type="checkbox"
              checked={enableExportReports}
              onChange={(e) => setEnableExportReports(e.target.checked)}
              disabled={!canEdit}
            />
            <span className="ml-2">Enable Export Reports</span>
          </label>

          <h2 className="mb-4 text-2xl font-bold">Security Settings</h2>

          <label className="mb-3 block">
            <input
              type="checkbox"
              checked={jwtEnabled}
              onChange={(e) => setJwtEnabled(e.target.checked)}
              disabled={!canEdit}
            />
            <span className="ml-2">JWT Authentication Enabled</span>
          </label>

          <input
            type="number"
            placeholder="Password Min Length"
            value={passwordMinLength}
            onChange={(e) => setPasswordMinLength(Number(e.target.value))}
            disabled={!canEdit}
            className="mb-4 w-full rounded border p-3 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />

          <input
            type="number"
            placeholder="Token Expiry"
            value={tokenExpiryMinutes}
            onChange={(e) => setTokenExpiryMinutes(Number(e.target.value))}
            disabled={!canEdit}
            className="mb-6 w-full rounded border p-3 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />

          {/* ✅ Save button only shows if canEdit */}
          {canEdit && (
            <button
              onClick={saveSettings}
              className="rounded bg-green-600 px-6 py-3 text-white hover:bg-green-700"
            >
              Save Settings
            </button>
          )}

          {!canEdit && (
            <p className="mt-4 font-semibold text-red-600">
              You have Read Only Access.
            </p>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}