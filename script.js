const status = document.getElementById("status");
const planStatus = document.getElementById("plan-status");
const profileStatus = document.getElementById("profile-status");
const authStatus = document.getElementById("auth-status");

const STORAGE_KEYS = {
	users: "jeoq-users",
	currentUser: "jeoq-current-user",
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
	document.querySelectorAll(".action-btn").forEach((button) => {
		button.addEventListener("click", () => {
			const current = getCurrentUser();
			if (!current) {
				setStatus(status, "Please register or log in first.");
				return;
			}

			touchLogin(current.key);
			const action = button.dataset.action?.replace(/-/g, " ");
			setStatus(status, `Action received: ${action}.`);
		});
	});
}

function bindPublishForm() {
	const publishForm = document.getElementById("publish-form");
	const publishPanel = document.getElementById("publish-panel");
	if (!publishForm) {
		return;
	}

	publishForm.addEventListener("submit", (event) => {
		event.preventDefault();
		const current = getCurrentUser();
		if (!current) {
			setStatus(status, "Please register or log in before publishing content.");
			return;
		}

		touchLogin(current.key);
		setStatus(status, "Content published to your creator profile.");
		publishForm.reset();
		if (publishPanel) {
			publishPanel.classList.add("is-hidden");
			publishPanel.setAttribute("aria-hidden", "true");
		}
	});
}

function bindPublishToggle() {
	const openButtons = document.querySelectorAll("#open-publish, [data-open-publish='true']");
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

updateNavAvatar();
ensureNewUsersStartAtRegister();
bindAuthForms();
bindContentActions();
bindPublishForm();
bindPublishToggle();
bindPlanButtons();
bindFeedTabs();
renderProfilePage();
renderCreatorPage();
