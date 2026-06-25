import { SkillCategory } from "@/lib/types";
import { SkillBar } from "./SkillBar";

export function Skills({ categories }: { categories: SkillCategory[] }) {
  return (
    <section id="skills" className="section-padding container-luxury bg-muted/30">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Skills</p>
      <h2 className="mt-4 font-display text-display-2 font-semibold tracking-tight">
        Tools of the trade
      </h2>

      <div className="mt-16 grid gap-16 md:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id}>
            <h3 className="mb-8 font-display text-2xl font-semibold">{category.name}</h3>
            <div className="space-y-8">
              {category.skills.map((skill) => (
                <SkillBar key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
