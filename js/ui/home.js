import { store, canClaimDailyLogin, claimDailyLogin } from "../state.js";
import { navigate } from "../router.js";
import { el, toast } from "../utils.js";

const HOME_ACTIONS = [
  { route: "pull", icon: "🎴", title: "Pull", desc: "Summon new characters and gear." },
  { route: "roster", icon: "🧑‍🤝‍🧑", title: "Roster", desc: "Browse your collection." },
  { route: "team", icon: "🛡️", title: "Team Builder", desc: "Arrange your active squad." },
  { route: "battle", icon: "⚔️", title: "Battle", desc: "Clear stages, earn rewards." },
  { route: "shop", icon: "🛒", title: "Shop", desc: "Spend gold and gems." }
];

export function renderHome(container) {
  const state = store.state;

  const streakRow = el("div", { class: "home-hero__streak" }, [
    el("div", {}, [
      el("h3", {}, "Daily Login"),
      el("p", { class: "text-muted" }, `Current streak: Day ${state.dailyLogin.streak || 0}`)
    ]),
    canClaimDailyLogin(state)
      ? el("button", {
          class: "btn btn-primary",
          onclick: () => {
            const result = store.update((s) => claimDailyLogin(s));
            if (result) {
              const rewardText = Object.entries(result.reward)
                .map(([k, v]) => `${v} ${k === "gems" ? "Gems" : "Stamina Key"}`)
                .join(", ");
              toast(`Day ${result.streak} reward: ${rewardText}`, "success");
            }
          }
        }, "Claim Reward")
      : el("span", { class: "badge" }, "Claimed today")
  ]);

  const claimable = canClaimDailyLogin(state);
  const claimedCount = state.dailyLogin.streak;
  const todayDay = claimable ? Math.min(claimedCount + 1, 7) : claimedCount;

  const days = el("div", { class: "daily-days" },
    Array.from({ length: 7 }, (_, i) => {
      const day = i + 1;
      const claimed = claimable ? day <= claimedCount : day <= claimedCount;
      const isToday = day === todayDay && claimable;
      return el("div", { class: `daily-day ${claimed ? "is-claimed" : ""} ${isToday ? "is-today" : ""}` }, [
        el("span", {}, `Day ${day}`),
        el("span", {}, claimed ? "✓" : "·")
      ]);
    })
  );

  const actions = el("div", { class: "home-actions" },
    HOME_ACTIONS.map((action) =>
      el("button", { class: "home-action-card", onclick: () => navigate(action.route) }, [
        el("span", { class: "home-action-card__icon" }, action.icon),
        el("span", { class: "home-action-card__title" }, action.title),
        el("span", { class: "home-action-card__desc" }, action.desc)
      ])
    )
  );

  container.append(
    el("div", { class: "screen" }, [
      el("div", { class: "screen__header" }, [
        el("h1", { class: "screen__title" }, "Welcome back"),
        el("p", { class: "screen__subtitle" }, "Your adventure hub — pull, build your team, and battle.")
      ]),
      el("div", { class: "panel home-hero" }, [streakRow, days]),
      actions
    ])
  );
}
