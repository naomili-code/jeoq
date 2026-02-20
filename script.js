const status = document.getElementById("status");
const planStatus = document.getElementById("plan-status");

function setStatus(target, message) {
	if (target) {
		target.textContent = message;
	}
}

document.querySelectorAll(".auth-form").forEach((form) => {
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const mode = form.dataset.auth;
		if (mode === "register") {
			setStatus(status, "Account created. Free plan is active by default.");
		} else {
			setStatus(status, "Logged in successfully.");
		}
		form.reset();
	});
});

document.querySelectorAll(".action-btn").forEach((button) => {
	button.addEventListener("click", () => {
		const action = button.dataset.action?.replace("-", " ");
		setStatus(status, `Action received: ${action}.`);
	});
});

const publishForm = document.getElementById("publish-form");
if (publishForm) {
	publishForm.addEventListener("submit", (event) => {
		event.preventDefault();
		setStatus(status, "Content published to your creator profile.");
		publishForm.reset();
	});
}

document.querySelectorAll(".plan-btn").forEach((button) => {
	button.addEventListener("click", () => {
		const selectedPlan = button.dataset.plan;
		if (selectedPlan === "paid") {
			setStatus(planStatus, "Paid Business plan selected. Continue to checkout.");
		} else {
			setStatus(planStatus, "Free plan selected.");
		}
	});
});
