import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-background/50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="absolute bottom-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl mb-6">
          Welcome to <span className="text-primary">Raji</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Streamline your projects, boost collaboration, and achieve your goals
          with Raji - the intuitive project management tool inspired by Jira.
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
          <Button asChild size="lg">
            <Link href="/sign-up">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
      <div className="mt-16 max-w-2xl text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Why Choose Raji?
        </h2>
        <ul className="text-left text-muted-foreground space-y-2">
          <li className="flex items-center">
            <ArrowRight className="mr-2 h-5 w-5 text-primary" />
            Intuitive task management and tracking
          </li>
          <li className="flex items-center">
            <ArrowRight className="mr-2 h-5 w-5 text-primary" />
            Customizable workflows to fit your team's needs
          </li>
          <li className="flex items-center">
            <ArrowRight className="mr-2 h-5 w-5 text-primary" />
            Real-time collaboration and communication tools
          </li>
          <li className="flex items-center">
            <ArrowRight className="mr-2 h-5 w-5 text-primary" />
            Comprehensive reporting and analytics
          </li>
        </ul>
      </div>
    </div>
  );
}
