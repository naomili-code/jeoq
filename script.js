const status = document.getElementById("status");
const planStatus = document.getElementById("plan-status");
const profileStatus = document.getElementById("profile-status");
const authStatus = document.getElementById("auth-status");

const STORAGE_KEYS = {
	users: "jeoq-users",
	currentUser: "jeoq-current-user",
	liked: "jeoq-liked-items",
	favorited: "jeoq-favorited-items",
	posts: "jeoq-posts",
};

const STALE_DAYS = 14;
const STALE_MS = STALE_DAYS * 24 * 60 * 60 * 1000;

const CREATOR_DIRECTORY = {
	laugh_labs: {
		name: "@laugh_labs",
		bio: "Daily comedy bits, sketches, and funny office moments.",
		followers: "1.8M",
		following: "124",
		avatar: "assets/jeoq-logo.svg",
		content: [
			"When your boss laughs at your joke and forgets the deadline.",
			"Trying stand-up jokes on coworkers at 9AM.",
			"Behind the scenes of a comedy skit shoot.",
		],
		reposts: ["Top 10 prank reactions this week.", "Comedy duet with @meme_mic."],
		followingList: ["@meme_mic", "@giggle_factory", "@pun_parade"],
		followersList: ["@chucklequeen", "@dailyhaha", "@rofl_agent"],
	},
	meme_mic: {
		name: "@meme_mic",
		bio: "POV sketches and relatable funny content every day.",
		followers: "920K",
		following: "301",
		avatar: "assets/jeoq-logo.svg",
		content: [
			"POV: You made one joke and now lead every meeting icebreaker.",
			"The friend who sends memes at 3AM.",
			"Expectation vs reality: being funny on camera.",
		],
		reposts: ["Best laugh challenge clips.", "Office humor collab highlights."],
		followingList: ["@laugh_labs", "@comedyloop", "@mirthhub"],
		followersList: ["@snortclub", "@jokebox", "@funstream"],
	},
};

const SOUND_DIRECTORY = {
	office_legend: {
		name: "Office Legend Beat",
		creator: "@laugh_labs",
		icon: "assets/jeoq-logo.svg",
		content: [
			{ title: "Boardroom punchline challenge", creator: "@laugh_labs", likes: 284000 },
			{ title: "When HR laughs first", creator: "@dailyhaha", likes: 220100 },
			{ title: "Monday meeting comedy remix", creator: "@chucklequeen", likes: 176500 },
		],
	},
	pov_pun: {
		name: "POV Pun Track",
		creator: "@meme_mic",
		icon: "assets/jeoq-logo.svg",
		content: [
			{ title: "POV: you dropped a dad joke", creator: "@meme_mic", likes: 198400 },
			{ title: "Pun battle in group chat", creator: "@snortclub", likes: 151200 },
			{ title: "Relatable pun skit", creator: "@funstream", likes: 94700 },
		],
	},
};

const DEFAULT_FEED_CONTENT = [
	{
		id: "office-legend-clip",
		title: "When your joke lands and you become the office legend.",
		creator: "@laugh_labs",
		creatorKey: "laugh_labs",
		hashtags: ["#funny", "#comedy", "#jeoq", "#fyp"],
		sound: "office_legend",
		style: "default",
	},
	{
		id: "pov-pun-sketch",
		title: "POV: you said one pun and now everyone avoids eye contact.",
		creator: "@meme_mic",
		creatorKey: "meme_mic",
		hashtags: ["#sketch", "#lol", "#creator", "#foryoupage"],
		sound: "pov_pun",
		style: "alt",
	},
];

function setStatus(target, message) {
	if (target) {
		target.textContent = message;
	}
}

function normalizeUsername(username) {
	return String(username || "").trim().toLowerCase();
}

function loadUsers() {
	try {
		const raw = localStorage.getItem(STORAGE_KEYS.users);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

function getPageName() {
	const path = window.location.pathname;
	return path.substring(path.lastIndexOf("/") + 1) || "index.html";
}

function redirect(path) {
	if (getPageName() !== path) {
		window.location.href = path;
	}
}

function ensureNewUsersStartAtRegister() {
	const users = loadUsers();
	const hasUsers = Object.keys(users).length > 0;
	const page = getPageName();
	const isRegisterPage = page === "register.html";

	if (!hasUsers && !isRegisterPage) {
		redirect("register.html");
	}
}

function saveUsers(users) {
	localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getCurrentUserKey() {
	return localStorage.getItem(STORAGE_KEYS.currentUser);
}

function setCurrentUserKey(userKey) {
	localStorage.setItem(STORAGE_KEYS.currentUser, userKey);
}

function getCurrentUser() {
	const users = loadUsers();
	const userKey = getCurrentUserKey();
	if (!userKey || !users[userKey]) {
		return null;
	}
	return { key: userKey, data: users[userKey] };
}

function loadMapStorage(key) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

function saveMapStorage(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}

function loadPostList() {
	const posts = loadMapStorage(STORAGE_KEYS.posts);
	return Array.isArray(posts) ? posts : [];
}

function savePostList(posts) {
	saveMapStorage(STORAGE_KEYS.posts, posts);
}

function normalizeTag(tag) {
	return String(tag || "").replace(/^#/, "").trim().toLowerCase();
}

function parseHashtags(text) {
	const tags = String(text || "")
		.match(/#?[a-zA-Z0-9_]+/g)
		?.map((item) => `#${normalizeTag(item)}`)
		.filter((item) => item.length > 1) || [];

	return Array.from(new Set(tags));
}

function getAllFeedContent() {
	const userPosts = loadPostList();
	return [...userPosts, ...DEFAULT_FEED_CONTENT];
}

function getSoundLabel(soundKey) {
	return SOUND_DIRECTORY[soundKey]?.name || "Sound";
}

function tagLinkHtml(tag) {
	const normalized = normalizeTag(tag);
	return `<a class="hashtag-link" href="hashtags.html?tag=${encodeURIComponent(normalized)}">#${normalized}</a>`;
}

function renderFeed() {
	const feedList = document.getElementById("feed-list");
	if (!feedList) {
		return;
	}

	const posts = getAllFeedContent();
	feedList.innerHTML = posts
		.map((post) => {
			const hasMedia = Boolean(post.mediaDataUrl);
			const frameClass = ["video-frame", post.style === "alt" ? "alt" : "", hasMedia ? "has-media" : ""]
				.filter(Boolean)
				.join(" ");
			const hashtagHtml = (post.hashtags || []).map(tagLinkHtml).join(" ");
			const mediaHtml = hasMedia
				? `<video class="post-video" playsinline controls preload="metadata" src="${post.mediaDataUrl}"></video>`
				: "";
			return `<article class="video-post card-dark" data-content-id="${post.id}" data-content-title="${post.title}">
				<div class="${frameClass}">
					${mediaHtml}
					<p class="video-caption">"${post.title}"</p>
					<div class="video-side-actions">
						<button class="action-btn icon-action" data-action="like" aria-label="Like">❤️</button>
						<button class="action-btn icon-action" data-action="favorite" aria-label="Favorite">⭐</button>
					</div>
					<a class="sound-link" href="sound.html?sound=${post.sound}" aria-label="Open sound page for ${getSoundLabel(post.sound)}">
						<img src="assets/jeoq-logo.svg" alt="Sound icon" class="sound-icon" />
					</a>
				</div>
				<div class="video-meta">
					<div class="creator-row">
						<p class="creator"><a class="creator-link" href="creator.html?creator=${post.creatorKey}">${post.creator}</a></p>
						<button class="action-btn follow-plus-btn" data-action="follow" aria-label="Follow creator">+</button>
					</div>
					<p class="hashtags">${hashtagHtml}</p>
				</div>
			</article>`;
		})
		.join("");
}

function fileToDataUrl(fileLike) {
	return new Promise((resolve, reject) => {
		if (!fileLike) {
			resolve("");
			return;
		}

		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ""));
		reader.onerror = () => reject(new Error("Unable to read selected media."));
		reader.readAsDataURL(fileLike);
	});
}

function bindPublishMediaTools() {
	const publishForm = document.getElementById("publish-form");
	if (!publishForm || publishForm.dataset.mediaBound === "true") {
		return;
	}
	publishForm.dataset.mediaBound = "true";

	const uploadInput = document.getElementById("video-upload");
	const startButton = document.getElementById("start-recording");
	const stopButton = document.getElementById("stop-recording");
	const clearButton = document.getElementById("clear-media");
	const recordingStatus = document.getElementById("recording-status");
	const previewWrap = document.getElementById("media-preview-wrap");
	const preview = document.getElementById("media-preview");

	if (!uploadInput || !startButton || !stopButton || !clearButton || !recordingStatus || !previewWrap || !preview) {
		return;
	}

	const mediaState = {
		uploadFile: null,
		recordedDataUrl: "",
		previewUrl: "",
		stream: null,
		recorder: null,
		chunks: [],
	};

	window.__jeoqPublishMediaState = mediaState;

	function clearPreviewUrl() {
		if (mediaState.previewUrl) {
			URL.revokeObjectURL(mediaState.previewUrl);
			mediaState.previewUrl = "";
		}
	}

	function stopTracks() {
		if (mediaState.stream) {
			mediaState.stream.getTracks().forEach((track) => track.stop());
			mediaState.stream = null;
		}
	}

	function showPreviewWithSrc(src, muted = false) {
		preview.srcObject = null;
		preview.src = src;
		preview.muted = muted;
		previewWrap.classList.remove("is-hidden");
	}

	function resetMediaSelection() {
		mediaState.uploadFile = null;
		mediaState.recordedDataUrl = "";
		mediaState.chunks = [];
		clearPreviewUrl();
		preview.pause();
		preview.removeAttribute("src");
		preview.srcObject = null;
		preview.load();
		uploadInput.value = "";
		previewWrap.classList.add("is-hidden");
		setStatus(recordingStatus, "No video selected yet.");
	}

	async function stopRecording() {
		if (!mediaState.recorder || mediaState.recorder.state === "inactive") {
			return;
		}

		await new Promise((resolve) => {
			mediaState.recorder.addEventListener("stop", resolve, { once: true });
			mediaState.recorder.stop();
		});

		stopTracks();
		startButton.disabled = false;
		stopButton.disabled = true;

		const blob = new Blob(mediaState.chunks, { type: "video/webm" });
		mediaState.chunks = [];
		if (!blob.size) {
			setStatus(recordingStatus, "No recording data captured. Please try again.");
			return;
		}

		clearPreviewUrl();
		mediaState.previewUrl = URL.createObjectURL(blob);
		showPreviewWithSrc(mediaState.previewUrl, false);
		mediaState.recordedDataUrl = await fileToDataUrl(blob);
		mediaState.uploadFile = null;
		uploadInput.value = "";
		setStatus(recordingStatus, "Recording ready. Publish to post this video.");
	}

	uploadInput.addEventListener("change", () => {
		const selected = uploadInput.files?.[0] || null;
		if (!selected) {
			resetMediaSelection();
			return;
		}

		stopTracks();
		startButton.disabled = false;
		stopButton.disabled = true;

		mediaState.uploadFile = selected;
		mediaState.recordedDataUrl = "";
		clearPreviewUrl();
		mediaState.previewUrl = URL.createObjectURL(selected);
		showPreviewWithSrc(mediaState.previewUrl, true);
		setStatus(recordingStatus, `Selected upload: ${selected.name}`);
	});

	startButton.addEventListener("click", async () => {
		try {
			stopTracks();
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			mediaState.stream = stream;
			mediaState.recorder = new MediaRecorder(stream);
			mediaState.chunks = [];
			mediaState.uploadFile = null;
			mediaState.recordedDataUrl = "";
			uploadInput.value = "";
			clearPreviewUrl();

			mediaState.recorder.addEventListener("dataavailable", (event) => {
				if (event.data && event.data.size > 0) {
					mediaState.chunks.push(event.data);
				}
			});

			preview.srcObject = stream;
			preview.muted = true;
			preview.play().catch(() => {});
			previewWrap.classList.remove("is-hidden");
			mediaState.recorder.start();
			startButton.disabled = true;
			stopButton.disabled = false;
			setStatus(recordingStatus, "Recording in progress… click Stop Recording when done.");
		} catch {
			stopTracks();
			setStatus(recordingStatus, "Could not access camera/microphone. Check browser permissions and try again.");
		}
	});

	stopButton.addEventListener("click", () => {
		stopRecording().catch(() => {
			stopTracks();
			startButton.disabled = false;
			stopButton.disabled = true;
			setStatus(recordingStatus, "Unable to finalize recording. Please try again.");
		});
	});

	clearButton.addEventListener("click", () => {
		stopTracks();
		if (mediaState.recorder && mediaState.recorder.state !== "inactive") {
			mediaState.recorder.stop();
		}
		startButton.disabled = false;
		stopButton.disabled = true;
		resetMediaSelection();
	});

	setStatus(recordingStatus, "No video selected yet.");
}

function getSavedItemsForUser(storageKey, userKey) {
	const store = loadMapStorage(storageKey);
	return Array.isArray(store[userKey]) ? store[userKey] : [];
}

function setSavedItemsForUser(storageKey, userKey, items) {
	const store = loadMapStorage(storageKey);
	store[userKey] = items;
	saveMapStorage(storageKey, store);
}

function makeAvatarDataUrl(username) {
	const safeText = (username || "U").charAt(0).toUpperCase();
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" rx="20" fill="#8ecae6"/><text x="48" y="60" text-anchor="middle" font-size="44" font-family="Segoe UI, Arial, sans-serif" font-weight="700" fill="#163547">${safeText}</text></svg>`;
	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function touchLogin(userKey) {
	const users = loadUsers();
	if (!users[userKey]) {
		return;
	}
	const now = Date.now();
	users[userKey].lastLoginAt = now;
	users[userKey].lastActiveAt = now;
	saveUsers(users);
}

function isStale(userData) {
	if (!userData?.lastLoginAt) {
		return true;
	}
	return Date.now() - userData.lastLoginAt > STALE_MS;
}

function updateNavAvatar() {
	const avatarNodes = document.querySelectorAll("#nav-avatar");
	if (avatarNodes.length === 0) {
		return;
	}
	const current = getCurrentUser();
	const src = current?.data?.avatar || "assets/jeoq-logo.svg";
	avatarNodes.forEach((node) => {
		node.src = src;
	});
}

function bindAuthForms() {
	document.querySelectorAll(".auth-form[data-auth]").forEach((form) => {
		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const mode = form.dataset.auth;
			const users = loadUsers();
			const usernameInput = form.querySelector('input[name="username"]');
			const passwordInput = form.querySelector('input[name="password"]');
			const userKey = normalizeUsername(usernameInput?.value);
			const password = String(passwordInput?.value || "").trim();

			if (!userKey || !password) {
				setStatus(authStatus, "Username and password are required.");
				return;
			}

			if (mode === "register") {
				if (users[userKey]) {
					setStatus(authStatus, "That username already exists. Please log in.");
					return;
				}

				const name = String(form.querySelector('input[name="name"]')?.value || "").trim();
				const email = String(form.querySelector('input[name="email"]')?.value || "").trim();
				const displayUsername = String(usernameInput.value).trim();

				users[userKey] = {
					username: displayUsername,
					name,
					email,
					password,
					plan: "free",
					avatar: makeAvatarDataUrl(displayUsername),
					lastLoginAt: Date.now(),
					lastActiveAt: Date.now(),
				};

				saveUsers(users);
				setCurrentUserKey(userKey);
				updateNavAvatar();
				setStatus(authStatus, "Account created and verified. You are logged in on the Free plan.");
				form.reset();
				redirect("index.html");
				return;
			}

			const account = users[userKey];
			if (!account) {
				setStatus(authStatus, "Account not found. Please register first.");
				return;
			}

			if (account.password !== password) {
				setStatus(authStatus, "Incorrect username or password.");
				return;
			}

			setCurrentUserKey(userKey);
			touchLogin(userKey);
			updateNavAvatar();
			setStatus(authStatus, "Login successful. Account verified.");
			form.reset();
			redirect("index.html");
		});
	});
}

function bindContentActions() {
	if (window.__jeoqActionsBound) {
		return;
	}
	window.__jeoqActionsBound = true;

	document.addEventListener("click", (event) => {
		const button = event.target.closest(".action-btn");
		if (!button) {
			return;
		}

		const actionKey = button.dataset.action || "";
		if (!actionKey) {
			return;
		}

		const current = getCurrentUser();
		if (!current) {
			setStatus(status, "Please register or log in first.");
			return;
		}

		touchLogin(current.key);
		const post = button.closest(".video-post");
		if (post && (actionKey === "like" || actionKey === "favorite")) {
			const contentId = post.dataset.contentId || "unknown";
			const contentTitle = post.dataset.contentTitle || "Untitled content";
			const storageKey = actionKey === "like" ? STORAGE_KEYS.liked : STORAGE_KEYS.favorited;
			const existing = getSavedItemsForUser(storageKey, current.key);
			if (!existing.some((item) => item.id === contentId)) {
				existing.push({ id: contentId, title: contentTitle });
				setSavedItemsForUser(storageKey, current.key, existing);
			}
		}

		const action = actionKey.replace(/-/g, " ");
		setStatus(status, `Action received: ${action}.`);
	});
}

function bindPublishForm() {
	const publishForm = document.getElementById("publish-form");
	const publishPanel = document.getElementById("publish-panel");
	if (!publishForm) {
		return;
	}

	bindPublishMediaTools();

	publishForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const current = getCurrentUser();
		if (!current) {
			setStatus(status, "Please register or log in before publishing content.");
			return;
		}

		touchLogin(current.key);
		const formData = new FormData(publishForm);
		const title = String(formData.get("title") || "").trim();
		const description = String(formData.get("description") || "").trim();
		const type = String(formData.get("type") || "video").trim();
		const hashtags = parseHashtags(formData.get("hashtags") || "");
		const creatorHandle = `@${current.data.username || current.key}`;
		const mediaState = window.__jeoqPublishMediaState || {};

		let mediaDataUrl = "";
		if (mediaState.uploadFile) {
			try {
				mediaDataUrl = await fileToDataUrl(mediaState.uploadFile);
			} catch {
				setStatus(status, "Could not read selected video file. Please choose another file.");
				return;
			}
		} else if (mediaState.recordedDataUrl) {
			mediaDataUrl = mediaState.recordedDataUrl;
		}

		if (type === "video" && !mediaDataUrl) {
			setStatus(status, "For video posts, upload a video or record one with camera and microphone.");
			return;
		}

		const posts = loadPostList();
		posts.unshift({
			id: `post-${Date.now()}`,
			title: description || title || "New post",
			creator: creatorHandle,
			creatorKey: normalizeUsername(current.data.username || current.key),
			hashtags: hashtags.length > 0 ? hashtags : ["#fyp"],
			sound: type === "video" ? "office_legend" : "pov_pun",
			style: posts.length % 2 === 0 ? "default" : "alt",
			mediaDataUrl,
		});
		savePostList(posts);
		renderFeed();

		setStatus(status, "Content published to your creator profile.");
		publishForm.reset();
		if (mediaState && typeof mediaState === "object") {
			mediaState.uploadFile = null;
			mediaState.recordedDataUrl = "";
			mediaState.chunks = [];
			if (mediaState.previewUrl) {
				URL.revokeObjectURL(mediaState.previewUrl);
				mediaState.previewUrl = "";
			}
			if (mediaState.stream) {
				mediaState.stream.getTracks().forEach((track) => track.stop());
				mediaState.stream = null;
			}
			const uploadInput = document.getElementById("video-upload");
			const preview = document.getElementById("media-preview");
			const previewWrap = document.getElementById("media-preview-wrap");
			const startButton = document.getElementById("start-recording");
			const stopButton = document.getElementById("stop-recording");
			const recordingStatus = document.getElementById("recording-status");

			if (uploadInput) {
				uploadInput.value = "";
			}
			if (preview) {
				preview.pause();
				preview.removeAttribute("src");
				preview.srcObject = null;
				preview.load();
			}
			if (previewWrap) {
				previewWrap.classList.add("is-hidden");
			}
			if (startButton) {
				startButton.disabled = false;
			}
			if (stopButton) {
				stopButton.disabled = true;
			}
			setStatus(recordingStatus, "No video selected yet.");
		}
		if (publishPanel) {
			publishPanel.classList.add("is-hidden");
			publishPanel.setAttribute("aria-hidden", "true");
		}
	});
}

function bindPublishToggle() {
	const openButtons = document.querySelectorAll("#open-publish");
	const closeButton = document.getElementById("close-publish");
	const publishPanel = document.getElementById("publish-panel");

	if (openButtons.length === 0 || !publishPanel) {
		return;
	}

	openButtons.forEach((button) => {
		button.addEventListener("click", (event) => {
			event.preventDefault();
			publishPanel.classList.remove("is-hidden");
			publishPanel.setAttribute("aria-hidden", "false");
		});
	});

	if (closeButton) {
		closeButton.addEventListener("click", () => {
			publishPanel.classList.add("is-hidden");
			publishPanel.setAttribute("aria-hidden", "true");
		});
	}

	publishPanel.addEventListener("click", (event) => {
		if (event.target === publishPanel) {
			publishPanel.classList.add("is-hidden");
			publishPanel.setAttribute("aria-hidden", "true");
		}
	});
}

function bindPlanButtons() {
	document.querySelectorAll(".plan-btn").forEach((button) => {
		button.addEventListener("click", () => {
			const selectedPlan = button.dataset.plan;
			const current = getCurrentUser();

			if (!current) {
				setStatus(planStatus, "Log in first so we can apply your selected plan.");
				return;
			}

			const users = loadUsers();
			if (!users[current.key]) {
				setStatus(planStatus, "Account not found. Please log in again.");
				return;
			}

			users[current.key].plan = selectedPlan === "paid" ? "paid" : "free";
			users[current.key].lastActiveAt = Date.now();
			saveUsers(users);

			if (selectedPlan === "paid") {
				setStatus(planStatus, "Paid Business plan selected. Continue to checkout.");
			} else {
				setStatus(planStatus, "Free plan selected.");
			}
		});
	});
}

function bindFeedTabs() {
	const tabs = document.querySelectorAll(".feed-tab");
	if (tabs.length === 0) {
		return;
	}

	tabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			tabs.forEach((item) => item.classList.remove("active"));
			tab.classList.add("active");
			setStatus(status, `Switched to ${tab.textContent} feed.`);
		});
	});
}

function bindVideoArrowNavigation() {
	if (window.__jeoqArrowNavBound) {
		return;
	}
	window.__jeoqArrowNavBound = true;

	document.addEventListener("keydown", (event) => {
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
			return;
		}

		const activeTag = String(document.activeElement?.tagName || "").toLowerCase();
		const isTypingField = activeTag === "input" || activeTag === "textarea" || activeTag === "select" || document.activeElement?.isContentEditable;
		if (isTypingField) {
			return;
		}

		const feedColumn = document.querySelector(".feed-column");
		const direction = event.key === "ArrowDown" ? 1 : -1;
		event.preventDefault();

		if (feedColumn) {
			const step = Math.max(220, Math.floor(feedColumn.clientHeight * 0.9));
			feedColumn.scrollBy({ top: direction * step, behavior: "smooth" });
			return;
		}

		window.scrollBy({ top: direction * Math.floor(window.innerHeight * 0.8), behavior: "smooth" });
	});
}

function renderProfilePage() {
	const profileCard = document.getElementById("profile-card");
	if (!profileCard) {
		return;
	}

	const reauthCard = document.getElementById("reauth-card");
	const reauthForm = document.getElementById("reauth-form");
	const profileUsername = document.getElementById("profile-username");
	const profileName = document.getElementById("profile-name");
	const profileEmail = document.getElementById("profile-email");
	const profilePassword = document.getElementById("profile-password");
	const profilePlan = document.getElementById("profile-plan");
	const profilePhoto = document.getElementById("profile-photo");

	function showLoginRequired(message) {
		profileCard.classList.add("hidden");
		reauthCard.classList.remove("hidden");
		setStatus(profileStatus, message);
	}

	function showProfile(userKey, userData) {
		profileCard.classList.remove("hidden");
		reauthCard.classList.add("hidden");
		profileUsername.textContent = userData.username;
		profileName.textContent = userData.name || "-";
		profileEmail.textContent = userData.email || "-";
		profilePassword.textContent = userData.password || "-";
		profilePlan.textContent = userData.plan === "paid" ? "Paid (Business)" : "Free";
		if (profilePhoto) {
			profilePhoto.src = userData.avatar || "assets/jeoq-logo.svg";
		}
		touchLogin(userKey);
		updateNavAvatar();
		setStatus(profileStatus, "Account verified. Profile details loaded.");
	}

	const current = getCurrentUser();
	if (!current) {
		showLoginRequired("No active session. Please log in to view profile details.");
	} else if (isStale(current.data)) {
		showLoginRequired("Session expired from inactivity. Please verify your account by logging in.");
	} else {
		showProfile(current.key, current.data);
	}

	if (!reauthForm) {
		return;
	}

	reauthForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const username = normalizeUsername(reauthForm.username.value);
		const password = String(reauthForm.password.value || "").trim();
		const users = loadUsers();

		if (!users[username]) {
			setStatus(profileStatus, "Account does not exist.");
			return;
		}

		if (users[username].password !== password) {
			setStatus(profileStatus, "Username or password is incorrect.");
			return;
		}

		setCurrentUserKey(username);
		touchLogin(username);
		showProfile(username, loadUsers()[username]);
		reauthForm.reset();
	});
}

function renderCreatorPage() {
	const creatorPage = document.getElementById("creator-page");
	if (!creatorPage) {
		return;
	}

	const params = new URLSearchParams(window.location.search);
	const creatorKey = (params.get("creator") || "laugh_labs").replace("@", "").toLowerCase();
	const creator = CREATOR_DIRECTORY[creatorKey] || CREATOR_DIRECTORY.laugh_labs;

	const creatorName = document.getElementById("creator-name");
	const creatorBio = document.getElementById("creator-bio");
	const creatorFollowers = document.getElementById("creator-followers");
	const creatorFollowing = document.getElementById("creator-following");
	const creatorPhoto = document.getElementById("creator-photo");

	if (creatorName) creatorName.textContent = creator.name;
	if (creatorBio) creatorBio.textContent = creator.bio;
	if (creatorFollowers) creatorFollowers.textContent = creator.followers;
	if (creatorFollowing) creatorFollowing.textContent = creator.following;
	if (creatorPhoto) creatorPhoto.src = creator.avatar;

	function handleToCreatorKey(handle) {
		return String(handle || "").replace(/^@/, "").toLowerCase();
	}

	function fillPanel(panelId, items, prefix, linkHandles = false) {
		const panel = document.getElementById(panelId);
		if (!panel) return;
		const cards = items.map((item, index) => {
			const value = linkHandles
				? `<a class="creator-handle-link" href="creator.html?creator=${handleToCreatorKey(item)}">${item}</a>`
				: item;
			return `<article class="creator-item"><p><strong>${prefix} ${index + 1}</strong></p><p>${value}</p></article>`;
		});
		panel.innerHTML = items
			.map((_, index) => cards[index])
			.join("");
	}

	fillPanel("creator-content", creator.content, "Content");
	fillPanel("creator-reposts", creator.reposts, "Repost");
	fillPanel("creator-following-list", creator.followingList, "Following", true);
	fillPanel("creator-followers-list", creator.followersList, "Follower", true);

	const tabs = document.querySelectorAll(".creator-tab");
	tabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			tabs.forEach((item) => item.classList.remove("active"));
			document.querySelectorAll(".creator-panel").forEach((panel) => panel.classList.remove("active"));
			tab.classList.add("active");
			const target = document.getElementById(tab.dataset.target || "");
			if (target) {
				target.classList.add("active");
			}
		});
	});
}

function renderSoundPage() {
	const soundPage = document.getElementById("sound-page");
	if (!soundPage) {
		return;
	}

	const params = new URLSearchParams(window.location.search);
	const soundKey = (params.get("sound") || "office_legend").toLowerCase();
	const sound = SOUND_DIRECTORY[soundKey] || SOUND_DIRECTORY.office_legend;

	const soundName = document.getElementById("sound-name");
	const soundCreator = document.getElementById("sound-creator");
	const soundPhoto = document.getElementById("sound-photo");
	const soundCount = document.getElementById("sound-count");
	const soundList = document.getElementById("sound-content-list");

	if (soundName) soundName.textContent = sound.name;
	if (soundCreator) soundCreator.textContent = `By ${sound.creator}`;
	if (soundPhoto) soundPhoto.src = sound.icon;
	if (soundCount) soundCount.textContent = String(sound.content.length);

	if (soundList) {
		const ranked = [...sound.content].sort((a, b) => b.likes - a.likes);
		soundList.innerHTML = ranked
			.map(
				(item, index) =>
					`<article class="sound-item"><p><strong>#${index + 1} ${item.title}</strong></p><p>Creator: <a class="creator-handle-link" href="creator.html?creator=${item.creator.replace("@", "")}">${item.creator}</a></p><p>Likes: ${item.likes.toLocaleString()}</p></article>`,
			)
			.join("");
	}
}

function renderSavedPage() {
	const likedList = document.getElementById("liked-list");
	const favoriteList = document.getElementById("favorite-list");
	if (!likedList || !favoriteList) {
		return;
	}

	const current = getCurrentUser();
	if (!current) {
		likedList.innerHTML = '<p class="saved-empty">Log in to view your liked content.</p>';
		favoriteList.innerHTML = '<p class="saved-empty">Log in to view your favorited content.</p>';
		return;
	}

	const likedItems = getSavedItemsForUser(STORAGE_KEYS.liked, current.key);
	const favoriteItems = getSavedItemsForUser(STORAGE_KEYS.favorited, current.key);

	function renderItems(container, items, label) {
		if (items.length === 0) {
			container.innerHTML = `<p class="saved-empty">No ${label.toLowerCase()} content yet.</p>`;
			return;
		}

		container.innerHTML = items
			.map((item, index) => `<article class="saved-item" role="listitem"><p><strong>${label} ${index + 1}</strong></p><p>${item.title}</p></article>`)
			.join("");
	}

	renderItems(likedList, likedItems, "Liked");
	renderItems(favoriteList, favoriteItems, "Favorite");
}

function renderHashtagPage() {
	const resultList = document.getElementById("hashtag-results");
	const title = document.getElementById("hashtag-title");
	if (!resultList || !title) {
		return;
	}

	const params = new URLSearchParams(window.location.search);
	const rawTag = params.get("tag") || "fyp";
	const tag = normalizeTag(rawTag);
	title.textContent = `#${tag}`;

	const related = getAllFeedContent().filter((post) =>
		(post.hashtags || []).map(normalizeTag).includes(tag),
	);

	if (related.length === 0) {
		resultList.innerHTML = `<p class="saved-empty">No posts found for #${tag} yet.</p>`;
		return;
	}

	resultList.innerHTML = related
		.map(
			(post) => {
				const hasMedia = Boolean(post.mediaDataUrl);
				const frameClass = ["video-frame", post.style === "alt" ? "alt" : "", hasMedia ? "has-media" : ""]
					.filter(Boolean)
					.join(" ");
				const mediaHtml = hasMedia
					? `<video class="post-video" playsinline controls preload="metadata" src="${post.mediaDataUrl}"></video>`
					: `<div class="no-video-placeholder" role="img" aria-label="No uploaded video">No uploaded video</div>`;

				return `<article class="video-post card-dark hashtag-post">
					<div class="${frameClass}">
						${mediaHtml}
						<p class="video-caption">"${post.title}"</p>
					</div>
					<div class="video-meta">
						<p><strong>Creator:</strong> <a class="creator-link" href="creator.html?creator=${post.creatorKey}">${post.creator}</a></p>
						<p><strong>Sound:</strong> ${getSoundLabel(post.sound)}</p>
						<p class="hashtags">${(post.hashtags || []).map(tagLinkHtml).join(" ")}</p>
					</div>
				</article>`;
			},
		)
		.join("");
}

updateNavAvatar();
ensureNewUsersStartAtRegister();
bindAuthForms();
bindContentActions();
bindPublishForm();
bindPublishToggle();
bindPlanButtons();
bindFeedTabs();
bindVideoArrowNavigation();
renderProfilePage();
renderCreatorPage();
renderSoundPage();
renderSavedPage();
renderFeed();
renderHashtagPage();
