import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Award, TrendingUp, CheckCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Landing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation(user.role === "student" ? "/dashboard" : "/recruiter/search");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto z-10"
        >
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-6">
            MÉRITO es la nueva forma de mostrar tu talento
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground">
            Dynamic Professional Identity <br className="hidden md:block" />
            <span className="text-primary">Based on Evidence.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop relying on a static CV. Prove your talent through real projects, SAR experiences, and measurable competence scores. 
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
                Log In
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How MÉRITO works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We help you build a compelling professional identity by focusing on what you can actually do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Briefcase className="w-10 h-10 text-primary" />}
              title="Real Projects"
              description="Showcase your portfolio with detailed problem-solution-impact narratives, not just a list of links."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Award className="w-10 h-10 text-primary" />}
              title="SAR Experiences"
              description="Document your Situation, Action, and Result for behavioral achievements that stand out."
              delay={0.2}
            />
            <FeatureCard 
              icon={<TrendingUp className="w-10 h-10 text-primary" />}
              title="Competence Score"
              description="Earn an objective score based on your projects, skills, validations, and activity."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">The Platform for Ambitious Talent</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="10k+" label="Students" />
            <StatItem value="50k+" label="Projects" />
            <StatItem value="15k+" label="Validations" />
            <StatItem value="500+" label="Companies" />
          </div>
        </div>
      </section>

      {/* Dual Value Prop */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-3xl font-bold">For Students</h3>
            <p className="text-lg text-muted-foreground">
              Make your invisible talent visible. Build a portfolio that speaks for itself, get validated by peers, and apply to micro-projects that turn into real job offers.
            </p>
            <ul className="space-y-3 pt-4">
              {['Build an evidence-based portfolio', 'Earn a dynamic competence score', 'Apply to exclusive micro-projects'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-3xl font-bold">For Recruiters</h3>
            <p className="text-lg text-muted-foreground">
              Perform blind talent searches focused purely on skill and competence. Avoid bias and find candidates who can actually deliver results.
            </p>
            <ul className="space-y-3 pt-4">
              {['Blind talent search without bias', 'Filter by verified competence scores', 'See real code and projects instantly'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-4 bg-muted/50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to prove your talent?</h2>
          <p className="text-xl text-muted-foreground mb-10">Join MÉRITO today and build your dynamic professional identity.</p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full">
              Create Your Profile
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div>
      <div className="text-4xl md:text-5xl font-extrabold mb-2">{value}</div>
      <div className="text-primary-foreground/80 font-medium">{label}</div>
    </div>
  );
}
