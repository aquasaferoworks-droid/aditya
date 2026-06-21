
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Plus } from 'lucide-react';

type ContactInfoProps = React.ComponentProps<'div'> & {
  icon: LucideIcon;
  label: string;
  value: string;
};

type ContactCardProps = React.ComponentProps<'div'> & {
  title?: string;
  description?: string;
  contactInfo?: ContactInfoProps[];
  formSectionClassName?: string;
};

export function ContactCard({
  title = 'Contact Us',
  description = 'Have a project in mind? We\'d love to hear from you. We typically respond within one business day.',
  contactInfo,
  className,
  formSectionClassName,
  children,
  ...props
}: ContactCardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-white/10 relative grid h-full w-full shadow-2xl md:grid-cols-2 lg:grid-cols-3 rounded-none overflow-visible bg-black',
        className,
      )}
      {...props}
    >
      {/* Cinematic Corner Accents */}
      <Plus className="absolute -top-3 -left-3 h-6 w-6 text-primary z-20 pointer-events-none" />
      <Plus className="absolute -top-3 -right-3 h-6 w-6 text-primary z-20 pointer-events-none" />
      <Plus className="absolute -bottom-3 -left-3 h-6 w-6 text-primary z-20 pointer-events-none" />
      <Plus className="absolute -right-3 -bottom-3 h-6 w-6 text-primary z-20 pointer-events-none" />

      <div className="flex flex-col justify-between lg:col-span-2">
        <div className="relative h-full space-y-8 px-8 py-12 md:p-16">
          <h2 className="text-4xl md:text-7xl font-headline italic font-bold uppercase tracking-tighter text-white">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-xl text-base md:text-lg font-body leading-relaxed border-l-2 border-primary/20 pl-6">
            {description}
          </p>
          <div className="grid gap-10 md:grid-cols-1 lg:grid-cols-2 pt-12">
            {contactInfo?.map((info, index) => (
              <ContactInfo key={index} {...info} />
            ))}
          </div>
        </div>
      </div>
      <div
        className={cn(
          'bg-white/[0.01] flex h-full w-full items-center border-t border-white/10 p-8 md:col-span-1 md:border-t-0 md:border-l',
          formSectionClassName,
        )}
      >
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}

function ContactInfo({
  icon: Icon,
  label,
  value,
  className,
  ...props
}: ContactInfoProps) {
  return (
    <div className={cn('flex items-center gap-6 py-2 group', className)} {...props}>
      <div className="bg-primary/5 rounded-none p-4 border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] tracking-[0.4em] uppercase text-primary/60 font-bold">{label}</p>
        <p className="text-foreground text-sm font-medium font-body truncate max-w-[250px]">{value}</p>
      </div>
    </div>
  );
}
