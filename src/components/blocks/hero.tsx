export default function Hero() {
  return (
    <section>
      <h1 className="text-4xl font-mono mb-6 flex items-center gap-3 flex-wrap">
        xiwu
        <span className="bg-foreground text-background text-base px-2 py-0.5">
          PM / Founder / Full-stack_
        </span>
      </h1>
      <div className="space-y-4 text-foreground/90 leading-relaxed max-w-2xl">
        <p>
          I'm a software engineer, passionate about building great web
          experiences.
        </p>
        <p>I love turning ideas into clean, user-friendly code.</p>
        <p>
          My background gives me a unique perspective on structure and design.
        </p>
      </div>
    </section>
  );
}
