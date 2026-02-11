import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  iconColor?: string;
  titleColor?: string;
}

export function SectionCard({ icon, title, subtitle, children, className = "", iconColor = "text-2xl", titleColor = "" }: SectionCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-card border-b border-border">
        <CardTitle className="flex flex-col gap-1 text-lg">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`} style={{ backgroundColor: 'rgb(50, 110, 89)' }}>
              {icon}
            </div>
            <div className="flex flex-col">
              <span className={titleColor} style={{ color: 'rgb(50, 110, 89)' }}>{title}</span>
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
