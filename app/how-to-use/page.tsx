import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Rocket, 
    Lightbulb, 
    Users, 
    Handshake, 
    ShieldCheck, 
    Cpu, 
    Bot, 
    ShoppingCart, 
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";

export const metadata = {
  title: "Guide: How to Improve Creativity with DIY Projects | School's DIY Hub",
  description: "Discover exactly how to improve creativity using School's DIY Hub. A comprehensive guide on starting projects, using Louis AI, and securing sponsorships.",
};

export default function HowToUsePage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
          <Rocket className="h-3 w-3" /> The Inventor's Manual
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter">
          How to Master <span className="text-primary italic">Innovation.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Learn how to use the world's best site to improve creativity. From your first sketch to a global venture, we guide you every step of the way.
        </p>
      </section>

      {/* Core Goals */}
      <section className="space-y-12">
        <div className="text-center">
            <h2 className="text-4xl font-bold font-headline">Core Creativity Goals</h2>
            <p className="text-muted-foreground mt-2">The mission driving your success on this platform.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            {[
                { 
                    icon: Lightbulb, 
                    title: "Improve Creativity", 
                    desc: "Tools designed to help you think outside the box and solve complex problems with simple materials." 
                },
                { 
                    icon: Cpu, 
                    title: "Build Real Skills", 
                    desc: "Master Arduino, Python, and mechanical engineering through hands-on project creation." 
                },
                { 
                    icon: Handshake, 
                    title: "Access Funding", 
                    desc: "Connect your creative solutions directly with sponsors who want to back the next big thing." 
                }
            ].map((goal, i) => (
                <Card key={i} className="bg-card/50 border-primary/10 text-center p-8 hover:border-primary/40 transition-all">
                    <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <goal.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-2xl mb-4">{goal.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{goal.desc}</CardDescription>
                </Card>
            ))}
        </div>
      </section>

      {/* User Journeys */}
      <section className="space-y-12 bg-primary/5 rounded-[3rem] p-12 md:p-20 border border-primary/10">
        <header className="text-center space-y-4">
            <h2 className="text-5xl font-bold font-headline tracking-tight">Your Innovation Journey</h2>
            <p className="text-xl text-muted-foreground">Select the path that describes your role in the Hub.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12 pt-8">
            {/* Innovator Path */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 text-2xl font-bold font-headline text-primary">
                    <Rocket className="h-8 w-8" />
                    <h3>The Innovator</h3>
                </div>
                <ul className="space-y-6">
                    {[
                        { step: "Register Profile", desc: "Create your verified maker account to start your laboratory." },
                        { step: "Boost Creativity", desc: "Use the AI Lab to get mentorship, material lists, and debugging code." },
                        { step: "Public Showcase", desc: "Record your invention and publish it to attract global attention." },
                        { step: "Secure Backing", desc: "Receive real-time gifts and secure long-term venture sponsorship." }
                    ].map((item, i) => (
                        <li key={i} className="flex gap-4">
                            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-xs">{i+1}</div>
                            <div>
                                <p className="font-bold">{item.step}</p>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Mentor Path */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 text-2xl font-bold font-headline text-accent">
                    <ShieldCheck className="h-8 w-8" />
                    <h3>The Mentor</h3>
                </div>
                <ul className="space-y-6">
                    {[
                        { step: "Verify School", desc: "Scan institutional documents to unlock administrative tools." },
                        { step: "Manage Pupils", desc: "Register students under your supervision for a safe creative environment." },
                        { step: "Review Projects", desc: "Oversee innovations before they go national in the news feed." },
                        { step: "Nominate Winners", desc: "Send the best creative projects for newspaper and media spotlights." }
                    ].map((item, i) => (
                        <li key={i} className="flex gap-4">
                            <div className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 font-bold text-xs">{i+1}</div>
                            <div>
                                <p className="font-bold">{item.step}</p>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Partner Path */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 text-2xl font-bold font-headline text-foreground">
                    <Handshake className="h-8 w-8 text-primary" />
                    <h3>The Venture Firm</h3>
                </div>
                <ul className="space-y-6">
                    {[
                        { step: "Register Firm", desc: "Create a partner profile outlining your investment and mentor interests." },
                        { step: "Spot Talent", desc: "Filter creative projects by community impact and innovation score." },
                        { step: "Fund Makers", desc: "Send direct capital backing or offer technical partnership." },
                        { step: "Scale Results", desc: "Track your portfolio of student-led innovations in the dashboard." }
                    ].map((item, i) => (
                        <li key={i} className="flex gap-4">
                            <div className="h-8 w-8 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 font-bold text-xs">{i+1}</div>
                            <div>
                                <p className="font-bold">{item.step}</p>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </section>

      {/* Platform Features Deep Dive */}
      <section className="space-y-12">
        <h2 className="text-4xl font-bold font-headline text-center">Tools to Boost Creativity</h2>
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-[2.5rem] overflow-hidden border-primary/5 bg-card/30">
                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold font-headline">Louis AI Engineer</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed italic">
                        "I am Louis, your digital mentor. I don't just provide answers—I help you improve creativity by guiding your engineering logic and project scaling."
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> Advanced multi-language coding help</div>
                        <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> Step-by-step project blueprints</div>
                        <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> Circuit analysis via photo scan</div>
                    </div>
                </div>
            </Card>

            <Card className="rounded-[2.5rem] overflow-hidden border-primary/5 bg-card/30">
                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold font-headline">The Global Supply Lab</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                        To improve creativity, you need the right tools. Our Supply Lab connects you with retailers like Jumia and Amazon for the best maker components.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> Direct one-click component links</div>
                        <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> Local sourcing guides for school supplies</div>
                        <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-green-500" /> Component sharing community (coming soon)</div>
                    </div>
                </div>
            </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-12 space-y-8">
            <h2 className="text-5xl font-bold font-headline">Ready to Lead Innovation?</h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">Join the world's best site to improve creativity today. Your first masterpiece starts here.</p>
             <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="h-16 px-12 text-xl font-headline shadow-2xl shadow-primary/20">
                    <NextLink href="/signup">Join the Creative Hub</NextLink>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-16 px-12 text-xl font-headline">
                   <NextLink href="/projects">Explore Student Showcase</NextLink>
                </Button>
            </div>
      </section>
    </div>
  );
}
