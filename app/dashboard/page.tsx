import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

export default function Page() {
  return (
    <div className="grow flex items-center justify-center h-full">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-3">
              <FolderKanban className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Select a Project to Start
            </h2>
            <p className="text-muted-foreground">
              Choose a project from the sidebar to view tasks, collaborate with
              your team, and track progress.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
