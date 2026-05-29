import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker only in production to avoid stale-cache issues in dev.
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
	if (import.meta.env.PROD) {
		navigator.serviceWorker
			.register("/sw.js")
			.catch(() => {});
	} else {
		navigator.serviceWorker.getRegistrations().then((registrations) => {
			registrations.forEach((registration) => {
				registration.unregister().catch(() => {});
			});
		});
	}
}
