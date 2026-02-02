import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ icon, title, subtitle, children, className = "" }: SectionCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-card border-b border-border">
        <CardTitle className="flex items-center gap-3 text-lg">
          <span className="text-2xl">{icon}</span>
          <span>{title}</span>
          {subtitle && (
            <span className="text-sm font-normal text-muted-foreground ml-auto">{subtitle}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );
}
