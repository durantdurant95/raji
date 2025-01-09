"use client"
import { Separator } from '@radix-ui/react-separator';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { SidebarTrigger } from './ui/sidebar';


export default function Header() {
    const pathName = usePathname();
    const pathSegments = pathName ? pathName.split("/").filter(Boolean).map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)) : [];
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
    <div className="flex items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {pathSegments.map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 1).join("/");
            return (
              <Fragment key={index}>
                <BreadcrumbItem>
                  {index === pathSegments.length - 1 ? (
                      <BreadcrumbPage>{segment}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink href={href}>{segment}</BreadcrumbLink>
                    )}
                </BreadcrumbItem>
                {index < pathSegments.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                )}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </header>
  )
}