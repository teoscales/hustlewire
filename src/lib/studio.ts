export type Goal = {
  id: string;
  title: string;
  done: boolean;
  fromPlaybook?: boolean;
};

export type Idea = {
  id: string;
  title: string;
  notes: string;
  storySlug: string | null;
  goals: Goal[];
  createdAt: string;
};

export type Studio = {
  ideas: Idea[];
};

export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function newGoal(title: string, fromPlaybook = false): Goal {
  return {
    id: newId(),
    title: title.trim().slice(0, 120),
    done: false,
    fromPlaybook,
  };
}

export function newIdea(partial?: Partial<Idea>): Idea {
  return {
    id: partial?.id ?? newId(),
    title: (partial?.title ?? "Untitled idea").slice(0, 80),
    notes: (partial?.notes ?? "").slice(0, 800),
    storySlug: partial?.storySlug ?? null,
    goals: (partial?.goals ?? []).slice(0, 8),
    createdAt: partial?.createdAt ?? new Date().toISOString(),
  };
}

export const emptyStudio = (): Studio => ({ ideas: [] });

function parseGoal(goal: Goal): Goal {
  return {
    id: String(goal.id ?? newId()),
    title: String(goal.title ?? "").slice(0, 120),
    done: Boolean(goal.done),
    fromPlaybook: Boolean(goal.fromPlaybook),
  };
}

function parseIdea(idea: Idea): Idea {
  return newIdea({
    id: String(idea.id ?? newId()),
    title: String(idea.title ?? ""),
    notes: String(idea.notes ?? ""),
    storySlug: typeof idea.storySlug === "string" ? idea.storySlug : null,
    goals: Array.isArray(idea.goals) ? idea.goals.slice(0, 8).map(parseGoal) : [],
    createdAt: String(idea.createdAt ?? new Date().toISOString()),
  });
}

export function parseStudio(raw: string | undefined): Studio {
  if (!raw) return emptyStudio();
  try {
    const data = JSON.parse(raw) as Studio & {
      ideaTitle?: string;
      ideaNotes?: string;
      storySlug?: string | null;
      goals?: Goal[];
    };
    if (!data || typeof data !== "object") return emptyStudio();

    if (Array.isArray(data.ideas)) {
      return { ideas: data.ideas.slice(0, 8).map(parseIdea) };
    }

    if (data.ideaTitle || data.storySlug || (data.goals && data.goals.length > 0)) {
      return {
        ideas: [
          parseIdea({
            id: newId(),
            title: data.ideaTitle || "Saved idea",
            notes: data.ideaNotes ?? "",
            storySlug: data.storySlug ?? null,
            goals: data.goals ?? [],
            createdAt: new Date().toISOString(),
          }),
        ],
      };
    }

    return emptyStudio();
  } catch {
    return emptyStudio();
  }
}

export function mergePlaybookGoals(existing: Goal[], titles: string[]) {
  const goals = existing.map((goal) => ({ ...goal }));
  let added = 0;
  for (const title of titles) {
    const hit = goals.find((goal) => goal.title === title);
    if (hit) {
      hit.fromPlaybook = true;
      continue;
    }
    if (goals.length >= 8) break;
    goals.push(newGoal(title, true));
    added += 1;
  }
  return { goals, added };
}
