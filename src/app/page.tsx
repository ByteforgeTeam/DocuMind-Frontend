import { Button } from "@/components/ui/button";
import { Brain, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      {/* Hero Section */}
      <div className="mb-16">
        <div className="flex items-center mb-6">
          <Brain className="h-12 w-12 text-primary mr-4" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            DocuMind
          </h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl">
          AI-powered document assistant that allows you to interact with your
          documents conversationally
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="px-8">
            <Link href="/files">
              <FileText className="mr-2 h-5 w-5" />
              Upload Documents
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/chat">
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Chatting
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
