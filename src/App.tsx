import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { PlusCircle, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type SchemaType = {
  [key: string]:
    | 'boolean'
    | 'string'
    | 'number'
    | 'array'
    | 'date'
    | SchemaType;
};

type FormState = {
  [key: string]: any;
};

const getInitialValue = (type: string | SchemaType) => {
  if (typeof type === 'string') {
    switch (type) {
      case 'boolean':
        return false;
      case 'number':
        return 0;
      case 'array':
        return [];
      case 'date':
        return '';
      case 'string':
        return '';
      default:
        return '';
    }
  }
  return Object.entries(type).reduce((acc, [key, value]) => {
    acc[key] = getInitialValue(value);
    return acc;
  }, {} as Record<string, any>);
};

const DatePicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

const DynamicForm = ({ schema }: { schema: SchemaType }) => {
  const [formState, setFormState] = useState<FormState>(() => {
    return Object.entries(schema).reduce((acc, [key, value]) => {
      acc[key] = getInitialValue(value);
      return acc;
    }, {} as FormState);
  });

  const handleChange = (field: string, value: any) => {
    setFormState((prev) => {
      const fields = field.split('.');
      if (fields.length === 1) {
        return { ...prev, [field]: value };
      }

      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < fields.length - 1; i++) {
        if (!current[fields[i]]) {
          current[fields[i]] = {};
        }
        current[fields[i]] = { ...current[fields[i]] };
        current = current[fields[i]];
      }
      current[fields[fields.length - 1]] = value;
      return newState;
    });
  };

  const renderField = (
    name: string,
    type: string | object,
    value: any,
    path = '',
  ) => {
    const fullPath = path ? `${path}.${name}` : name;

    if (typeof type === 'string') {
      switch (type) {
        case 'boolean':
          return (
            <div
              key={fullPath}
              className="flex items-center justify-between py-4 px-2 border-b"
            >
              <label className="text-sm font-medium">{name}</label>
              <Switch
                checked={Boolean(value)}
                onCheckedChange={(checked) => handleChange(fullPath, checked)}
              />
            </div>
          );

        case 'string':
          return (
            <div key={fullPath} className="space-y-2 py-4">
              <label className="text-sm font-medium">{name}</label>
              <Input
                value={value || ''}
                onChange={(e) => handleChange(fullPath, e.target.value)}
                placeholder={`Enter ${name}`}
              />
            </div>
          );

        case 'number':
          return (
            <div key={fullPath} className="space-y-2 py-4">
              <label className="text-sm font-medium">{name}</label>
              <Input
                type="number"
                value={value ?? 0}
                onChange={(e) =>
                  handleChange(fullPath, Number(e.target.value) || 0)
                }
                placeholder={`Enter ${name}`}
              />
            </div>
          );

        case 'array':
          return (
            <div key={fullPath} className="space-y-2 py-4">
              <label className="text-sm font-medium">{name}</label>
              <div className="space-y-2">
                {(value || []).map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newArray = [...(value || [])];
                        newArray[index] = e.target.value;
                        handleChange(fullPath, newArray);
                      }}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newArray = (value || []).filter(
                          (_: any, i: number) => i !== index,
                        );
                        handleChange(fullPath, newArray);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChange(fullPath, [...(value || []), ''])}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          );

        case 'date':
          return (
            <div key={fullPath} className="space-y-2 py-4">
              <label className="text-sm font-medium">{name}</label>
              <DatePicker
                value={value || ''}
                onChange={(date) => handleChange(fullPath, date)}
              />
            </div>
          );

        default:
          return null;
      }
    } else if (typeof type === 'object') {
      return (
        <div key={fullPath} className="space-y-4 py-4">
          <h3 className="font-semibold border-b pb-2">{name}</h3>
          <div className="pl-4 border-l">
            {Object.entries(type).map(([subName, subType]) =>
              renderField(subName, subType, value?.[subName], fullPath),
            )}
          </div>
        </div>
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formState);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Dynamic Form</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(schema).map(([name, type]) =>
            renderField(name, type, formState[name]),
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={handleSubmit} className="w-full">
          Submit Form
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function App() {
  const [schemaInput, setSchemaInput] = useState('');
  const [parsedSchema, setParsedSchema] = useState<SchemaType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSchemaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSchemaInput(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      setParsedSchema(parsed);
      setError(null);
    } catch (err) {
      setParsedSchema(null);
      setError('Invalid JSON schema');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Schema Input</h2>
          <p className="text-sm text-gray-500">Enter your JSON schema below</p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={schemaInput}
            onChange={handleSchemaChange}
            placeholder={`Example:
{
  "isActive": "boolean",
  "username": "string",
  "age": "number",
  "joinDate": "date",
  "hobbies": "array",
  "address": {
    "isDefault": "boolean",
    "street": "string",
    "number": "number",
    "moveInDate": "date"
  }
}`}
            className="font-mono min-h-[200px]"
          />
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </CardContent>
      </Card>
      {parsedSchema && <DynamicForm schema={parsedSchema} />}
    </div>
  );
}
