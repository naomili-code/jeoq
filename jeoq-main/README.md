# jeoq

jeoq is a lightweight TikTok-style comedy video web app built with plain HTML, CSS, and JavaScript.

## Run locally

1. Open the project folder in VS Code.
2. Open `register.html` in your browser (or use Live Server).
3. Register a user, then log in to access the feed.

## Pages

- `register.html` — new account sign-up (entry page)
- `login.html` — sign in for existing users
- `index.html` — main feed (For You / Following), publish modal, hashtag search
- `profile.html` — current user profile and session verification
- `plans.html` — free and paid plan options
- `creator.html` — creator profile, posts/reposts/followers/following
- `sound.html` — sound details and ranked related content
- `saved.html` — liked and favorited items
- `hashtags.html` — hashtag discovery results

## Core features

- Register/login flow with local session checks
- Creator interactions: follow/unfollow, block/report on creator page
- Content interactions: like and favorite with persistence
- Publish new posts with hashtags
- Hashtag click-through and search discovery
- Saved page for liked and favorited content

## Responsive behavior

- Video cards keep a fixed `9:16` ratio while scaling down on smaller screens.
- Feed controls stay separate from video content and do not overlap on resize.
- Mobile layout centers feed cards for consistent spacing and readability.

## Notes

- Data is stored in browser `localStorage` for MVP behavior.
- No backend is required for local testing.