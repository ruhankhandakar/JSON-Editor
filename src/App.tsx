import { useState, useEffect, useCallback, memo } from 'react';
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

// Types
type SchemaType = {
  [key: string]: string | SchemaType | SchemaType[];
};

type FormState = {
  [key: string]: any;
};

// Utility function to generate initial values
const getInitialValue = (schema: any): any => {
  if (Array.isArray(schema)) {
    return [];
  }
  if (typeof schema === 'string') {
    switch (schema) {
      case 'boolean':
        return false;
      case 'number':
        return 0;
      case 'date':
        return '';
      case 'string':
        return '';
      default:
        return '';
    }
  }
  if (typeof schema === 'object') {
    return Object.entries(schema).reduce((acc, [key, value]) => {
      acc[key] = getInitialValue(value);
      return acc;
    }, {} as Record<string, any>);
  }
  return '';
};

// Generic Field Wrapper
const FieldWrapper = memo(({ name, error, children }: any) => (
  <div className="space-y-2 py-4">
    <label className="text-sm font-medium">{name}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
));

FieldWrapper.displayName = 'FieldWrapper';

// Field Components
const Fields = {
  boolean: memo(({ name, value, onChange }: any) => (
    <div className="flex items-center justify-between py-4 px-2 border-b">
      <label className="text-sm font-medium">{name}</label>
      <Switch checked={Boolean(value)} onCheckedChange={onChange} />
    </div>
  )),

  string: memo(({ name, value, onChange }: any) => (
    <FieldWrapper name={name}>
      <Input value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </FieldWrapper>
  )),

  number: memo(({ name, value, onChange }: any) => (
    <FieldWrapper name={name}>
      <Input
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </FieldWrapper>
  )),

  date: memo(({ name, value, onChange }: any) => (
    <FieldWrapper name={name}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
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
            onSelect={(date) =>
              onChange(date ? format(date, 'yyyy-MM-dd') : '')
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  )),
};

Object.keys(Fields).forEach((key) => {
  Fields[key as keyof typeof Fields].displayName = `${key}Field`;
});

// Dynamic Form Component
const DynamicForm = memo(
  ({
    schema,
    formState,
    onChange,
    path = '',
  }: {
    schema: SchemaType;
    formState: FormState;
    onChange: (newState: FormState) => void;
    path?: string;
  }) => {
    const handleChange = useCallback(
      (key: string, value: any) => {
        onChange({
          ...formState,
          [key]: value,
        });
      },
      [formState, onChange],
    );

    const renderField = useCallback(
      (key: string, fieldSchema: any) => {
        const currentPath = path ? `${path}.${key}` : key;
        const value = formState[key];

        if (Array.isArray(fieldSchema)) {
          return (
            <div key={currentPath} className="space-y-4">
              <label className="text-sm font-medium">{key}</label>
              <div className="space-y-4">
                {(value || []).map((item: any, index: number) => (
                  <div
                    key={`${currentPath}-${index}`}
                    className="relative p-4 border rounded-lg"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newArray = value.filter(
                          (_: any, i: number) => i !== index,
                        );
                        handleChange(key, newArray);
                      }}
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <DynamicForm
                      schema={fieldSchema[0]}
                      formState={item}
                      onChange={(newItemState) => {
                        const newArray = [...value];
                        newArray[index] = newItemState;
                        handleChange(key, newArray);
                      }}
                      path={`${currentPath}.${index}`}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newItem = getInitialValue(fieldSchema[0]);
                    handleChange(key, [...(value || []), newItem]);
                  }}
                  className="w-full"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add {key}
                </Button>
              </div>
            </div>
          );
        }

        if (typeof fieldSchema === 'string') {
          const Field = Fields[fieldSchema as keyof typeof Fields];
          return Field ? (
            <Field
              key={currentPath}
              name={key}
              value={value}
              onChange={(newValue: any) => handleChange(key, newValue)}
            />
          ) : null;
        }

        if (typeof fieldSchema === 'object') {
          return (
            <div key={currentPath} className="space-y-4 border-l pl-4 mt-4">
              <h3 className="font-semibold">{key}</h3>
              <DynamicForm
                schema={fieldSchema}
                formState={value || {}}
                onChange={(newValue) => handleChange(key, newValue)}
                path={currentPath}
              />
            </div>
          );
        }
      },
      [formState, handleChange, path],
    );

    return (
      <div className="space-y-6">
        {Object.entries(schema).map(([key, fieldSchema]) =>
          renderField(key, fieldSchema),
        )}
      </div>
    );
  },
);

DynamicForm.displayName = 'DynamicForm';

// Main App Component
export default function App() {
  const [schema, setSchema] = useState<string>('');
  const [parsedSchema, setParsedSchema] = useState<SchemaType | null>(null);
  const [formState, setFormState] = useState<FormState>({});
  const [isJsonView, setIsJsonView] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (schema) {
        const parsed = JSON.parse(schema);
        setParsedSchema(parsed);
        setFormState(getInitialValue(parsed));
        setError(null);
      }
    } catch (e) {
      setError('Invalid schema JSON');
      setParsedSchema(null);
    }
  }, [schema]);

  useEffect(() => {
    if (!isJsonView) {
      setJsonData(JSON.stringify(formState, null, 2));
    }
  }, [formState, isJsonView]);

  const handleJsonChange = useCallback((value: string) => {
    setJsonData(value);
    try {
      const parsed = JSON.parse(value);
      setFormState(parsed);
      setError(null);
    } catch (e) {
      setError('Invalid JSON data');
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Schema Definition</h2>
        </CardHeader>
        <CardContent>
          <Textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder="Enter your schema JSON..."
            className="font-mono min-h-[200px]"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {parsedSchema && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Dynamic Form</h2>
              <div className="flex items-center gap-2">
                <span>JSON</span>
                <Switch
                  checked={!isJsonView}
                  onCheckedChange={(checked) => setIsJsonView(!checked)}
                />
                <span>Form</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isJsonView ? (
              <Textarea
                value={jsonData}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="font-mono min-h-[400px]"
              />
            ) : (
              <DynamicForm
                schema={parsedSchema}
                formState={formState}
                onChange={setFormState}
              />
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => console.log(formState)}
              className="w-full"
              disabled={!!error}
            >
              Submit
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
