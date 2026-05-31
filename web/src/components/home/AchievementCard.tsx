import type { Achievement } from "@/lib/content/achievements";

interface Props {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: Props) {
  return (
    <div className="achievement-card">
      <div className="flex justify-between items-start">
        <div>
          <span className={"achievement-badge " + achievement.badgeClass}>
            {achievement.badgeEmoji} {achievement.badgeLabel}
          </span>
          <h3 className="achievement-title">
            <a href={achievement.githubUrl} target="_blank" rel="noopener">
              {achievement.title}
            </a>
          </h3>
          <p className="achievement-event">{achievement.fullEvent}</p>
        </div>
        <span className="achievement-prize">{achievement.formattedPrize}</span>
      </div>
      <p className="achievement-desc">{achievement.description}</p>
    </div>
  );
}
