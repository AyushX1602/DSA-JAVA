import { cn } from '@/lib/utils';

export function Accordion({ children, className }) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

export function AccordionItem({ value, children }) {
  return (
    <div data-value={value} className="border rounded-md">
      {children}
    </div>
  );
}

export function AccordionTrigger({ children }) {
  return (
    <div className="w-full cursor-pointer p-3 font-medium border-b bg-muted/40">
      {children}
    </div>
  );
}

export function AccordionContent({ children }) {
  return <div className="p-3">{children}</div>;
}

export default Accordion;
