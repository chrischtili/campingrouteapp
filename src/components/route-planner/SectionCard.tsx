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
        <CardTitle className="flex flex-col gap-1 text-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div className="flex flex-col">
              <span>{title}</span>
              {subtitle && (
                <span className="text-sm font-normal text-muted-foreground">{subtitle}</span>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );
}
