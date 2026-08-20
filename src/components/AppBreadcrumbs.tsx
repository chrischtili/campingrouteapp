import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface AppBreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function AppBreadcrumbs({ items, className = "" }: AppBreadcrumbsProps) {
  const { t } = useTranslation();
  const location = useLocation();

  // If items are not passed manually, derive automatically from current path
  const breadcrumbItems: BreadcrumbItem[] = items ? [...items] : [];

  if (!items) {
    const path = location.pathname;
    if (path === "/prompt-generator") {
      breadcrumbItems.push({ label: t("nav.planner", "Prompt-Assistent") });
    } else if (path === "/entdecken") {
      breadcrumbItems.push({ label: "Entdecken" });
    } else if (path === "/impressum") {
      breadcrumbItems.push({ label: t("imprint.title", "Impressum") });
    } else if (path === "/datenschutz") {
      breadcrumbItems.push({ label: t("privacy.title", "Datenschutz") });
    } else if (path === "/campingplatz-finder") {
      breadcrumbItems.push({ label: t("nav.campsites", "Campingplatz-Finder") });
    } else if (path === "/stellplatz-finder") {
      breadcrumbItems.push({ label: t("nav.pitches", "Stellplatz-Finder") });
    }
  }

  // Do not render breadcrumbs on home page root if no sub-items
  if (location.pathname === "/" && breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`py-2.5 px-4 sm:px-6 lg:px-8 border-b border-gray-100 bg-gray-50/60 dark:border-slate-800/60 dark:bg-slate-900/40 text-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap text-sm">
        <Link
          to="/"
          className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold transition-colors"
        >
          {t("breadcrumb.home", "Startseite")}
        </Link>

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <div key={index} className="flex items-center gap-2">
              <span className="text-gray-400 dark:text-slate-600 font-normal">/</span>
              {isLast ? (
                <span className="text-gray-700 dark:text-slate-300 font-medium">
                  {item.label}
                </span>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ) : item.path ? (
                <Link
                  to={item.path}
                  className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-700 dark:text-slate-300 font-medium">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
