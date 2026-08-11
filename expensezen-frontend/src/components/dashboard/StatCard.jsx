function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "green",
}) {
  return (
    <article className="stat-card">
      <div>
        <span className="stat-title">{title}</span>
        <strong className="stat-value">{value}</strong>
        <span className="stat-description">{description}</span>
      </div>

      <span className={`stat-icon ${tone}`}>
        <Icon size={23} />
      </span>
    </article>
  );
}

export default StatCard;