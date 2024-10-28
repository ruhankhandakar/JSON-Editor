import { memo } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import FieldWrapper from './FieldWrapper';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const Fields = {
  boolean: memo(({ name, value, onChange }: any) => (
    <div className="shadow-md p-4 mb-4">
      <div className="flex items-center justify-between py-4 px-2 border-b mr-10">
        <label className="text-sm font-medium">{name}</label>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} />
      </div>
    </div>
  )),

  string: memo(({ name, value, onChange }: any) => (
    <div className="shadow-md p-4 mb-4">
      <FieldWrapper name={name}>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="!shadow-none"
        />
      </FieldWrapper>
    </div>
  )),

  number: memo(({ name, value, onChange }: any) => (
    <div className="shadow-md p-4 mb-4">
      <FieldWrapper name={name}>
        <Input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="!shadow-none"
        />
      </FieldWrapper>
    </div>
  )),

  date: memo(({ name, value, onChange }: any) => (
    <div className="shadow-md p-4 mb-4">
      <FieldWrapper name={name}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal shadow-none',
                !value && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                format(new Date(value), 'PPP')
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value ? new Date(value) : undefined}
              onSelect={(date) =>
                onChange(date ? format(date, 'yyyy-MM-dd') : '')
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </FieldWrapper>
    </div>
  )),
};

Object.keys(Fields).forEach((key) => {
  Fields[key as keyof typeof Fields].displayName = `${key}Field`;
});

export default Fields;
